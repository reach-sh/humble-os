import { t } from '@lingui/macro'
import { GlobalDex } from 'state/reducers/dex'
import GlobalProgressBar, {
  updateProgressBar,
  initProgressBar,
  resetProgressBar,
} from 'state/reducers/progress-bar'
import { ReachAccount, Token } from 'types/shared'
import { maybeOpenWallet, shouldConfirmMobileWallet } from 'helpers/user'
import { reloadPool, fetchAllTokenBalances } from 'reach/utils'
import handleContractError from 'helpers/error'
import { createReachAPI, createLiquidityPool } from '@reach-sh/humble-sdk'
import { clearGlobalModal } from 'state/reducers/modals'
import { tokenMetadata } from 'cache/shared'

export type CreationResult = {
  succeeded: boolean
}

const createPool = async (
  acc: ReachAccount,
  tokens: Token[],
  tokenAmounts: number[],
  succeedCallback?: (liquidityAmount?: number | undefined) => void,
): Promise<CreationResult> => {
  GlobalDex.creatingPool(true)

  // set up progress bar updates
  const steps = [
    t({ message: 'Creating Pool ...' }),
    t({ message: 'Configuring application ...' }),
    t({ message: 'Opting-in to LP Token ...' }),
    t({
      message: `Transferring ${tokens[0].symbol} and ${tokens[1].symbol} ...`,
    }),
  ]
  initProgressBar(steps.length)

  const createOpts = {
    tokenAmounts: tokenAmounts as [number, number],
    tokenIds: tokens.map(({ id }) => id) as [any, any],
    onProgress(msg: string) {
      if (msg !== 'SIGNING_EVENT') return
      const { currentStep } = GlobalProgressBar.getState()
      updateProgressBar(steps[currentStep])
      maybeOpenWallet()
    },
  }

  try {
    const result = await createLiquidityPool(acc, createOpts)
    const { data, succeeded, message } = result
    if (!succeeded || !data || data instanceof Error) {
      return createPoolFailed(new Error(message || t`No data received`))
    }

    // If here, Pool creation and funding was successful
    const { poolAddress, tokenAId, tokenBId, poolTokenId } = data
    const poolAddr = poolAddress.toString()

    tokenMetadata(poolTokenId, acc, false) // Async fetch and cache the new LP token

    // 0-balance Pool should have been grabbed by subscriber (thanks to auto-announcer).
    // So we reload the balances behind the scenes and cache user's new liquidity pool item
    await reloadPool({ poolAddr, tokBId: tokenBId, tokAId: tokenAId })
    await fetchAllTokenBalances()

    clearCreatingState()

    if (succeedCallback) {
      const reach = createReachAPI()
      const userLP = await reach.balanceOf(acc, poolTokenId as string | number)
      const totalLPTokens = reach.bigNumberToNumber(userLP)
      succeedCallback(totalLPTokens)
    }
    return { succeeded: true }
  } catch (error: any) {
    return createPoolFailed(error)
  }
}

/** Helper for clearing state (happens on success or error) */
function clearCreatingState() {
  if (shouldConfirmMobileWallet()) clearGlobalModal()
  GlobalDex.creatingPool(false)
  resetProgressBar()
}

/** Generic error response */
function createPoolFailed(e: Error): CreationResult {
  clearCreatingState()
  handleContractError('PoolGenerator.BuildPool', e)
  return { succeeded: false }
}

export default createPool
