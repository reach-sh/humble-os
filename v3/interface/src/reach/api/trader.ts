import useToast from 'hooks/useToast'
import {
  LimitOrderCore,
  LimitOrderInfo,
  Pool,
  ReachAccount,
  SwapInfo,
} from 'types/shared'
import { getPoolForTokens, getTokenById, updatePoolBalance } from 'helpers/pool'
import { fetchAllTokenBalances } from 'reach/utils'
import { maybeOpenWallet, shouldConfirmMobileWallet } from 'helpers/user'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import handleContractError from 'helpers/error'
import { MODAL, GlobalModal, clearGlobalModal } from 'state/reducers/modals'
import {
  PoolDetails,
  swapTokens,
  createLimitOrder,
  cancelLimitOrder,
  getLimitOrderVariant,
  fillLimitOrder,
  isNetworkToken,
} from '@reach-sh/humble-sdk'
import { LimitOrders } from 'state/reducers/limit-orders'
import { GlobalDex } from 'state/reducers/dex'
import GlobalProgressBar, {
  initProgressBar,
  resetProgressBar,
  updateProgressBar,
} from 'state/reducers/progress-bar'
import { t } from '@lingui/macro'
import cacheReducer from 'state/cacheReducer'
import { updateAPILimitOrder } from 'utils/getServerResource'

/** shared autoclose props */
const ac = { autoClose: false }

/** Update a limit order status on the server */
const updateLimitOrder = async (contractId: string) => {
  const { data } = await updateAPILimitOrder(contractId, 'closed')
  const { orders } = LimitOrders.getState()
  if (!data) {
    const o = orders.find(({ contractId: id }) => id === contractId)
    if (o) cacheReducer.limitOrders.update({ ...o, status: 'closed' })
  } else cacheReducer.limitOrders.update(data)
}

/** Update user balance, and possibly pool and limit order */
const performPostUpdates = async (poolId: string, orderId?: string) => {
  const proms: Promise<any>[] = [fetchAllTokenBalances()]
  if (poolId) proms.push(updatePoolBalance(poolId))
  if (orderId) proms.push(updateLimitOrder(orderId))
  await Promise.all(proms)
}

/** `Swap` handler (perform a swap with SDK) */
const performSwap = async (acct: ReachAccount, swap: SwapInfo) => {
  const { launchToast, removeToasts } = useToast()
  const shouldConfirm = shouldConfirmMobileWallet()
  const toastProps = { message: 'Swap', info: swap }
  const toastId = launchToast('progress', toastProps, undefined, ac)
  if (shouldConfirm) GlobalModal.active(MODAL.MOBILE_CONFIRM)
  if (!swap.tokA || !swap.tokB) throw new Error('Invalid swap info')
  if ((swap.tokB?.id || '') !== NETWORK_TOKEN_DEFAULT_ID) {
    try {
      maybeOpenWallet()
      await acct.tokenAccept(swap.tokB?.id || '')
    } catch (e) {
      swapFailed(toastId, e, swap)
      return { succeded: false, swapInfo: swap }
    }
  }

  const { pools } = GlobalDex.getState()
  const tokenPool: any = getPoolForTokens(swap.tokA?.id, swap.tokB?.id, pools)
  if (!tokenPool) throw new Error('No pool found for pair')
  try {
    maybeOpenWallet()
    const pool = formatPoolForSDK(tokenPool)
    if (!pool) throw new Error('Pool not found')

    const result = await swapTokens(acct, {
      swap: {
        tokenAId: swap.tokA?.id,
        tokenBId: swap.tokB?.id,
        amountA: swap.amtA,
        amountB: swap.amtB,
      },
      pool,
      onProgress(msg: string) {
        if (msg === 'SIGNING_EVENT') {
          maybeOpenWallet()
        }
      },
    })

    const { data, succeeded } = result
    if (!succeeded || !data || data.amountOut === '0') {
      throw new Error(result.message)
    }

    if (shouldConfirm) clearGlobalModal()
    await performPostUpdates(tokenPool.poolAddr.toString())

    const swapResult: SwapInfo = { ...swap, amtB: data.amountOut }
    removeToasts(toastId)
    return { succeded: true, swapInfo: swapResult }
  } catch (e) {
    performPostUpdates(tokenPool.poolAddr.toString())
    swapFailed(toastId, e, swap)
    return { succeded: false, swapInfo: swap }
  }
}

