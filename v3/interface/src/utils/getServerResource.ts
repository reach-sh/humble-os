import getAPIURL, { getLegacyAPIURL } from 'helpers/getAPIURL'
import { CURRENT_PROVIDER } from 'constants/reach_constants'
import {
  Farm,
  LimitOrderStatus,
  NetworkProvider,
  Pool,
  Token,
} from 'types/shared'
import { formatSDKPool, makeNetworkToken } from 'reach/utils'
import { PoolDetails, ReachToken } from '@reach-sh/humble-sdk'
import cacheReducer from 'state/cacheReducer'
import ADI from 'cache'
import { getAnnouncers } from '@reach-sh/humble-sdk/lib/constants'
import { HSLimitOrder, HSPoolLiquidity } from 'types/response'
import { getTokenById } from 'helpers/pool'
import {
  getFarm,
  listFarmsQuery,
  listLimitOrders,
  listPoolHistoryQuery,
  listPoolsQuery,
  listTokensQuery,
  signMoonpayUrl,
} from 'network/queries'
import { updateLimitOrderStatus, updateNewPool } from 'network/mutations'
import { GlobalUser } from 'state/reducers/user'
import { GlobalDex } from 'state/reducers/dex'
import { fetchGQL } from '../network/fetch-gql'

type APIPoolsResponse = { listPools: PoolDetails[] }
type APIUpdatePoolResponse = { updatePool: PoolDetails }
type APITokensResponse = { listTokens: ReachToken[] }
type APIFarmsResponse = { listFarms: Farm[] }
type APIFarmResponse = { getFarm: Farm }
type APIPoolHistoryResponse = { getHistoricalPoolLiquidity: HSPoolLiquidity[] }

const getResourceURL = () => getAPIURL(CURRENT_PROVIDER as NetworkProvider)

export default getResourceURL

export type APIResult<T> = {
  data: T
  error?: string
}

type LoadingFlag = keyof typeof cacheReducer.loadingFlags
/** Fetch all API data (tokens, farms, pools) */
export async function loadAPIData() {
  const flags = Object.keys(cacheReducer.loadingFlags) as LoadingFlag[]
  const isLoading = flags.some((f) => cacheReducer.loadingFlags[f])
  if (isLoading) return { pools: [], tokens: [], fetchError: false }

  const { data: tokens, error: tokensError } = await listAPITokens()
  cacheReducer.tokens.updateMultiple(tokens as Token[])
  const [
    { data: pools, error: poolsError },
    { data: orders, error: limitOrdersError },
  ] = await Promise.all([listAPIPools(), listAPILimitOrders()])
  const fetchError = tokensError || poolsError || limitOrdersError

  cacheReducer.pools.updateMultiple(pools)
  cacheReducer.limitOrders.updateMultiple(orders)

  return { pools, tokens, fetchError }
}

// Queries

export async function getFarmById(id: string): Promise<APIResult<Farm | null>> {
  const args = `id: "${id}"`
  const query = getFarm(args)
  const data = await fetchGQL({
    query,
    url: getResourceURL(),
    controller: new AbortController(),
    onResolve: (r: APIFarmResponse) => r.getFarm,
  })

  return { data }
}

export async function getPoolHistoricalData(
  poolId: string,
): Promise<APIResult<HSPoolLiquidity[]>> {
  const { poolAnnouncer: announcerId } = getAnnouncers()
  const args = `${chainIdentifierArgs()}, announcerId: "${announcerId}", id: "${poolId}"`
  const query = listPoolHistoryQuery(args)
  const data = await fetchGQL({
    controller: new AbortController(),
    onResolve: ({
      getHistoricalPoolLiquidity: lq = [],
    }: APIPoolHistoryResponse) => lq,
    query,
    url: getResourceURL(),
  })

  return data?.length ? { data } : { data: [], error: 'Pool History API error' }
}

export async function getMoonpaySignedUrl(
  amount: string,
  currency: string,
  walletAddress: string,
): Promise<APIResult<string>> {
  const args = `amount: "${amount}", currency: "${currency}", walletAddress: "${walletAddress}"`
  const query = signMoonpayUrl(args)
  const data = await fetchGQL({
    query,
    url: getResourceURL(),
    controller: new AbortController(),
    onResolve: (r: { signMoonpayUrl: string }) => r.signMoonpayUrl,
  })

  return {
    data: data || '',
  }
}

export async function getNDFAddress(
  walletAddress: string,
): Promise<string | null> {
  try {
    const url = `https://api.nf.domains/nfd/address?address=${walletAddress}`
    const ndf = await fetch(url)
    const d = await ndf.json()
    return d[0].name // First (only) wallet address passed
  } catch (e) {
    return null
  }
}

export async function listAPILimitOrders(
  status?: LimitOrderStatus,
): Promise<APIResult<HSLimitOrder[]>> {
  cacheReducer.loadingFlags.orders = true
  const { limitOrderAnnouncer: announcerId } = getAnnouncers()
  const { walletAddress: addr } = GlobalUser.getState()
  let args = `${chainIdentifierArgs()}, announcerId: "${announcerId}"`
  args = `${args}, creator: "${addr}"`
  if (status) args = `${args}, status: ${status}`
  const query = listLimitOrders(args)
  const data = await fetchGQL({
    query,
    url: getResourceURL(),
    controller: new AbortController(),
    onResolve: (r: { listLimitOrders: HSLimitOrder[] }) => r.listLimitOrders,
  })

  cacheReducer.loadingFlags.orders = false
  return data?.length ? { data } : { data: [], error: 'Limit Order API error' }
}

