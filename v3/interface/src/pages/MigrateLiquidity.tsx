import styled from 'styled-components'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { t } from '@lingui/macro'
import {
  formatCurrency,
  getLegacyAnnouncers,
  isNetworkToken,
  parseCurrency,
  ReachToken,
} from '@reach-sh/humble-sdk'
import { GlobalDex } from 'state/reducers/dex'
import GlobalModal, { clearGlobalModal, MODAL } from 'state/reducers/modals'
import cacheReducer from 'state/cacheReducer'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalLoadingFlags from 'hooks/useGlobaLoadingFlags'
import useGlobalModal from 'hooks/useGlobalModal'
import { getAppEnvironment } from 'helpers/getAPIURL'
import { filterPoolsByQuery, getTokenById } from 'helpers/pool'
import { Pool, ReachAccount } from 'types/shared'
import { listAPIPools } from 'utils/getServerResource'
import { paths } from 'App.routes'
import { BackToPoolButton } from 'components/Common/Button'
import Card from 'components/Common/Card'
import YourLiquidity from 'components/Liquidity/YourLiquidity'
import LiquidityItem from 'components/Liquidity/YourLiquidity/LiquidityItem'
import ConfirmMigrateWithdrawModal, {
  ConfirmMigrateWithdrawProps,
} from 'components/Modals/ConfirmMigrateWithdrawModal'
import MigrateWithdrawSuccessModal from 'components/Modals/MigrateWithdrawSuccessModal'
import ModalComponent from 'components/Modals/ModalComponent'
import RemoveLiquidityForm, {
  RemoveLqData,
} from 'components/Liquidity/RemoveLiquidity'
import Checkbox from 'components/Common/Checkbox'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import {
  migrateOldLiquidity,
  withdrawOldLiquidity,
} from 'reach/api/liquidityMigrator'
import useToast from 'hooks/useToast'
import { ASSURANCE, LIQUIDITY, TRANSACTION } from 'constants/messages'

const humbleV2 = getLegacyAnnouncers('v2')
const { CONFIRM_MIGRATE, CONFIRM_WITHDRAW } = MODAL
const CheckboxContainer = styled(FlexColumnContainer)`
  justify-content: center;
  height: 2.4rem;
  margin: 0.4rem;
`

type Action = ConfirmMigrateWithdrawProps['variant']