export default performSwap

/** Generic `Swap` error-handler */
const swapFailed = (toastId: string, e: any, swapInfo: SwapInfo) => {
  if (shouldConfirmMobileWallet()) {
    clearGlobalModal()
  }
  handleContractError('API.Trader.PerformSwap', e, swapInfo, toastId)
}

/** Generic `LimitOrder` error-handler */
const limitOrderFailed = (
  toastId: string,
  e: any,
  limitOrderInfo: LimitOrderCore,
) => {
  if (shouldConfirmMobileWallet()) clearGlobalModal()
  resetProgressBar()
  const tag = 'API.Trader.PerformLimitOrder'
  handleContractError(tag, e, limitOrderInfo, toastId)
}

/** Create `LimitOrder` via SDK */
export const submitLimitOrder = async (
  acct: ReachAccount,
  limitOrder: LimitOrderCore,
) => {
  const { launchToast, removeToasts } = useToast()
  const shouldConfirm = shouldConfirmMobileWallet()
  const toastId = launchToast(
    'progress',
    { message: 'Limit Order', info: limitOrder },
    undefined,
    { autoClose: false },
  )

  if (shouldConfirm) GlobalModal.active(MODAL.MOBILE_CONFIRM)

  const { tokenPool, tokA, tokB } = extractLimitOrderProps(limitOrder)
  const { poolAddr } = tokenPool
  if (!isNetworkToken(tokB.id)) {
    try {
      maybeOpenWallet()
      await acct.tokenAccept(limitOrder.tokB?.id || '')
    } catch (e) {
      limitOrderFailed(toastId, e, limitOrder)
      return { succeded: false, limitOrderInfo: limitOrder }
    }
  }

  try {
    if (!tokA.id || !tokB.id) throw new Error('Tokens not found')
    maybeOpenWallet()

    const steps = [
      t`Creating Limit order ...`,
      t`Configuring application ...`,
      t`Transferring sell-asset ...`,
    ]
    initProgressBar(steps.length)

    const result = await createLimitOrder(acct, {
      amtA: limitOrder.amtA,
      amtB: limitOrder.amtB,
      tokenA: tokA.id,
      tokenADecimals: tokA.decimals,
      tokenB: tokB.id,
      tokenBDecimals: tokB.decimals,
      onProgress(msg: string) {
        if (msg !== 'SIGNING_EVENT') return
        const { currentStep } = GlobalProgressBar.getState()
        updateProgressBar(steps[currentStep])
        maybeOpenWallet()
      },
    })

    const { data, succeeded } = result
    if (!succeeded || !data) throw new Error(result.message)
    if (shouldConfirm) clearGlobalModal()

    await performPostUpdates(poolAddr)
    removeToasts(toastId)
    resetProgressBar()
    return { succeded: true, swapInfo: limitOrder }
  } catch (e) {
    performPostUpdates(poolAddr)
    limitOrderFailed(toastId, e, limitOrder)
    return { succeded: false, limitOrderInfo: limitOrder }
  }
}