export async function listAPIPools(
  announcerId?: string,
): Promise<APIResult<Pool[]>> {
  cacheReducer.loadingFlags.pools = true
  const ancId = announcerId || getAnnouncers().poolAnnouncer
  const args = `${chainIdentifierArgs()}, announcerId: "${ancId}", tradeable: true`
  const data = await fetchGQL({
    url: getResourceURL(),
    query: listPoolsQuery(args),
    onResolve: (d: APIPoolsResponse) => d?.listPools || [],
    controller: new AbortController(),
  })
  if (!data?.length) {
    const { data: d } = await ADI.listItems({ cacheKey: 'pools' })
    cacheReducer.loadingFlags.pools = false
    return { data: d as Pool[], error: 'Pools API error' }
  }

  const { data: tokens } = await listAPITokens()
  const tokensMap = tokens.reduce(
    (agg, t) => ({ ...agg, [t.id]: t }),
    {} as any,
  )
  const fPools: Pool[] = []
  data.forEach((p: PoolDetails) => {
    const [a, b] = [tokensMap[p.tokenAId], tokensMap[p.tokenBId]]
    fPools.push(formatSDKPool(p, 0, [a, b]))
  })

  cacheReducer.loadingFlags.pools = false
  return { data: fPools, error: '' }
}

async function listAPITokens(): Promise<APIResult<ReachToken[]>> {
  cacheReducer.loadingFlags.tokensLoading = true
  const tokensController = new AbortController()
  const data = await fetchGQL({
    url: getResourceURL(),
    query: listTokensQuery(`provider:${CURRENT_PROVIDER.toLowerCase()}`),
    onResolve: (d: APITokensResponse) => d?.listTokens || [],
    controller: tokensController,
  })
  if (!data?.length) {
    const { data: d } = await ADI.listItems({ cacheKey: 'tokens' })
    cacheReducer.loadingFlags.tokensLoading = false
    return { data: d, error: 'Tokens API error' }
  }

  data.push(makeNetworkToken())
  cacheReducer.loadingFlags.tokensLoading = false
  return { data }
}

export async function listAPIFarms(): Promise<APIResult<Farm[]>> {
  cacheReducer.loadingFlags.farms = true
  const farmsController = new AbortController()
  const query = listFarmsQuery(chainIdentifierArgs())
  const data = await fetchGQL({
    controller: farmsController,
    onResolve: ({ listFarms = [] }: APIFarmsResponse) => listFarms,
    query,
    url: getResourceURL(),
  })

  if (!data?.length) {
    const { data: d } = await ADI.listItems({ cacheKey: 'farms' })
    cacheReducer.loadingFlags.farms = false
    return { data: d, error: 'Farms API error' }
  }

  const { pools } = GlobalDex.getState()
  const farms = data.map((f) => {
    const farm = { ...f }
    if (farm.stakedTokenPoolId) {
      const pool = pools.find(
        ({ poolAddr }) => String(poolAddr) === farm.stakedTokenPoolId,
      )
      const [a, b] = [
        getTokenById(`${pool?.tokAId}`),
        getTokenById(`${pool?.tokBId}`),
      ]
      farm.pairTokenAId = a?.id.toString()
      farm.pairTokenASymbol = a?.symbol || ''
      farm.pairTokenBId = b?.id.toString()
      farm.pairTokenBSymbol = b?.symbol || ''
    }
    return farm
  })

  cacheReducer.loadingFlags.farms = false
  return { data: farms }
}

// Mutations

export async function updateAPILimitOrder(
  id: string,
  status: LimitOrderStatus,
): Promise<APIResult<HSLimitOrder | null>> {
  const query = updateLimitOrderStatus(`id: "${id}", status: ${status}`)
  const data = await fetchGQL({
    query,
    url: getResourceURL(),
    controller: new AbortController(),
    onResolve: (r: { updateLimitOrderStatus: HSLimitOrder }) =>
      r.updateLimitOrderStatus,
  })

  return { data }
}

export async function updateAPIPool(
  id: string,
  tokenAId: string,
  tokenBId: string,
  legacy = false,
): Promise<APIResult<Pool | null>> {
  const args = `id: "${id}", tokenAId: "${tokenAId}", tokenBId: "${tokenBId}"`
  const query = updateNewPool(args)
  const data = await fetchGQL({
    query,
    url: legacy ? getLegacyAPIURL() : getResourceURL(),
    controller: new AbortController(),
    onResolve: ({ updatePool }: APIUpdatePoolResponse) => updatePool || null,
  })

  if (!data) return { data, error: 'Error updating pool' }
  const [A, B] = [
    getTokenById(String(data.tokenAId)),
    getTokenById(String(data.tokenBId)),
  ]
  if (!A || !B) return { data: null, error: 'Missing Pool Tokens' }
  const formatted = formatSDKPool(data, 0, [A, B])

  return { data: formatted }
}

// Helper
function chainIdentifierArgs() {
  const provider = CURRENT_PROVIDER.toLowerCase()
  const args = `provider: ${provider}`
  return args
}
