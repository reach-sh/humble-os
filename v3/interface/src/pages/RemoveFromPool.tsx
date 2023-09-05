import { useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { t } from '@lingui/macro'
import useGlobalDex from 'hooks/useGlobalDex'
import { clearGlobalModal, GlobalDex, GlobalModal, MODAL } from 'state/store'
import useGlobalModal from 'hooks/useGlobalModal'
import useGlobalUser from 'hooks/useGlobalUser'
import { Pool, Token } from 'types/shared'
import RemoveLiquidityForm, {
  RemoveLqData,
} from 'components/Liquidity/RemoveLiquidity'
import { BackToPoolButton } from 'components/Common/Button'
import SuccessPoolModal from 'components/Modals/SuccessPoolModal'
import ConfirmRemoveLiquidity from 'components/ConfirmRemoveLiquidity'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { withdraw } from 'reach/api/liquidityProvider'
import LoadingScreen from 'LoadingScreen'
import MobileWalletConfirmationModal from 'components/Modals/MobileWalletConfirmationModal'
import { paths } from 'App.routes'

export default function RemoveFromPool(): JSX.Element {
  const { poolId } = useParams()
  const { pools, tokenList } = useGlobalDex(['pools', 'tokenList'])
  const { modal } = useGlobalModal()
  const { reachAccount } = useGlobalUser()
  const { search } = useLocation()
  const navigate = useNavigate()
  const [{ amtA, amtB }, setWithdrawalBals] = useState({ amtA: 0, amtB: 0 })
  const [data, setWithdrawData] = useState<RemoveLqData>()

  // Selected Pool
  const pool = useMemo(() => {
    if (!pools.length || !poolId) return null
    return pools.find(({ poolAddr }) => poolAddr === poolId) || null
  }, [pools, poolId])

  // Selected Pool Token
  const [tokA, tokB, lqAmount] = useMemo(
    () => extractTokens(pool),
    [pool, tokenList],
  )

  // Modal state
  const [showSuccessModal, showConfirmModal] = useMemo(
    () => [
      modal === MODAL.SUCCESS_LQ_WITHDRAW,
      modal === MODAL.CONFIRM_LQ_WITHDRAW,
    ],
    [modal],
  )

  // Initial loading state
  const loadingMsg = useMemo(() => {
    if (!pool) return t`Loading Pool...`
    if (!tokA || !tokB) return t`Loading Tokens...`
    return ''
  }, [pool, tokA, tokB])

  // Perform withdrawal action
  const doWithdraw = async () => {
    clearGlobalModal()
    if (!pool || !data) return

    sendGoogleTagEvent('LIQUIDITY-Begin_Remove', reachAccount, search)
    const { tokenAAmount, tokenBAmount, withdrawalAmount } = data
    const res = await withdraw(
      tokenAAmount,
      tokenBAmount,
      withdrawalAmount,
      pool,
    )

    if (res.succeeded) {
      sendGoogleTagEvent('LIQUIDITY-Complete_Remove', reachAccount, search)
      setWithdrawalBals({ amtA: res.amtA, amtB: res.amtB })
      GlobalModal.active(MODAL.SUCCESS_LQ_WITHDRAW)
    } else sendGoogleTagEvent('LIQUIDITY-ERROR_Remove_Lq', reachAccount, search)
  }

  // Cancel withdrawal action
  const onCancel = () => {
    sendGoogleTagEvent('LIQUIDITY-Cancel_Remove_Confirm', reachAccount, search)
    clearGlobalModal()
  }

  // Complete withdrawal action (optional exit to Pools page)
  const onExit = () => {
    clearGlobalModal()
    if (Number(lqAmount) === 0) navigate(paths.pool.index)
  }

  if (!pool || !tokA || !tokB)
    return <LoadingScreen fullscreen={false} msg={loadingMsg} />

  return (
    <>
      <BackToPoolButton />

      <RemoveLiquidityForm
        pool={pool}
        onSubmit={(d) => {
          setWithdrawData(d)
          GlobalModal.active(MODAL.CONFIRM_LQ_WITHDRAW)
        }}
      />

      {data && (
        <>
          <ConfirmRemoveLiquidity
            onClose={onCancel}
            onConfirm={doWithdraw}
            open={showConfirmModal}
            percentage={data.withdrawPercentage}
            tokenAAmt={data.tokenAAmount}
            tokenAId={tokA.id}
            tokenASymbol={tokA.symbol}
            tokenBAmt={data.tokenBAmount}
            tokenBId={tokB.id}
            tokenBSymbol={tokB.symbol}
          />

          <MobileWalletConfirmationModal
            open={modal === MODAL.MOBILE_CONFIRM}
            onClose={clearGlobalModal}
            action='removing'
            tokenAAmt={data.tokenAAmount}
            tokenASymbol={tokA.symbol}
            tokenBAmt={data.tokenBAmount}
            tokenBSymbol={tokB.symbol}
          />
        </>
      )}

      <SuccessPoolModal
        open={showSuccessModal}
        title={t`You removed liquidity!`}
        image='remove'
        onClose={onExit}
        amount={lqAmount}
        tokenA={tokA}
        tokenB={tokB}
        tokenAAmount={amtA}
        tokenBAmount={amtB}
      />
    </>
  )
}

type TokenIsh = Token | undefined

/** Extract Tokens from pool */
function extractTokens(pool: Pool | null) {
  const { tokenList } = GlobalDex.getState()
  const vals: [TokenIsh, TokenIsh, string] = [undefined, undefined, '0']
  if (!pool) return vals
  // One loop for all values
  const { tokAId, tokBId, poolTokenId } = pool
  return tokenList.reduce((agg, tk) => {
    const next: typeof vals = [...agg]
    if (tk.id === tokAId) next[0] = tk
    if (tk.id === tokBId) next[1] = tk
    if (tk.id === poolTokenId) next[2] = String(tk.balance ?? 0)
    return next
  }, vals)
}
