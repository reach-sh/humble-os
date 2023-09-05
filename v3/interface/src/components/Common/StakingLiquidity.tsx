import { ChangeEvent, Fragment, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { useTheme } from 'contexts/theme'
import { Link, useLocation } from 'react-router-dom'
import { blockInvalidChar, truncateText } from 'utils/input'
import { getTokenById, isTokenOptedIn, optInToById } from 'helpers/pool'
import { COLORS } from 'theme'
import { Token } from 'types/shared'
import SIZE from 'constants/screenSizes'
import FlexContainer, {
  FlexColumnContainer,
} from 'components/Common/FlexContainer'
import Button from 'components/Common/Button'
import WarningBox from 'components/Common/WarningBox'
import WalletIcon from 'assets/Icons/wallet.svg'
import WalletDarkIcon from 'assets/Icons/wallet-dark.svg'
import {
  NETWORK_TOKEN_DEFAULT_ID,
  STAKE_TRANSACTION_FEE,
} from 'constants/reach_constants'
import { GlobalDex } from 'state/reducers/dex'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import limitedFarms from 'cache/limit-stake-farms.json'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalModal from 'hooks/useGlobalModal'
import { GlobalUser } from 'state/reducers/user'
import { MODAL } from 'state/reducers/modals'
import ModalComponent from '../Modals/ModalComponent'
import Tooltip from './Tooltip'
import ErrorContainer from './ErrorContainer'

const ModalContent = styled(FlexColumnContainer)`
  padding: 16px;
`
const Subtitle = styled.div`
  color: ${({ theme }) => theme.colors.textAlt2};
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
`
const Buttons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-top: 50px;
  button {
    flex-grow: 1;
    font-size: 20px;
    font-weight: 700;
    height: 54px;
    @media (max-width: ${SIZE.xs}) {
      min-width: unset;
    }
  }
`
const CloseButton = styled(Button)`
  background: ${COLORS.white};
  &:not([disabled]):hover {
    background-color: ${COLORS.white};
  }
  font-weight: 700;
  font-size: 20px;
  font-family: Lato;
`

const StakeButton = styled(Button)`
  background-color: ${COLORS.yellow};
  font-weight: 700;
  font-size: 20px;
  font-family: Lato;
  &:disabled {
    background-color: ${COLORS.lightGray};
    padding: 20px;
  }
`
const BoxContainer = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.boxBorder};
  max-width: 420px;
  padding: 10px;
`
const Row = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  &:last-child {
    border-top: 1px solid ${({ theme }) => theme.colors.boxBorder};
    margin: 8px -10px -10px -10px;
    padding: 0 10px;
  }
`

const RowContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
  > div:last-of-type {
    overflow: hidden;
    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`

// TODO: consolidate this input modal with the one in the PairCard
const AmountInput = styled.input`
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  text-align: right;
  font-weight: bold;
  font-size: 24px;
  line-height: 29px;
  width: 100%;
  &:focus {
    outline: none;
  }
  &::placeholder {
    color: #9ca2aa;
  }
  @media (max-width: ${SIZE.sm}) {
    font-size: 21px;
  }
`
type SpanProps = { fontSize?: number; fontWeight?: number }
const Span = styled.span<SpanProps>`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ fontSize }) => fontSize || '32'}px;
  font-weight: ${({ fontWeight }) => fontWeight || '700'};
  margin: 0 4px;
  text-align: right;
`
const BalanceRow = styled.div`
  align-items: center;
  display: flex;
`
const Icon = styled.img``
const SelectorContainer = styled(FlexContainer)`
  gap: 8px;
  justify-content: space-between;
  padding: 10px 0;
  * {
    flex-grow: 1;
  }
`

const SelectorItem = styled.label`
  align-items: center;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.borderAlt};
  cursor: pointer;
  display: flex;
  font-size: 14px;
  font-weight: 600;
  height: 32px;
  justify-content: center;
`

const SelectorInput = styled.input.attrs({
  type: 'radio',
  name: 'selector',
})`
  display: none;
  &:checked + label {
    background-color: ${({ theme }) => theme.colors.selectorBg};
    color: ${({ theme }) => theme.colors.selectorTextColor};
  }
`

const StyledLink = styled(Link)`
  color: ${COLORS.darkSage};
  font-size: 16px;
  font-weight: 800;
  margin-top: 14px;
`

const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 16px;
`

interface PoolBoxDataProps {
  amount: string
  balance: string
  dark: boolean
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  tokenASymbol: string
  tokenBSymbol?: string
}

const PoolTokensBox = ({
  amount,
  balance,
  dark,
  onInputChange,
  tokenASymbol,
  tokenBSymbol,
}: PoolBoxDataProps) => (
  <BoxContainer>
    <Row>
      <RowContainer>
        <AmountInput
          type='text'
          onChange={(e) => onInputChange(e)}
          value={amount}
          onKeyDown={(e) => blockInvalidChar(e, amount)}
          placeholder='0.00'
          inputMode='decimal'
          style={{
            cursor: 'inherit',
            borderBottom: 'none',
          }}
        />
        <Span fontSize={12} fontWeight={400}>
          {`${tokenASymbol}${tokenBSymbol ? `/${tokenBSymbol}` : ''}`}
        </Span>
      </RowContainer>
    </Row>
    <Row>
      <BalanceRow>
        {dark ? (
          <Icon src={WalletDarkIcon} alt='wallet icon' />
        ) : (
          <Icon src={WalletIcon} alt='wallet icon' />
        )}
        <Span fontSize={14} fontWeight={400}>
          <Trans>Balance</Trans>
        </Span>
      </BalanceRow>
      <BalanceRow>
        <Span
          data-testid='your-balance'
          fontSize={12}
          fontWeight={400}
        >{`${balance} ${tokenASymbol}${
          tokenBSymbol ? `/${tokenBSymbol}` : ''
        }`}</Span>
      </BalanceRow>
    </Row>
  </BoxContainer>
)

interface SelectorProps {
  onSelect: (s: number) => void
  selected: number
  disabled: boolean
}

const SELECTOR_OPTIONS = [25, 50, 75, 100]

const Selector = ({ onSelect, selected, disabled }: SelectorProps) => (
  <SelectorContainer>
    {SELECTOR_OPTIONS.map((option) => (
      <Fragment key={option}>
        <SelectorInput
          checked={selected === option}
          id={option.toString()}
          onChange={(e) => onSelect(Number(e.target.value))}
          value={option}
          disabled={disabled}
        />
        <SelectorItem htmlFor={option.toString()}>{`${option}%`}</SelectorItem>
      </Fragment>
    ))}
  </SelectorContainer>
)

const StyledInfoBox = styled(FlexContainer)`
  background-color: ${({ theme }) => theme.colors.popoverBg};
  border-radius: 12px;
  justify-content: space-between;
  margin-top: 10px;
  padding: 8px 20px;
  gap: 10px;
  strong {
    font-weight: 600;
  }
  div {
    width: 50%;
    &:first-child {
      text-align: center;
      font-weight: 600;
      font-size: 15px;
    }
    &:last-child {
      font-weight: 400;
      font-size: 12px;
    }
  }
`

interface InfoBoxProps {
  amount: string
  children: React.ReactNode
  totalStaked: string
}

const InfoBox = ({ amount, children, totalStaked }: InfoBoxProps) => {
  const percentageOfFarm = (Number(amount) / Number(totalStaked)) * 100
  const formattedPercentage = parseFloat(percentageOfFarm.toFixed(6))
  return (
    <StyledInfoBox>
      <div>{`${formattedPercentage}%`}</div>
      <div>{children}</div>
    </StyledInfoBox>
  )
}

interface StakeLiquidityProps {
  fetchBalance: (...args: any[]) => PromiseLike<string>
  buttonText: string
  disabled?: boolean
  onClose: () => void
  onConfirm: (a: number) => void
  open: boolean
  showInfo?: boolean
  title: string
  tokenA: Token
  tokenB?: Token
  totalStaked?: string
  rewardToken?: Token
  showFarmWarning?: boolean
  stakedTokenDecimals: number
  stakedTokenPoolId?: string
}

const StakingLiquidity = ({
  fetchBalance = () => Promise.resolve('0'),
  buttonText,
  disabled,
  onClose,
  onConfirm,
  open,
  showInfo,
  title,
  tokenA,
  tokenB,
  totalStaked,
  rewardToken,
  showFarmWarning,
  stakedTokenDecimals,
  stakedTokenPoolId,
}: StakeLiquidityProps) => {
  const [amount, setAmount] = useState('')
  const [balance, setBalance] = useState('0')
  const [stakeBtnText, setStakeBtnText] = useState(buttonText)
  const [rewardTokenOptedIn, setRewardTokenOptedIn] = useState(false)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [selectedPercentage, setSelectedPercentage] = useState(0)
  const { theme } = useTheme()
  const { search } = useLocation()
  const { selectedStakeContractId } = useGlobalDex()
  const { modal } = useGlobalModal()
  const isDarkMode = theme === 'Dark'
  const isUnstaking = modal === MODAL.UNSTAKE_FARM
  const poolDepositPath = () => {
    if (!stakedTokenPoolId) return ''
    return `/pool/add/${stakedTokenPoolId}?returnTo=farm`
  }
  const displayPoolName = () => {
    if (!stakedTokenPoolId) return ''
    return `${tokenA.symbol}/${tokenB?.symbol}`
  }
  const loadBalance = async () => {
    const bal = await fetchBalance()
    setBalance(bal)
    setBalanceLoading(false)
    const amt = (Number(bal) * selectedPercentage) / 100
    setAmount(amt === 0 ? '' : amt.toFixed(stakedTokenDecimals))
  }
  const checkStakeBtnText = async (
    rewardTok: Token,
    btnTextOriginal: string,
  ) => {
    const result = await isTokenOptedIn(rewardTok.id)
    setRewardTokenOptedIn(result)
    const stakeBtnLabel = result
      ? btnTextOriginal
      : t`Opt in to ${rewardTok.symbol}`
    setStakeBtnText(stakeBtnLabel)
  }

  useEffect(() => {
    if (!rewardToken) return
    checkStakeBtnText(rewardToken, buttonText)
  }, [rewardToken, buttonText])

  const calcAmount = (percentage: number) => {
    setSelectedPercentage(percentage)
    const newAmount =
      percentage === 100
        ? balance
        : ((Number(balance) * percentage) / 100)
            .toFixed(stakedTokenDecimals)
            .toString()
    setAmount(newAmount)
  }

  // NOTE: Initial balance changes
  useEffect(() => {
    loadBalance()
  }, [tokenA.symbol, tokenB?.symbol])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setAmount(value)
    setSelectedPercentage(0)
  }

  const handleConfirmClick = async () => {
    if (!rewardTokenOptedIn) {
      await optInToById(rewardToken?.id)
      const { reachAccount } = GlobalUser.getState()
      sendGoogleTagEvent('FARMS-Reward_Token_opt-in', reachAccount, search)
      if (rewardToken) checkStakeBtnText(rewardToken, buttonText)
      return
    }
    GlobalDex.selectedFarmAmounts({ a: amount, b: undefined })
    onConfirm(Number(amount))
  }

  const networkToken = getTokenById(NETWORK_TOKEN_DEFAULT_ID)
  const minBalance = networkToken?.minBalance || 0
  const isEnoughBalance =
    Number(networkToken?.balance) > minBalance + STAKE_TRANSACTION_FEE

  const isButtonDisabled =
    disabled || Number(amount) > Number(balance) || !isEnoughBalance
  const noStake = Number(amount) === 0
  const tokenLabel = tokenB ? t`Pool Tokens` : t`Token`
  const effectiveBalance = useMemo(
    () => Number(amount) + Number(balance),
    [selectedStakeContractId, amount, balance],
  )
  const restrictedFarm = useMemo(() => {
    if (isUnstaking) return false
    const id = selectedStakeContractId?.toString()
    if (!id) return false
    return limitedFarms.farms.includes(id)
  }, [selectedStakeContractId, effectiveBalance])
  const restrictedBalance = useMemo(
    () => restrictedFarm && effectiveBalance >= 1000,
    [restrictedFarm, effectiveBalance],
  )
  const viewTitleSuffix = tokenB ? `/${tokenB.symbol}` : ''
  const viewTitle = `${tokenA.symbol}${viewTitleSuffix} ${tokenLabel}`
  const restrictedError = useMemo(() => {
    if (!restrictedFarm) return null
    const msg = `Staking in this farm is limited to 1000 ${viewTitle} per account.`
    const limit = 1000 - Number(balance || '0')
    if (balance === '0' || Number(amount) < limit) return msg
    if (limit < 0) return `${msg} Your stake is at or above the limit.`
    return `${msg} The maximum you can deposit is ${limit} tokens.`
  }, [restrictedFarm, amount, balance])

  return (
    <ModalComponent
      modalTitle={title}
      onClose={onClose}
      open={open}
      sticky={false}
      width={420}
    >
      <ModalContent>
        <Subtitle>{viewTitle}</Subtitle>
        <PoolTokensBox
          amount={amount}
          balance={balanceLoading ? 'Loading...' : balance}
          dark={isDarkMode}
          onInputChange={handleInputChange}
          tokenASymbol={tokenA.symbol}
          tokenBSymbol={tokenB?.symbol}
        />
        <Selector
          disabled={balance === '0' || !balance}
          onSelect={calcAmount}
          selected={selectedPercentage}
        />
        {showInfo && totalStaked && (
          <InfoBox amount={amount} totalStaked={totalStaked}>
            <Trans>
              Of the <strong>total value</strong> in this farm.
            </Trans>
          </InfoBox>
        )}
        {stakedTokenPoolId && (
          <StyledLink to={poolDepositPath()}>
            {truncateText(`Get ${displayPoolName()}`, 16)}
          </StyledLink>
        )}
        {showFarmWarning && (
          <WarningBox
            title={t`This farm is not from a Humble official partner`}
            text={t`Please triple check the trustworthiness of tokens`}
          />
        )}
        {restrictedFarm && restrictedError && (
          <ErrorContainer text={restrictedError} />
        )}
        <Buttons>
          <CloseButton onClick={onClose}>
            <Trans>Cancel</Trans>
          </CloseButton>
          <StakeButton
            disabled={restrictedBalance || isButtonDisabled || noStake}
            onClick={handleConfirmClick}
          >
            {isButtonDisabled ? (
              <>
                {restrictedBalance && 'Limit reached'}
                {!isEnoughBalance && (
                  <>
                    <TooltipWrapper>
                      <div>
                        <Trans>Not enough ALGO</Trans>
                      </div>
                      <Tooltip
                        position='topLeft'
                        message={t`Your account does not have enough ALGO to sign the transactions;
                      please add more ALGO so that it is above your wallets minimum balance of ${networkToken?.minBalance} ALGO`}
                      />
                    </TooltipWrapper>
                  </>
                )}
                {isEnoughBalance && !restrictedBalance && (
                  <Trans>Insufficient balance</Trans>
                )}
              </>
            ) : (
              <>{stakeBtnText}</>
            )}
          </StakeButton>
        </Buttons>
      </ModalContent>
    </ModalComponent>
  )
}

export default StakingLiquidity
