import styled, { css } from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { useLocation } from 'react-router-dom'
import { BackToPoolButton, WideButton } from 'components/Common/Button'
import Card from 'components/Common/Card'
import { Break, Form, LabelHeading } from 'components/Common/Form'
import SIZE from 'constants/screenSizes'
import useGlobalUser from 'hooks/useGlobalUser'
import FlexContainer from 'components/Common/FlexContainer'
import { COLORS } from 'theme'
import { FormEventHandler, useEffect, useMemo, useState } from 'react'
import { getBlockchain } from '@reach-sh/humble-sdk'
import useToast from 'hooks/useToast'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import { ERRORS, LABELS, WARNINGS } from 'constants/messages'
import { getTokenById } from 'helpers/pool'
import useGlobalDex from 'hooks/useGlobalDex'
import { isIOS } from 'react-device-detect'
import useIsMounted from 'hooks/useIsMounted'
import { captureException } from 'helpers/error'
import { paths } from 'App.routes'
import ConfirmCreateFarmModal from 'components/Modals/ConfirmCreateFarmModal'
import ErrorContainer from 'components/Common/ErrorContainer'
import WarningBox from 'components/Common/WarningBox'
import {
  initProgressBar,
  resetProgressBar,
  updateProgressBar,
} from 'state/reducers/progress-bar'
import { USDC } from 'constants/default-tokens'
import { createFarm, FarmFormData } from 'reach/bridge/FarmAdmin'
import CreateFarmDurations from './CreateFarm.Duration'
import CreateFarmRewards from './CreateFarm.Rewards'
import CreateFarmTokens from './CreateFarm.Tokens'
import CreateFarmSuccess from './CreateFarmSuccess'
import addFarmToAnnouncer from './addFarmToAnnouncer'
import {
  checkPoolsContainingTokenId,
  validateFarmForm,
} from './CreateFarmForm.Validate'

const ContainerCss = css`
  max-width: 100%;
  width: 42rem;
  @media screen and (max-width: ${SIZE.md}) {
    padding: 0;
    width: 100%;
  }
`
const SubmitButton = styled(WideButton)`
  font-size: 20px;
  font-weight: bolder;
  margin-top: 20px;
`
const Centered = styled(FlexContainer)`
  color: ${COLORS.midGray};
  font-size: 16px;
  padding: 1.5rem 0;
  place-content: center;
  ${ContainerCss}
`
const FormContent = styled(Form)`
  ${ContainerCss}
  padding: 0 1.5rem;

  ${LabelHeading} {
    font-weight: bold;
  }
`

const MISSING_TVL = t`APR and TVL cannot be calculated for this reward token.`

