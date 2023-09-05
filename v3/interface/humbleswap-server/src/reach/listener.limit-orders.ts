import { Token } from '@prisma/client'
import {
  TransactionResult,
  subscribeToLimitOrders,
  fetchLimitOrder,
  getLimitOrderVariant,
  LimitOrderResult,
  SDKLimitOrderView,
  calculateOtherAmount,
  PoolDetails,
  formatNumberShort,
} from '@reach-sh/humble-sdk'
import {
  getAnnouncers,
  getBlockchain,
} from '@reach-sh/humble-sdk/lib/constants'
import {
  listLimitOrders,
  upsertLimitOrder,
  changeOrderStatus,
  UpsertLimitOrderOpts,
} from '../graphql/services/LimitOrders.service'
import { globalReachAccount } from '../graphql/services/Reach.service'
import {
  getTokenById,
  makeNetworkToken,
} from '../graphql/services/Tokens.service'
import { chainIdentifiers } from '../graphql/utils'
import logger from '../logger'
import { refreshPool } from './listener.pools'

let timeout: NodeJS.Timeout
const tokenIds = new Set<string>('0')
const ordersMap = new Map<string, SDKLimitOrderView>()
const contractsMap = new Map<string, any>()
const allTokens = new Map<any, Token>()
let ordersFetched = 0
let tokensFetched = 1
const networkToken = () => makeNetworkToken(getBlockchain())

const resetTimeout = (doNext: () => any, wait = 1500) => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(doNext, wait)
}

// Main updater function
export function initLimitOrders() {
  allTokens.set('0', networkToken())
  const acc = globalReachAccount()

  subscribeToLimitOrders(acc, {
    async onOrderReceived(order) {
      resetTimeout(runUpdateCycle, 1000)
      if (!order.contractId) return
      tokenIds.add(order.tokenA || '0')
      tokenIds.add(order.tokenB || '0')
      ordersMap.set(order.contractId.toString(), order)
    },
  })
}

export default initLimitOrders

/** Check a single Limit Order data on blockchain */
export async function refreshLimitOrder(
  id: string,
  tokA: string | null,
  tokB: string | null,
) {
  const acc = globalReachAccount()
  const [A, B] = await Promise.all([
    getTokenById({ id: tokA || '0' }),
    getTokenById({ id: tokB || '0' }),
  ])

  if (!A || !B) return null

  // Fetch the Pool and return only relevant data
  return fetchLimitOrder(acc, {
    contractId: id,
    contract: contractsMap.get(id),
    includeTokens: false,
    tokenADecimals: A.decimals,
    tokenBDecimals: B.decimals,
    formatResult: true,
    variant: getLimitOrderVariant({ tokenA: A.id, tokenB: B.id }),
  }).then(onLimitOrderReceived)
}

type UnwrapPromise<P extends any> = P extends Promise<infer R> ? R : P
type UpdatedPool = UnwrapPromise<ReturnType<typeof refreshPool>>

/** Find any Limit Orders that can be filled */
export async function processLimitOrders(pools: UpdatedPool[]) {
  const orders = await listLimitOrders({
    ...chainIdentifiers(),
    status: 'open',
  })

  // Find matching limit orders for each pool
  pools.forEach(async (pool) => {
    if (process.env.NODE_ENV !== 'development') return
    // Stop if `pool` element is null
    if (!pool) return
    const { tokenAId, tokenBId } = pool
    const inPool = (t: string) => [tokenAId, tokenBId].includes(t)
    const sdkPool: PoolDetails = {
      poolAddress: pool.id,
      tokenAId,
      tokenBId,
      ...pool.PoolLiquidity[0],
    }

    const ordersMatch = orders.filter((o) => {
      // MAX_SAFE_INTEGER overflow: halt before `Number` conversions below
      if (o.amtA.split('.')[0].length > 16) return false

      // Check if pool returns more than the order expects
      if (inPool(o.tokenA) && inPool(o.tokenB)) {
        const xOut = calculateOtherAmount(Number(o.amtA), o.tokenA, sdkPool)
        return Number(xOut) >= Number(o.amtB)
      }

      return false
    })

    // Stop if no limit-orders match this `pool`
    if (!ordersMatch.length) {
      logger.error(`No orders match pool ${pool.id}\n`)
      return
    }

    // @TODO: 1. setup a process for funding the auto-created account (or hardcode one)
    // @TODO: 2. fill orders with SDK and send profit balance to HUM5 address

    const POOL = `Pool ${pool.id}`
    ordersMatch.forEach((o) => {
      const xOut = calculateOtherAmount(Number(o.amtA), o.tokenA, sdkPool)
      const fx = formatNumberShort(xOut, 6)
      const profitB = formatNumberShort(Number(fx) - Number(o.amtB), 6)
      const msg = `\t * Order ${o.contractId} gets ${fx} B (profit: ${profitB})`
      logger.info(msg)
    })
    logger.warn(`:: ${POOL} has ${ordersMatch.length} matching orders\n`)
  })
}