export default function MigrateLiquidityRoute(): JSX.Element {
  const { pools: globalPools, tokenList } = GlobalDex.getState()
  const toksWithBalance = tokenList.filter(({ balance }) => Boolean(balance))
  const { launchToast } = useToast()
  const [loaded, setLoaded] = useState(false)
  const [v2Pool, setV2Pool] = useState<Pool>()
  const [v2pools, setV2Pools] = useState<Pool[]>([])
  const [action, setAction] = useState<Action>()
  const [success, setSuccess] = useState(false)
  const [received, setReceived] = useState({ A: '0', B: '0' })
  const [data, setFormData] = useState<RemoveLqData>()
  const [skipConfirmation, setSkipConfirmation] = useState(false)
  const [addingLiquidity, setAddingLiquidity] = useState(false)
  const { modal } = useGlobalModal()
  const { walletAddress, reachAccount } = useGlobalUser([
    'walletAddress',
    'reachAccount',
  ])
  const { pools: loadingPools } = useGlobalLoadingFlags(['pools'])
  const allClear = useMemo(
    () => Boolean(walletAddress) && !loadingPools && globalPools.length > 0,
    [loadingPools],
  )
  // Pools where user has non-zero liquidity balance
  const filteredPools = useMemo(() => {
    const idsWithBal = toksWithBalance.map(({ id }) => id)
    return v2pools.filter(({ poolTokenId }) => idsWithBal.includes(poolTokenId))
  }, [v2pools, toksWithBalance])

  // Show confirmation modal (boolean)
  const showConfirm = useMemo(() => {
    const showing = [CONFIRM_MIGRATE, CONFIRM_WITHDRAW].includes(modal)
    return Boolean(action) && showing
  }, [modal, action])

  // Shared tokens (A,B) and v3 Pool
  const [tokenA, tokenB, v3Pool] = useMemo(() => {
    if (!v2Pool) return [undefined, undefined]
    const { tokAId, tokBId } = v2Pool
    const newPool = filterPoolsByQuery(`${tokAId}/${tokBId}`, globalPools)[0]
    return [getTokenById(tokAId), getTokenById(tokBId), newPool]
  }, [v2Pool])

  // SWAP-1262 - Show "Withdraw Liquidity" Confirmation modal
  const migrateWithdrawData = useMemo(() => {
    const d =
      data && v2Pool && tokenA && tokenB
        ? {
            ...data,
            tokenA,
            tokenB,
            oldPoolId: v2Pool.poolAddr,
            newPoolId: v3Pool?.poolAddr,
          }
        : null
    return d
  }, [data, v2Pool, tokenA, tokenB, showConfirm])

  // SWAP-1262 - Show "Withdraw Liquidity" Confirmation modal
  const sharedContractOpts = useMemo(() => {
    if (!migrateWithdrawData || !v2Pool) return null
    const mwd = migrateWithdrawData
    return {
      n2nn: isNetworkToken(mwd.tokenA.id),
      oldLpAmount: formatCurrency(mwd.withdrawalAmount),
      oldLpToken: v2Pool.poolTokenId,
      oldPoolId: mwd.oldPoolId,
      tokens: [tokenA, tokenB] as [ReachToken, ReachToken],
    }
  }, [migrateWithdrawData, tokenA, tokenB, v2Pool])

  // Close any modals using the global modal state
  const closeGlobalModal = () => {
    setAction(undefined)
    setAddingLiquidity(false)
    setV2Pool(undefined)
    clearGlobalModal()
  }

  // Confirm current action
  const confirmAction = (d: RemoveLqData) => {
    setFormData(d)
    setAddingLiquidity(false)
    const ready = d && v2Pool && sharedContractOpts
    const canDo = action === 'transfer' ? ready && v3Pool : ready

    if (skipConfirmation && canDo) doAction(d)
    else {
      const next = action === 'transfer' ? CONFIRM_MIGRATE : CONFIRM_WITHDRAW
      GlobalModal.active(next)
    }
  }

  const doAction = (d: RemoveLqData) =>
    action === 'transfer' ? doTransfer(d) : doWithdraw(d)
  // SWAP-1262 - Withdraw old liquidity
  const doWithdraw = async (d: RemoveLqData) => {
    if (!d || !v2Pool || !sharedContractOpts) return

    let message = LIQUIDITY.WITHDRAW_OLD_PROGRESS
    const toastOpts: { autoClose: boolean | number } = { autoClose: false }
    const toastId = launchToast('progress', { message }, undefined, toastOpts)

    clearGlobalModal()
    toastOpts.autoClose = 30000
    const result = await withdrawOldLiquidity({ ...sharedContractOpts })

    if (result.succeeded) {
      listV2Pools()
      setReceived({ A: result.A, B: result.B })
      setSuccess(result.succeeded)
      message = TRANSACTION.COMPLETE
      launchToast('success', { message }, toastId, toastOpts)
    } else {
      message = `${ASSURANCE.FUNDS_SAFE} ${TRANSACTION.CANCELLED}`
      launchToast('reject', { message }, toastId, toastOpts)
    }
  }

  // SWAP-1263 - Transfer liquidity
  const doTransfer = async (d: RemoveLqData) => {
    if (!d || !v2Pool || !v3Pool || !sharedContractOpts) return

    // V3 LP Token opt-in
    const newLpToken = v3Pool.poolTokenId
    let message = TRANSACTION.TOKEN_OPTIN.replace('%%', 'LP Token')
    if (!(await reachAccount.tokenAccepted(newLpToken))) {
      launchToast('progress', { message }, undefined, { autoClose: 8000 })
      await (reachAccount as ReachAccount).tokenAccept(newLpToken)
      message = LIQUIDITY.MIGRATE_PROGRESS
    } else message = LIQUIDITY.MIGRATE_PROGRESS

    const toastOpts: { autoClose: boolean | number } = { autoClose: false }
    const toastId = launchToast('progress', { message }, undefined, toastOpts)

    clearGlobalModal()
    toastOpts.autoClose = 30000
    const result = await migrateOldLiquidity({
      ...sharedContractOpts,
      newPoolId: v3Pool.poolAddr,
      newLpToken,
    })

    if (result.succeeded) {
      listV2Pools()
      setReceived({ A: result.A, B: result.B })
      setSuccess(result.succeeded)
      message = TRANSACTION.COMPLETE
      launchToast('success', { message }, toastId, toastOpts)
    } else {
      message = `${ASSURANCE.FUNDS_SAFE} ${TRANSACTION.SLIPPAGE_PROTECTION}`
      launchToast('reject', { message }, toastId, toastOpts)
    }
  }

  const selectAction = (a: Action, oldPool: Pool) => {
    if (a === undefined) closeGlobalModal()
    else {
      setAction(a)
      const lpTok = toksWithBalance.find((tk) => tk.id === oldPool.poolTokenId)
      setV2Pool({
        ...oldPool,
        liquidityAmount: Number(parseCurrency(lpTok?.balance ?? 0)),
      })
      setAddingLiquidity(true)
    }
  }

  // Return to "Remove Liquidity" form
  const returnToForm = async () => {
    clearGlobalModal()
    setAddingLiquidity(true)
  }

  // Fetch V2 Pools from Server
  const listV2Pools = async () => {
    if (cacheReducer.loadingFlags.pools || !allClear) return

    let env = getAppEnvironment() as keyof typeof humbleV2
    if (env === 'dev') env = 'staging' // Allow migrations between dev and staging
    const pools = await listAPIPools(String(humbleV2[env].protocolId))
    if (pools.error) return
    setV2Pools(pools.data)
    setLoaded(true)
  }

  useEffect(() => {
    if (!loaded && allClear) listV2Pools()
  }, [allClear])

  const actionTitle =
    action === 'transfer' ? LIQUIDITY.MIGRATE : LIQUIDITY.WITHDRAW_OLD

  if (!walletAddress) return <Navigate to={paths.pool.index} replace />

  return (
    <>
      <section>
        <BackToPoolButton returnTo='/pool' />
        <Card padded title={LIQUIDITY.MOVE}>
          <>{LIQUIDITY.MOVE_DESC}</>

          <YourLiquidity
            migration
            pools={filteredPools}
            renderListItem={(pool) => (
              <LiquidityItem
                key={pool.poolAddr}
                altButtons
                pool={pool}
                addText={t`Migrate`}
                onAddLiquidity={(p) => selectAction('transfer', p)}
                onRemoveLiquidity={(p) => selectAction('withdraw', p)}
              />
            )}
          />
        </Card>
      </section>

      {v2Pool && (
        <>
          <ModalComponent
            hideCancelBtn
            open={addingLiquidity}
            onClose={closeGlobalModal}
          >
            <>
              <RemoveLiquidityForm
                disableUpdate
                noPadding
                formTitle={actionTitle}
                pool={v2Pool}
                onSubmit={confirmAction}
              />

              <CheckboxContainer>
                <Checkbox
                  onChange={() => setSkipConfirmation(!skipConfirmation)}
                  value={skipConfirmation}
                >
                  <>{TRANSACTION.SKIP_CONFIRMATION}</>
                </Checkbox>
              </CheckboxContainer>
            </>
          </ModalComponent>

          {action && (
            <>
              {migrateWithdrawData && (
                <ConfirmMigrateWithdrawModal
                  modalTitle={actionTitle}
                  open={showConfirm}
                  onClose={returnToForm}
                  onConfirm={() => data && doAction(data)}
                  variant={action}
                  data={migrateWithdrawData}
                />
              )}

              <MigrateWithdrawSuccessModal
                open={success}
                onClose={() => setSuccess(false)}
                amtA={received.A}
                amtB={received.B}
                tokenA={tokenA}
                tokenB={tokenB}
                newPoolId={v3Pool?.poolAddr}
                variant={action}
              />
            </>
          )}
        </>
      )}
    </>
  )
}