const CreateFarmForm = () => {
  const { pathname } = useLocation()
  const isPublicFarm = pathname === paths.farm.create
  const { reachAccount: account, connected, connecting } = useGlobalUser()
  const { tokenList } = useGlobalDex(['tokenList'])
  const { launchToast, removeToasts } = useToast()
  const [data, setData] = useState<FarmFormData>()
  const [inProgress, setInProgress] = useState(false)
  const [contractId, setContractId] = useState<string | number | undefined>('')
  const [isNetworkRewardChecked, setIsNetworkRewardChecked] = useState(false)
  const [isTokenRewardChecked, setIsTokenRewardChecked] = useState(false)
  const [missingTVL, warnMissingTVL] = useState(false)
  const getNetworkTokenBalance = () =>
    Number(getTokenById(NETWORK_TOKEN_DEFAULT_ID)?.balance || 0)
  const userBal = useMemo(() => getNetworkTokenBalance(), [tokenList])
  const [tooltipMsg, setTooltipMsg] = useState<string>('')
  const isMounted = useIsMounted()
  const appendData = async (updates: Partial<FarmFormData>) => {
    const next = { ...(data || {}), ...updates } as FarmFormData
    next.isPublicFarm = isPublicFarm
    setData(next)

    // Validation
    const CREATE_FARM_FEE = 2
    const minBal = getTokenById(NETWORK_TOKEN_DEFAULT_ID)?.minBalance || 0
    const requiredAcctMin = minBal + CREATE_FARM_FEE
    const maxExpense = isPublicFarm ? Number(next?.networkRewards || 0) : 0

    switch (true) {
      case requiredAcctMin > userBal: {
        const e = t({
          message: `You need a minimum of ${requiredAcctMin} ${getBlockchain()} to create a farm`,
        })
        return setTooltipMsg(e)
      }

      case userBal <= maxExpense + requiredAcctMin: {
        const curr = (n: number) => `${n} ${getBlockchain()}`
        const isb2 = t({
          message: `Your ${curr(maxExpense)} expense exceeds your min balance.`,
        })
        return setTooltipMsg(`${WARNINGS.BALANCE_LOW} ${isb2}`)
      }

      default: {
        const validation = await validateFarmForm(next, {
          networkRewardsAmt: isNetworkRewardChecked,
          requiredAcctMin,
          rewardsSelected: !isNetworkRewardChecked && !isTokenRewardChecked,
          tokenRewardsAmt: isTokenRewardChecked,
          isPublicFarm,
        })

        return setTooltipMsg(validation)
      }
    }
  }

  // Form field validation
  const isFormFilled = useMemo(() => {
    const { networkRewards, totalReward, startDateTime, endDateTime } =
      data || {}
    const hasEnoughRewardTokens = Number(networkRewards || 0) < userBal
    const hasRewards = Number(networkRewards || totalReward || 0) > 0
    const validatedNetworkRewards = !isPublicFarm || hasEnoughRewardTokens

    return (
      hasRewards &&
      Boolean(startDateTime && endDateTime) &&
      validatedNetworkRewards
    )
  }, [data])

  useEffect(() => {
    warnMissingTVL(!checkPoolsContainingTokenId(data?.rewardTokenId))
  }, [data])

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      removeToasts()
      launchToast('reject', { message: ERRORS.UNKNOWN }, undefined, {
        autoClose: 30000,
      })
      setInProgress(false)
      captureException(event.reason, 'FarmCreation')
    }
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  useEffect(() => {
    if (userBal) appendData({}) // Trigger form validation
  }, [tokenList])

  const closeModal = () => setContractId('')
  const handleSelectReward = (reward: string, checked: boolean) => {
    if (reward === 'other') setIsTokenRewardChecked(checked)
    else setIsNetworkRewardChecked(checked)
  }

  // Submit-action handler
  const handleSubmit = async () => {
    if (!account) return
    setInProgress(true)
    if (data === undefined) return
    const toastProps: any = { message: 'Creating Farm' }
    const ac = { autoClose: false }
    const toastId = launchToast('progress', toastProps, undefined, ac)
    const formData = { ...data }
    if (!formData.rewardTokenId) formData.rewardTokenId = USDC()
    const result = await createFarm(formData)
    const done = () => {
      resetProgressBar()
      removeToasts(toastId)
      if (isMounted()) {
        setInProgress(false)
        if (result.poolAddress) setContractId(result.poolAddress)
      }
    }

    // Exit if failure
    if (!(result.poolAddress && result.succeeded)) {
      captureException(result.message, 'FarmCreation')
      toastProps.message = result.message
      done()
      launchToast('reject', toastProps, undefined, { autoClose: false })
      return
    }

    // Exit if partner farm (since you can't stake yet)
    if (!isPublicFarm) {
      done()
      return
    }

    // Announce permissionless farm
    initProgressBar(1)
    updateProgressBar(t({ message: 'Publishing Farm ...' }))
    const farmWasAnnounced = await addFarmToAnnouncer(
      account,
      result.poolAddress?.toString(),
      formData.stakeTokenId.toString(),
      formData.rewardTokenId.toString(),
    )
    if (farmWasAnnounced) done()
    else {
      const msg1 = t({ message: 'Your Farm was created but not listed.' })
      const msg2 = t({
        message: `Please contact support with your wallet address and the contract ID "${result.poolAddress}."`,
      })
      const msg3 = t({ message: 'We will make sure it gets listed.' })
      const msg = `${msg1} ${msg2} ${msg3}`.trim()
      resetProgressBar()
      launchToast('reject', { message: msg }, undefined, { autoClose: false })
    }
  }

  // Form component or loading message
  const [confirmCreate, setConfirmCreate] = useState(false)
  const showConfirmCreate: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isPublicFarm) setConfirmCreate(true)
    else handleSubmit()
  }
  const onConfirmCreate = () => {
    setConfirmCreate(false)
    handleSubmit()
  }

  const formAction = isPublicFarm
    ? LABELS.CREATE.FARM
    : LABELS.CREATE.PARTNER_FARM

  // Form component or loading message
  const renderForm = () =>
    connected ? (
      <FormContent data-test='create-farm-form' onSubmit={showConfirmCreate}>
        <CreateFarmTokens
          onFarmTokens={appendData}
          rewardTokenId={data?.rewardTokenId}
        />
        <CreateFarmRewards
          isPublicFarm={isPublicFarm}
          onRewardsChange={appendData}
          onSelectReward={handleSelectReward}
          ownNetworkTokens={userBal}
          showNetworkReward={isNetworkRewardChecked}
          showTokenReward={isTokenRewardChecked}
          stakeTokenId={data?.stakeTokenId}
        />
        <CreateFarmDurations onDurationChange={appendData} />
        <Break size='lg' />
        {tooltipMsg !== '' && (
          <ErrorContainer
            data-testid='create-farm-error-message'
            text={tooltipMsg}
          />
        )}
        {missingTVL && <WarningBox text={MISSING_TVL} />}
        <SubmitButton
          data-test='submit-button'
          disabled={
            isIOS ||
            inProgress ||
            !isFormFilled ||
            !!tooltipMsg ||
            (data && data.stakeTokenId === data.rewardTokenId)
          }
        >
          {formAction}
        </SubmitButton>
      </FormContent>
    ) : (
      <Centered>Connect a Wallet to continue</Centered>
    )

  return (
    <section>
      <BackToPoolButton returnTo='farm' />

      <Card padded title={formAction}>
        {connecting ? (
          <Centered>
            <Trans>Please wait ...</Trans>
          </Centered>
        ) : (
          renderForm()
        )}
      </Card>

      <ConfirmCreateFarmModal
        open={confirmCreate}
        onClose={() => setConfirmCreate(false)}
        onConfirm={onConfirmCreate}
      />

      <CreateFarmSuccess
        contractId={contractId?.toString() || ''}
        isCreateFarm={isPublicFarm}
        open={contractId !== ''}
        onClose={closeModal}
      />
    </section>
  )
}

export default CreateFarmForm