/** Fetch all unique tokens  */
async function fetchTokens() {
  await Promise.all([...tokenIds].map((id) => getTokenById({ id }))).then(
    (tokens) =>
      // Update shared map for pool-fetch
      tokens.forEach((token) => {
        if (!token) return
        allTokens.set(token?.id, token)
        tokensFetched += 1
        resetTimeout(logTokensFetched, 1000)
      }),
  )
}

type DataLabel = 'orders' | 'tokens'

function logData(name: DataLabel, count: number) {
  if (process.env.NODE_ENV !== 'development') return
  const now = new Date().toISOString()
  let action = count === 0 ? 'Init' : 'Upload'
  logger.warn(`${action}.${name}:: @ ${now}`)
  logger.info(`Last processed ${count} ${name}`)
  logger.error('========================================')
}

function logTokensFetched() {
  logger.info(`TokenIds: ${tokenIds.size}`)
  logData('tokens', tokensFetched)
  tokensFetched = 0
}

function logOrdersFetched() {
  logger.info(`Orders: ${ordersMap.size}`)
  logData('orders', ordersFetched)
  ordersFetched = 0
}

/** Write Pool to DB */
async function onLimitOrderReceived(res: TransactionResult<LimitOrderResult>) {
  const { data, contract, contractId: id, succeeded } = res
  if (!id) {
    if (res.poolAddress) {
      changeOrderStatus(String(res.poolAddress), 'closed')
      ordersFetched += 1
    }
    return
  }

  const contractId = id.toString()
  const closeOrder = () => changeOrderStatus(contractId, 'closed')

  if (!succeeded) {
    closeOrder()
    return
  }

  const { creator } = ordersMap.get(contractId) || {}
  if (!creator || (data as any).error) {
    contractsMap.delete(contractId)
    closeOrder()
    return
  }

  const { amtA, amtB, tokenA, tokenB } = data as SDKLimitOrderView
  const [A, B] = [allTokens.get(tokenA || '0'), allTokens.get(tokenB || '0')]
  if (!A || !B) {
    closeOrder()
    return
  }

  // Store Pool to db
  const { limitOrderAnnouncer: announcerId } = getAnnouncers()
  if (!announcerId) {
    closeOrder()
    return
  }

  upsertLimitOrder({
    contractId,
    creator,
    amtA,
    amtB,
    tokenA: tokenA || '0',
    tokenADecimals: A.decimals,
    tokenB: tokenB || '0',
    tokenBDecimals: A.decimals,
    ...chainIdentifiers({ announcerId: announcerId?.toString() }),
  } as UpsertLimitOrderOpts)

  // Store contract for reuse
  ordersFetched += 1
  contractsMap.set(contractId, contract)
  resetTimeout(logOrdersFetched, 1000)
}

/** Update all pools and tokens */
async function runUpdateCycle() {
  // Only re-fetch tokens if they have changed
  await fetchTokens()

  // fetch initial Pool data
  ordersMap.forEach((o, appId) => {
    refreshLimitOrder(appId, o.tokenA, o.tokenB)
  })
}
