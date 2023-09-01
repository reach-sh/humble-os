import { t } from '@lingui/macro'
import {
  createLiquidityExtractor,
  MigratorOpts,
  ExtractorOpts,
  createLiquidityMigrator,
} from '@reach-sh/humble-sdk'
import { TXN_SIGN } from '@reach-sh/humble-sdk/lib/constants.strings'
import { EVENTS } from 'constants/messages'
import handleContractError from 'helpers/error'
import { maybeOpenWallet } from 'helpers/user'
import { fetchAllTokenBalances } from 'reach/utils'
import GlobalProgressBar, {
  initProgressBar,
  moveProgressBar,
  resetProgressBar,
  updateProgressBar,
} from 'state/reducers/progress-bar'
import { GlobalUser } from 'state/store'
import { Token, Unwrap } from 'types/shared'
import { updateAPIPool } from 'utils/getServerResource'

export type MigratorExtractOpts = Pick<
  ExtractorOpts,
  'n2nn' | 'oldLpAmount' | 'oldLpToken' | 'oldPoolId' | 'tokens'
>

export type MigratorTransferOpts = MigratorExtractOpts &
  Pick<MigratorOpts, 'newLpToken' | 'newPoolId'>

type MigrateResult = Unwrap<ReturnType<typeof createLiquidityMigrator>>
// type WithdrawResult = Unwrap<ReturnType<typeof createLiquidityExtractor>>

const withdrawSteps = [
  t`Creating application ...`,
  t`Configuring application ...`,
  t`Exchange old LP Tokens ...`,
]

/** Withdraw liquidity from an old pool (v2 at time of creation) then deposit into v3 */
export async function migrateOldLiquidity(opts: MigratorTransferOpts) {
  const { reachAccount: acc } = GlobalUser.getState()
  const { tokens, ...ctcInputs } = opts
  const fallback = { A: '0', B: '0', lpTokens: '0' }
  const complete = (d: MigrateResult['data'], succeeded = false) => {
    resetProgressBar()
    return { ...d, succeeded }
  }

  initProgressBar(withdrawSteps.length + 1) // add step for updating balances

  try {
    const [tokenA, tokenB] = tokens as [Token, Token]
    const result = await createLiquidityMigrator(acc, {
      ...ctcInputs,
      tokA: tokenA.id,
      tokB: tokenB.id,
      tokens,
      onProgress(msg) {
        if (msg !== TXN_SIGN) return
        const { currentStep } = GlobalProgressBar.getState()
        if (currentStep < withdrawSteps.length) {
          moveProgressBar(withdrawSteps)
        } else updateProgressBar(EVENTS.DEPOSITING_FUNDS)
        maybeOpenWallet()
      },
    })

    updateProgressBar(EVENTS.UPDATING_TOKEN_BALANCES)
    await Promise.all([
      fetchAllTokenBalances(), // update user balances
      updateAPIPool(ctcInputs.oldPoolId, tokenA.id, tokenB.id, true),
    ])
    return complete(result.data, true)
  } catch (error) {
    const section = 'UI:LiquidityMigrator.Transfer'
    handleContractError(section, error, undefined)
    return complete(fallback)
  }
}

/** Create a smart contract to withdraw liquidity from an old pool (v2 at time of creation) */
export async function withdrawOldLiquidity(opts: MigratorExtractOpts) {
  const { reachAccount: acc } = GlobalUser.getState()
  const complete = ({ A, B }: { A: string; B: string }, succeeded = false) => {
    resetProgressBar()
    return { A, B, succeeded }
  }

  initProgressBar(withdrawSteps.length + 1) // add step for updating balances

  try {
    const [A, B] = opts.tokens as [Token, Token]
    const result = await createLiquidityExtractor(acc, {
      ...opts,
      tokA: A.id,
      tokB: B.id,
      onProgress(msg) {
        if (msg !== TXN_SIGN) return
        moveProgressBar(withdrawSteps)
        maybeOpenWallet()
      },
    })

    updateProgressBar(EVENTS.UPDATING_TOKEN_BALANCES)
    await Promise.all([
      fetchAllTokenBalances(), // update user balances
      updateAPIPool(opts.oldPoolId, A.id, B.id, true),
    ])

    return complete(result.data, true)
  } catch (error) {
    const section = 'UI:LiquidityMigrator.Withdraw'
    handleContractError(section, error, undefined)
    return complete({ A: '0', B: '0' })
  }
}