/** Fill `LimitOrder` via SDK if market conditions permit */
export const doFillLimitOrder = async (
  acct: ReachAccount,
  limitOrder: LimitOrderInfo,
): Promise<{ succeded: boolean }> => {
  const { launchToast, removeToasts } = useToast()
  const shouldConfirm = shouldConfirmMobileWallet()
  const toastProps = { message: 'Filling Limit Order', info: limitOrder }
  const toastId = launchToast('progress', toastProps, undefined, ac)

  if (shouldConfirm) GlobalModal.active(MODAL.MOBILE_CONFIRM)
  const { tokA, tokB, tokenPool, variant, a2B } =
    extractLimitOrderProps(limitOrder)
  const { poolAddr } = tokenPool

  try {
    if (!tokA.id || !tokB.id) throw new Error('Tokens not found')
    maybeOpenWallet()

    const result = await fillLimitOrder(acct, {
      poolId: tokenPool.poolAddr,
      buyTokenDecimals: tokA.decimals,
      sellTokenDecimals: tokB.decimals,
      aForB: a2B,
      sellAmount: limitOrder.amtA,
      minProfitB: '0',
      contractId: String(limitOrder.contractId),
      variant,
    })

    const { data, succeeded } = result
    if (!succeeded || !data) throw new Error(result.message)
    if (shouldConfirm) clearGlobalModal()

    await performPostUpdates(poolAddr, limitOrder.contractId)
    removeToasts(toastId)
    return { succeded: true }
  } catch (e) {
    performPostUpdates(poolAddr)
    limitOrderFailed(toastId, e, limitOrder)
    return { succeded: false }
  }
}

export const doCancelLimitOrder = async (
  acct: ReachAccount,
  limitOrder: LimitOrderInfo,
): Promise<{ succeded: boolean }> => {
  const { launchToast, removeToasts } = useToast()
  const shouldConfirm = shouldConfirmMobileWallet()
  const toastProps = { message: 'Cancelling Limit Order', info: limitOrder }
  const toastId = launchToast('progress', toastProps, undefined, ac)

  if (shouldConfirm) GlobalModal.active(MODAL.MOBILE_CONFIRM)
  const { tokA, tokB, tokenPool, variant } = extractLimitOrderProps(limitOrder)
  const { poolAddr } = tokenPool

  try {
    if (!tokA.id || !tokB.id) throw new Error('Tokens not found')
    maybeOpenWallet()

    const result = await cancelLimitOrder(acct, {
      contractId: String(limitOrder.contractId),
      variant,
    })

    const { data, succeeded } = result
    if (!succeeded || !data) throw new Error(result.message)
    if (shouldConfirm) clearGlobalModal()

    await performPostUpdates(poolAddr)
    removeToasts(toastId)
    return { succeded: true }
  } catch (e) {
    performPostUpdates(poolAddr)
    limitOrderFailed(toastId, e, limitOrder)
    return { succeded: false }
  }
}

export type FormattedPool = Pool & { usesNetworkToken?: boolean }

/** Format pool data for SDK ingestion */
export function formatPoolForSDK(pool: Pool): PoolDetails | null {
  if (!pool) return null

  const [tokA, tokB] = [getTokenById(pool?.tokAId), getTokenById(pool?.tokBId)]
  if (!tokA?.id || !tokB?.id) return null

  return {
    poolAddress: pool?.poolAddr.toString(),
    poolTokenId: String(pool?.poolTokenId),
    tokenAId: pool?.tokAId.toString(),
    tokenBId: pool?.tokBId.toString(),
    tokenADecimals: tokA?.decimals,
    tokenBDecimals: tokB?.decimals,
    tokenABalance: String(pool?.tokABalance),
    tokenBBalance: String(pool?.tokBBalance),
    mintedLiquidityTokens: pool.mintedLiquidityTokens,
    n2nn: pool?.tokAId.toString() === NETWORK_TOKEN_DEFAULT_ID,
  }
}

function extractLimitOrderProps(order: LimitOrderCore) {
  if (!order.tokA || !order.tokB) {
    throw new Error('Invalid Limit Order info')
  }

  const { tokA, tokB } = order
  const variant = getLimitOrderVariant({ tokenA: tokA.id, tokenB: tokB.id })
  const { pools } = GlobalDex.getState()
  const tokenPool = getPoolForTokens(tokA.id, tokB.id, pools)
  if (!tokenPool) throw new Error('Pool not found')
  return { tokenPool, variant, tokA, tokB, a2B: tokA.id === tokenPool.tokAId }
}
