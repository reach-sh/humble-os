import {
  fetchLimitOrder,
  formatAddress,
  getLimitOrderVariant,
  LimitOrderResult,
  ReachAccount,
  SDKLimitOrderView,
  subscribeToLimitOrders,
  TransactionResult,
} from '@reach-sh/humble-sdk'
import { getTokenById } from 'helpers/pool'
import cacheReducer from 'state/cacheReducer'
import { GlobalUser } from 'state/reducers/user'

const awaitEmptyStream = (doOnEmpty?: () => any) =>
  setTimeout(doOnEmpty || fetchLimitOrders, 3000)

const ordersMap = new Map<string, SDKLimitOrderView>()

export default function attachLimitOrdersListener(
  acc: ReachAccount,
  seekNow = false,
) {
  if (cacheReducer.subscriptions.orders) return
  cacheReducer.subscriptions.orders = true

  let timeout: NodeJS.Timeout = awaitEmptyStream()
  const address = formatAddress(acc)

  subscribeToLimitOrders(acc, {
    seekNow,
    includeAddresses: [address],
    async onOrderReceived(o) {
      if (o.contractId) ordersMap.set(o.contractId?.toString(), o)
      clearTimeout(timeout)
      timeout = awaitEmptyStream()
    },
  })
}

async function fetchLimitOrders() {
  const { reachAccount: acc } = GlobalUser.getState()
  ordersMap.forEach((order, contractId) => {
    const [tokA, tokB] = [
      getTokenById(order.tokenA || '0'),
      getTokenById(order.tokenB || '0'),
    ]

    // Fetch and combine announcer data with Limit Order info
    fetchLimitOrder(acc, {
      contractId,
      variant: getLimitOrderVariant(order),
      formatResult: true,
      includeTokens: false,
      tokenADecimals: tokA?.decimals,
      tokenBDecimals: tokB?.decimals,
    }).then(onLimitOrderFetched)
  })
}

/** Write SDK Limit Order data to cache */
async function onLimitOrderFetched(order: TransactionResult<LimitOrderResult>) {
  const id = (order.contractId || order.poolAddress)?.toString()
  if (!id) return

  const { data, succeeded } = order
  const log = ordersMap.get(id)
  if (!log || !succeeded || !data || (data as any).error) {
    ordersMap.delete(id)
    cacheReducer.limitOrders.delete(id)
    return
  }

  const sdkView = data as SDKLimitOrderView
  const [tokA, tokB] = [
    getTokenById(log.tokenA || '0'),
    getTokenById(log.tokenB || '0'),
  ]
  if (!tokA || !tokB) return
  cacheReducer.limitOrders.update({
    ...log,
    contractId: id,
    amtA: sdkView.amtA,
    amtB: sdkView.amtB,
    status: 'open',
    tokenADecimals: tokA?.decimals,
    tokenBDecimals: tokB?.decimals,
  })
}
