import { t } from '@lingui/macro'
import {
  addLiquidity,
  isNetworkToken,
  withdrawLiquidity,
} from '@reach-sh/humble-sdk'
import { GlobalDex } from 'state/reducers/dex'
import { resetProgressBar } from 'state/reducers/progress-bar'
import { MODAL, clearGlobalModal, GlobalModal, GlobalUser } from 'state/store'
import { Pool, ReachAccount, Token, SwapInfo } from 'types/shared'
import useToast from 'hooks/useToast'
import { fetchAllTokenBalances } from 'reach/utils'
import { maybeOpenWallet, shouldConfirmMobileWallet } from 'helpers/user'
import {
  getPoolForTokens,
  getTokenById,
  updateLiquidity,
  updatePoolBalance,
} from 'helpers/pool'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import handleContractError from 'helpers/error'
import { formatPoolForSDK } from './trader'

type FormattedPoolType = {
  userLPTokens?: number
  balanceTokenA?: number
  balanceTokenB?: number
  totalLPTokens?: number
}

export type TransactionResult = FormattedPoolType & {
  succeeded: boolean
  amtA: number
  amtB: number
}

const autoClose = { autoClose: false }
const depositFailed = (
  e: any,
  info: SwapInfo,
  toastId?: string,
): TransactionResult => {
  if (shouldConfirmMobileWallet()) clearGlobalModal()
  GlobalDex.addingLiquidity(false)
  resetProgressBar()
  handleContractError('LiquidityProvider.Deposit', e, info, toastId)
  return { succeeded: false, amtA: 0, amtB: 0 }
}

export const getPreMintedAmt = (parsedAmtA: any, parsedAmtB: any) => {
  const value = parsedAmtA.mul(parsedAmtB)
  let acc = [value, value.div(2).add(1)]
  while (true) {
    const [z, x] = acc
    if (x.lt(2)) return x

    if (x.lt(z)) {
      acc = [x, value.div(x).add(x).div(2)]
    } else return x
  }
}

export async function withdraw(
  tokenAAmount: string | number,
  tokenBAmount: string | number,
  atomicWithdrawAmt: number,
  pool: Pool,
): Promise<TransactionResult> {
  GlobalDex.withdrawingLiquidity(true)

  const { reachAccount } = GlobalUser.getState()
  const { launchToast, removeToasts } = useToast()
  const shouldConfirm = shouldConfirmMobileWallet()
  const withdrawInfo = {
    tokA: getTokenById(pool.tokAId),
    tokB: getTokenById(pool.tokBId),
    amtA: tokenAAmount,
    amtB: tokenBAmount,
  }
  const poolAddress = pool.poolAddr
  const toastMsg = { message: t`Withdraw`, info: withdrawInfo }
  const toastId = launchToast('progress', toastMsg, undefined, autoClose)
  if (shouldConfirm) GlobalModal.active(MODAL.MOBILE_CONFIRM)

  const { tokA, tokB } = withdrawInfo
  const acceptToken = async (tokenId: any) => {
    try {
      maybeOpenWallet()
      return await reachAccount.tokenAccept(tokenId)
    } catch (e) {
      return withdrawalFailed(toastId, e, withdrawInfo)
    }
  }
  const updateBalances = async () => {
    await updatePoolBalance(poolAddress)
    await fetchAllTokenBalances()
  }

  if ((tokA?.id || '') !== NETWORK_TOKEN_DEFAULT_ID) await acceptToken(tokA?.id)
  if ((tokB?.id || '') !== NETWORK_TOKEN_DEFAULT_ID) await acceptToken(tokB?.id)

  try {
    maybeOpenWallet()
    const result = await withdrawLiquidity(reachAccount, {
      exchangeLPTokens: atomicWithdrawAmt,
      n2nn: isNetworkToken(pool.tokAId),
      poolTokenId: pool.poolTokenId,
      poolAddress,
    })

    if (!result.succeeded) {
      const err = new Error(result.message)
      return withdrawalFailed(toastId, err, withdrawInfo)
    }

    // updateLiquidity(poolAddress, mintedLPTokens, amt, true)
    await updateBalances()
    removeToasts(toastId)
    GlobalDex.withdrawingLiquidity(false)
    if (shouldConfirm) clearGlobalModal()

    const { received } = result.data
    return {
      succeeded: true,
      amtA: Number(received.tokenA),
      amtB: Number(received.tokenB),
    }
  } catch (e) {
    await updateBalances()
    return withdrawalFailed(toastId, e, withdrawInfo)
  }
}

export async function deposit(
  poolAddress: string,
  amountA: number,
  tokA: Token,
  amountB: number,
  tokB: Token,
  reachAccount: ReachAccount,
  poolTokenBalance = 0,
  poolMintedAmount: number,
): Promise<TransactionResult> {
  GlobalDex.addingLiquidity(true)
  const { launchToast, removeToasts } = useToast()
  const shouldConfirm = shouldConfirmMobileWallet()
  const depositInfo = { tokA, amtA: amountA, tokB, amtB: amountB }
  const msgProps = { message: t`Deposit`, info: depositInfo }
  const toastId = launchToast('progress', msgProps, undefined, autoClose)
  if (shouldConfirm) GlobalModal.active(MODAL.MOBILE_CONFIRM)

  // Get pool
  const { pools } = GlobalDex.getState()
  const reduxPool = getPoolForTokens(tokA.id, tokB.id, pools)
  const pool = formatPoolForSDK(reduxPool as any)
  if (!pool || !reduxPool) {
    const err = new Error('Pool not found')
    return depositFailed(err, { amtA: amountA, amtB: amountB }, toastId)
  }
  maybeOpenWallet()
  // Deposit funds
  const result = await addLiquidity(reachAccount, {
    pool,
    amounts: [amountA, amountB],
    onProgress: (msg: string) => msg === 'SIGNING_EVENT' && maybeOpenWallet(),
    optInToLPToken: poolTokenBalance === 0,
  })
  // Check for success/failure
  if (!result.succeeded) {
    const err = new Error(result.message)
    return depositFailed(err, depositInfo, toastId)
  }

  const { data } = result
  if (data.lpTokens) {
    const updatedPoolMintedAmount = poolMintedAmount + data.lpTokens
    await updateLiquidity(
      poolAddress,
      updatedPoolMintedAmount,
      data.lpTokens,
      false,
    )
  }
  if (shouldConfirm) clearGlobalModal()

  await updatePoolBalance(poolAddress)
  await fetchAllTokenBalances()

  removeToasts(toastId)
  GlobalDex.addingLiquidity(false)
  return { succeeded: true, amtA: amountA, amtB: amountB }
}

export default {
  withdraw,
  deposit,
}

function withdrawalFailed(
  toastId: string,
  e: any,
  info: SwapInfo,
): TransactionResult {
  const section = 'LiquidityProvider.Withdraw'

  if (shouldConfirmMobileWallet()) clearGlobalModal()
  GlobalDex.withdrawingLiquidity(false)
  handleContractError(section, e, info, toastId)
  return { succeeded: false, amtA: 0, amtB: 0 }
}
