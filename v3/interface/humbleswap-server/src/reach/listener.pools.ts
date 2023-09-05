import { Token } from '@prisma/client'
import {
  fetchLiquidityPool,
  ReachToken,
  subscribeToPoolStream,
  TransactionResult,
  FetchPoolData,
  parseAddress,
  isNetworkToken,
} from '@reach-sh/humble-sdk'
import {
  getAnnouncers,
  getBlockchain,
} from '@reach-sh/humble-sdk/lib/constants'
import axios from 'axios'
import { upsertPool, UpsertPoolOpts } from '../graphql/services/Pools.service'
import { globalReachAccount } from '../graphql/services/Reach.service'
import {
  getTokenById,
  makeNetworkToken,
} from '../graphql/services/Tokens.service'
import { PoolVolumeAPR, VestigeAPRVolumeData } from '../graphql/types.shared'
import { chainIdentifiers } from '../graphql/utils'
import logger from '../logger'

let timeout: NodeJS.Timeout
const tokenIds = new Set<string>('0')
const pairNames = new Set<string>()
const poolsMap = new Map<string, [any, any]>()
const contractsMap = new Map<string, any>()
const poolVolumes: PoolVolumeAPR = new Map()
const allTokens = new Map<string, Token>()
let poolsFetched = 0
let tokensFetched = 1
const networkToken = () => makeNetworkToken(getBlockchain())

const resetTimeout = (doNext: () => any, wait = 1500) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(doNext, wait)
}

// Main updater function
export function initPools() {
  allTokens.set('0', networkToken())
  const acc = globalReachAccount()

  subscribeToPoolStream(acc, {
    includeTokens: true,
    async onPoolReceived([poolId, tokAId, tokBId]: any) {
      resetTimeout(runUpdateCycle, 1500)
      tokenIds.add(tokAId.toString())
      tokenIds.add(tokBId.toString())
      poolsMap.set(poolId.toString(), [tokAId, tokBId])
    },
  })
}

export default initPools

/** Refresh a single pool's data from blockchain */
export async function refreshPool(id: string, tokA: string, tokB: string) {
  const acc = globalReachAccount()
  const token = (id: string) => {
    if (isNetworkToken(id)) return Promise.resolve(networkToken())
    const tok = allTokens.get(id) || allTokens.get(parseAddress(id).toString())
    if (tok) return Promise.resolve(tok)
    return getTokenById({ id })
  }
  const [A, B] = await Promise.all([token(tokA), token(tokB)])

  // Fetch the Pool and return only relevant data
  return fetchLiquidityPool(acc, {
    contract: contractsMap.get(id),
    includeTokens: false,
    tokens: [A, B] as [ReachToken, ReachToken],
    poolAddress: id,
    n2nn: tokA === '0',
  }).then(onPoolReceived)
}

/** Get pool volume data from Vestige.fi */
export async function fetchPoolVolumes() {
  const VESTIGE_API =
    'https://free-api.vestige.fi/pools/H2/volumes?currency=USD'
  const vols: VestigeAPRVolumeData[] = await axios
    .get(VESTIGE_API)
    .then((res) => res.data)

  for (let aprVol of vols) {
    const key = aprVol.application_id.toString()
    poolVolumes.set(key, aprVol)
  }

  logData('volumes', poolVolumes.size)
}

/** Fetch all unique pool tokens  */
async function fetchPoolTokens() {
  const tokens = await Promise.all(
    [...tokenIds].map((id) => getTokenById({ id })),
  )

  // Update shared map for pool-fetch
  tokens.forEach((token) => {
    if (!token) return
    allTokens.set(token.id, token)
    resetTimeout(logTokensFetched, 1000)
    tokensFetched += 1
  })
}

type PoolDataLabel = 'pools' | 'tokens' | 'volumes'

function logData(name: PoolDataLabel, count: number) {
  if (process.env.NODE_ENV !== 'development') return
  const now = new Date().toISOString()
  let action = count === 0 ? 'Init' : 'Upload'
  if (name === 'volumes') action = 'Fetch'
  logger.warn(`${action}.${name}:: @ ${now}`)
  logger.info(`Last processed ${count} ${name}`)
  logger.error('========================================')
}

function logTokensFetched() {
  logger.info(`TokenIds: ${tokenIds.size}`)
  logData('tokens', tokensFetched)
  tokensFetched = 0
}

function logPoolsFetched() {
  logger.info(`PoolIds: ${poolsMap.size}`)
  logData('pools', poolsFetched)
  poolsFetched = 0
}

/** Write Pool to DB */
async function onPoolReceived(poolRes: TransactionResult<FetchPoolData>) {
  const { data, poolAddress: id, contract } = poolRes
  // Store contract for reuse
  if (!id || !data?.pool) return null

  const { poolAnnouncer } = getAnnouncers()
  const poolAddress = id.toString()
  const { tokens, tradeable, pool } = data
  contractsMap.set(poolAddress, contract)
  if (!Array.isArray(tokens)) return null

  // filter duplicates if this is first batch of pool fetching
  tokenIds.add(pool.poolTokenId!.toString())

  const [{ id: tokAId }, { id: tokBId }] = tokens
  const pair = `${tokAId}/${tokBId}`
  const volume = poolVolumes.get(poolAddress)
  const newPool: UpsertPoolOpts = {
    ...pool,
    ...chainIdentifiers(),
    announcerId: poolAnnouncer!.toString(),
    duplicate: undefined,
    tradeable,
    apr7d: volume?.apr7d?.toString() || '0',
    apr24h: volume?.apr24h?.toString() || '0',
    volume7d: volume?.volume7d?.toString() || '0',
    volume24h: volume?.volume24h?.toString() || '0',
  }

  // Store Pool to db
  const result = await upsertPool(newPool)
  resetTimeout(logPoolsFetched, 1000)
  pairNames.add(pair)
  poolsFetched += 1
  return result
}

/** Update all pools and tokens */
async function runUpdateCycle() {
  // Only re-fetch tokens if they have changed
  await Promise.all([fetchPoolTokens(), fetchPoolVolumes()])

  // fetch initial Pool data
  poolsMap.forEach(([aId, bId], poolAddress) => {
    refreshPool(poolAddress, aId, bId)
  })
}
