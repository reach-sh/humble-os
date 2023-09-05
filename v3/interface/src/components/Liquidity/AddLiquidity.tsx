import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import Card from 'components/Common/Card'
import PairCard from 'components/Common/PairCard'
import { Pool, Token } from 'types/shared'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { WideButton, BackToPoolButton } from 'components/Common/Button'
import {
  getOwnershipOfPool,
  notEnoughFunds,
  getTokenById,
  belowMinBalance,
  minBalMessageCap,
  isTokenOptedIn,
  optInToById,
} from 'helpers/pool'
import { deposit } from 'reach/api/liquidityProvider'
import { defaultDecimals, useReach } from 'helpers/getReach'
import MIN_TOKEN_BALANCE from 'constants/min-token-balance'
import ErrorNotification from 'components/Common/ErrorNotification'
import LiquidityDisclaimer from 'components/Common/LiquidityDisclaimer'
import { getValueWithMaxDecimals } from 'utils/input'
import { formatCurrency, loadFormattedPool, parseCurrency } from 'reach/utils'
import { getExports as getUtilExports } from 'reach/build/util.default.mjs'
import SuccessPoolModal from 'components/Modals/SuccessPoolModal'
import MobileWalletConfirmationModal from 'components/Modals/MobileWalletConfirmationModal'
import WarningBox from 'components/Common/WarningBox'
import { MODAL, clearGlobalModal } from 'state/reducers/modals'
import { cacheUsersAssets } from 'cache'
import SIZE from 'constants/screenSizes'
import Countdown from 'components/Common/Countdown'
import { asMaybe } from '@reach-sh/humble-sdk'
import { shouldConfirmMobileWallet } from 'helpers/user'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { getComputeMint } from '@reach-sh/humble-sdk/lib/build/backend'
import ArrowFromTo from 'components/Common/Icons/arrow-from-to'
import PoolTokenCard from 'components/Common/PoolTokenCard'
import { executeNPSSurvey } from 'utils/inject-scripts'
import IconButtonWrapper from 'components/Common/IconButtonWrapper'
import LineUpChart from 'components/Common/Icons/line-up-chart'
import FlexContainer from 'components/Common/FlexContainer'
import ModalComponent from 'components/Modals/ModalComponent'
import { useIsMobile } from 'hooks/useScreenSize'
import useGlobalUser from 'hooks/useGlobalUser'
import PoolHistoryChart from 'components/Charts/PoolHistoryChart'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalModal from 'hooks/useGlobalModal'

const AddLiquidityContainer = styled.div``

const SelectWrapper = styled.div`
  margin-bottom: 0.5rem;
  p {
    margin-left: 1rem;
  }
`

const PlusSign = styled.p`
  text-align: center;
  font-size: 1.5rem;
`

const RateContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0.75rem 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.cardText};
`
const RateText = styled.p`
  font-size: 15px;
`
const ReverseRateText = styled.p`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 13px;
  text-align: right;
  margin: 5px 0;
`
const RateValues = styled.div`
  color: ${({ theme }) => theme.colors.cardText};
`

const ShareOfPoolContainer = styled.div`
  margin: 0 0.5rem;
`
const ShareRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`
const CurrentShareText = styled.p`
  color: ${({ theme }) => theme.colors.accent};
`
const TotalShareText = styled.p`
  font-weight: bold;
  font-size: 16px;
`
const AddLiquidityButton = styled(WideButton)`
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: 18px;
`

const ProgressWrapper = styled(FlexContainer)`
  position: absolute;
  gap: 8px;
  top: 23px;
  right: 21px;
  width: auto;

  @media (max-width: ${SIZE.sm}) {
    top: 7px;
  }
`

type RouteParams = {
  poolId: string
}

const AddLiquidity = () => {
  const reach = useReach()
  // TODO this doAvgView function should be migrated to the SDK
  const { doAvgView } = getUtilExports(reach)
  const { poolId } = useParams<RouteParams>()
  const { search } = useLocation()
  const returnTo = new URLSearchParams(search).get('returnTo') || 'pool'
  const { pools, addingLiquidity, tokenList } = useGlobalDex([
    'pools',
    'addingLiquidity',
    'tokenList',
  ])
  const { modal } = useGlobalModal()
  const { reachAccount } = useGlobalUser()
  const [showChart, setShowChart] = useState(false)
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null)
  const [selectedTokenA, setSelectedTokenA] = useState<Token>()
  const [selectedTokenB, setSelectedTokenB] = useState<Token>()
  const [selectedTokenAAmt, setSelectedTokenAAmt] = useState<string>('')
  const [selectedTokenBAmt, setSelectedTokenBAmt] = useState<string>('')
  const [selectedPoolTokenBalance, setSelectedPoolTokenBalance] = useState<
    number | undefined
  >()
  const [optedPoolToken, setOptedPoolToken] = useState<boolean | 'loading'>(
    'loading',
  )
  const [prevLiquidity, setPrevLiquidity] = useState(0)
  const [showOptInModal, setShowOptInModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [futureOwnership, setFuteOwnership] = useState('')
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  // refresh token list when component mounts
  // helps ensure token balances are up to date
  useEffect(() => {
    cacheUsersAssets(reachAccount)
  }, [])

  const messages = {
    default: t`Add Liquidity`,
    insufficientFunds: t`Not enough %% tokens`,
    minBalance: t`Must maintain a minimum balance of`,
  }
  const [message, setMessage] = useState<string>(messages.default)

  const fmtAmtA = Number(selectedTokenAAmt)
  const fmtAmtB = Number(selectedTokenBAmt)

  const ownershipOfPool =
    selectedPool &&
    getOwnershipOfPool(
      selectedPool.liquidityAmount,
      selectedPool.mintedLiquidityTokens,
    )

  // check if any step in the LP provider flow will overflow with incoing amount(s)
  const checkOverflow = (amt: string, tokenA: boolean): boolean => {
    if (!selectedTokenA || !selectedTokenB || !amt) return false
    // make sure calulating future ownership will not overflow with incoming amount
    const pool = pools.find((p) => (p?.poolAddr || '').toString() === poolId)
    if (!pool) return false
    const fmtAmt = Number(amt)
    const amtA = tokenA ? fmtAmt : selectedTokenAAmt
    const amtB = tokenA ? selectedTokenBAmt : fmtAmt
    const { tokABalance, tokBBalance, mintedLiquidityTokens } = pool
    if (!tokABalance && !tokBBalance) return false
    try {
      // make sure sure both amounts can be parsed without an overflow
      const parsedAmtA = parseCurrency(amtA, selectedTokenA.decimals)
      const parsedAmtB = parseCurrency(amtB, selectedTokenB.decimals)
      const fmtTokABal = parseCurrency(tokABalance, selectedTokenA.decimals)
      const fmtTokBBal = parseCurrency(tokBBalance, selectedTokenB.decimals)
      const fmtMintedToks = reach.bigNumberify(mintedLiquidityTokens)
      // getting default pool balance (UInt.max)
      const poolBalance = reach.bigNumberify(2).pow(64).sub(1)
      // make sure doAvg will not overflow
      doAvgView(
        parsedAmtA,
        fmtTokABal,
        parsedAmtB,
        fmtTokBBal,
        fmtMintedToks,
        poolBalance,
      )
      return false
    } catch (err) {
      // @TODO | handle overflow error
      return true
    }
  }

  useEffect(() => {
    const pool = pools.find((p) => (p?.poolAddr || '').toString() === poolId)

    if (pool === undefined) return
    const { tokAId, tokBId } = pool
    const tokA = getTokenById(tokAId)
    const tokB = getTokenById(tokBId)
    setSelectedTokenA(tokA)
    setSelectedTokenB(tokB)
    setSelectedPool(pool)
    if (selectedTokenAAmt !== '') setAmount(selectedTokenAAmt, true)
    getBalanceOfPoolToken(pool)
    setValidationMessage()
  }, [pools, tokenList])

  useEffect(() => {
    setValidationMessage()
    getFutureOwnership()
  }, [selectedTokenAAmt, selectedTokenBAmt, tokenList])

  useEffect(() => {
    if (
      !selectedPool ||
      selectedTokenAAmt === '.' ||
      selectedTokenBAmt === '.'
    ) {
      setFuteOwnership('0.00%')
      return
    }
    if (ownershipOfPool === '100.00') setFuteOwnership('100%')
    if (selectedPool.tokABalance === 0 && selectedPool.tokBBalance === 0)
      setFuteOwnership('0.00%')
  }, [selectedPool])

  useEffect(() => {
    const checkOptIn = async () => {
      const poolTokenOptedIn = selectedPool
        ? await isTokenOptedIn(selectedPool.poolTokenId)
        : 'loading'
      setOptedPoolToken(poolTokenOptedIn)
    }
    checkOptIn()
  }, [selectedPool])

  const optIn = useCallback(async () => {
    const shouldConfirm = shouldConfirmMobileWallet()

    if (shouldConfirm) {
      setShowOptInModal(true)
    }

    if (selectedPool?.poolTokenId) {
      const optedResult = await optInToById(selectedPool?.poolTokenId)
      setOptedPoolToken(optedResult)
    }

    if (shouldConfirm) {
      setShowOptInModal(false)
    }
  }, [selectedPool])

  const getBalanceOfPoolToken = async (pool: Pool | null) => {
    if (!reachAccount) return null
    const balance = await reach.balanceOf(reachAccount, pool?.poolTokenId || 0)
    const formattedBalance = reach.bigNumberToNumber(balance)
    setSelectedPoolTokenBalance(formattedBalance)
    return formattedBalance
  }

  const doesNotHaveFunds = () =>
    notEnoughFunds(
      fmtAmtA,
      fmtAmtB,
      selectedTokenA?.balance,
      selectedTokenB?.balance,
    )

  const getInsufficientTokens = () =>
    [
      ...(fmtAmtA > (Number(selectedTokenA?.balance) || 0)
        ? [selectedTokenA?.symbol]
        : []),
      ...(fmtAmtB > (Number(selectedTokenB?.balance) || 0)
        ? [selectedTokenB?.symbol]
        : []),
    ].join(' and ')

  const setValidationMessage = () => {
    if (doesNotHaveFunds()) {
      const missing = getInsufficientTokens()
      setMessage(messages.insufficientFunds.replace('%%', missing))
    } else if (selectedTokenA && belowMinBalance(selectedTokenA, fmtAmtA)) {
      setMessage(messages.minBalance)
    } else {
      setMessage(messages.default)
    }
  }

  const getMintedAmount = (amt: any, balance: any, mintedAmount: any) =>
    (amt * mintedAmount) / balance

  // eslint-disable-next-line consistent-return
  const getFutureOwnership = () => {
    if (!selectedPool) return
    if (
      ownershipOfPool === '100.00' ||
      selectedPool.mintedLiquidityTokens === 0
    ) {
      setFuteOwnership('100%')
      return
    }
    const mintA = getMintedAmount(
      selectedTokenAAmt,
      selectedPool.tokABalance,
      selectedPool.mintedLiquidityTokens,
    )
    const mintB = getMintedAmount(
      selectedTokenBAmt,
      selectedPool.tokBBalance,
      selectedPool.mintedLiquidityTokens,
    )
    const mintedTokens = (mintA + mintB) / 2
    const newPooolTokenTotal = selectedPool.mintedLiquidityTokens + mintedTokens
    const num = mintedTokens + selectedPool.liquidityAmount
    const den = newPooolTokenTotal
    const ownership = num / den
    if (ownership > 0 && ownership < 0.01) setFuteOwnership('<.01')
    setFuteOwnership(`≈${(ownership * 100).toFixed(2)}%`)
  }

  const calculateOppositeToken = (
    pool: Pool | null,
    tokenA: boolean,
    selectedTokenAmount: number,
    setter: (value: string) => void,
  ) => {
    if (pool === null) {
      setter('')
      return
    }

    const tokABalance = pool?.tokABalance || 0
    const tokBBalance = pool?.tokBBalance || 0

    if (tokABalance === 0 && tokBBalance === 0) {
      return
    }
    if (
      tokABalance === 0 ||
      tokBBalance === 0 ||
      selectedTokenAmount === 0 ||
      Number.isNaN(selectedTokenAmount)
    ) {
      setter('')
    } else {
      const conversionRate = tokenA
        ? tokBBalance / tokABalance
        : tokABalance / tokBBalance
      const oppTokAmount = selectedTokenAmount * conversionRate
      const tokDecimals = tokenA
        ? defaultDecimals(selectedTokenB?.decimals)
        : defaultDecimals(selectedTokenA?.decimals)
      const minimum = Number(`1.0e-${tokDecimals}`)
      if (oppTokAmount < minimum) {
        setter('0')
        return
      }
      const fmtOppTokAmt = getValueWithMaxDecimals(
        oppTokAmount.toString(),
        tokDecimals,
      )
      setter(fmtOppTokAmt)
    }
  }

  const isInitialDeposit =
    selectedPool?.tokABalance === 0 && selectedPool?.tokBBalance === 0
  const isLiquidityTooLow =
    Boolean(isInitialDeposit && fmtAmtA && fmtAmtB) &&
    (fmtAmtA < MIN_TOKEN_BALANCE || fmtAmtB < MIN_TOKEN_BALANCE)

  const addLiquidityDisabled = () =>
    selectedPool === null ||
    addingLiquidity ||
    selectedTokenB === undefined ||
    selectedTokenA === undefined ||
    fmtAmtA === 0 ||
    fmtAmtB === 0 ||
    doesNotHaveFunds() ||
    (selectedTokenA ? belowMinBalance(selectedTokenA, fmtAmtA) : false) ||
    isLiquidityTooLow

  const setAmount = (amt: string, tokenA: boolean) => {
    if (!selectedPool) return
    const fmtAmt = amt === '.' ? '0.' : amt
    const amtNumber = Number(fmtAmt)
    // ensure incoming values will not cause an overflow
    const willOverflow = amtNumber ? checkOverflow(amt, tokenA) : false
    if (willOverflow && amtNumber > Number(selectedTokenAAmt)) return
    if (tokenA) {
      setSelectedTokenAAmt(fmtAmt)
      calculateOppositeToken(
        selectedPool,
        tokenA,
        amtNumber,
        setSelectedTokenBAmt,
      )
    } else {
      setSelectedTokenBAmt(fmtAmt)
      calculateOppositeToken(
        selectedPool,
        tokenA,
        amtNumber,
        setSelectedTokenAAmt,
      )
    }
  }

  const supplyLiquidity = async () => {
    sendGoogleTagEvent('LIQUIDITY-Begin_Add', reachAccount, search)
    if (!selectedPool || !selectedTokenA || !selectedTokenB) return
    setPrevLiquidity(selectedPool.liquidityAmount)
    const poolAddr = (selectedPool?.poolAddr || '').toString()

    let poolTokenBalance: any = selectedPoolTokenBalance
    if (poolTokenBalance === undefined)
      poolTokenBalance = await getBalanceOfPoolToken(selectedPool)

    const poolMintedAmount = selectedPool.mintedLiquidityTokens

    const res = await deposit(
      poolAddr,
      fmtAmtA,
      selectedTokenA,
      fmtAmtB,
      selectedTokenB,
      reachAccount,
      poolTokenBalance,
      poolMintedAmount,
    )
    if (res?.succeeded) {
      sendGoogleTagEvent('LIQUIDITY-Complete_Add', reachAccount, search)
      setSuccessModal(true)
    } else {
      sendGoogleTagEvent('LIQUIDITY-ERROR_Add_liquidity', reachAccount, search)
    }
  }

  const onMaxSelect = (maxInput: number, tokenA: boolean) =>
    setAmount(maxInput.toString(), tokenA)

  const addedLiquidityAmount = () => {
    if (!selectedPool) return ''
    const getExpectedMint = getComputeMint(reach)
    const { tokABalance, tokBBalance, mintedLiquidityTokens } = selectedPool

    const calculated = getExpectedMint(
      {
        A: reach.parseCurrency(selectedTokenAAmt, selectedTokenA?.decimals),
        B: reach.parseCurrency(selectedTokenBAmt, selectedTokenB?.decimals),
      },
      {
        A: reach.parseCurrency(tokABalance, selectedTokenA?.decimals),
        B: reach.parseCurrency(tokBBalance, selectedTokenB?.decimals),
      },
      {
        A: reach.parseCurrency(formatCurrency(mintedLiquidityTokens)), // Not used
        B: reach.parseCurrency(formatCurrency(mintedLiquidityTokens)),
      },
    )

    return formatCurrency(calculated)
  }

  const updatePool = async () => {
    if (!selectedPool) return
    const poolAddress = selectedPool.poolAddr.toString()
    const tokenA: any = asMaybe(selectedPool.tokAId)
    await loadFormattedPool(reachAccount, poolAddress, tokenA)
  }

  const onSuccessAddLiquidity = () => {
    executeNPSSurvey()
    setSuccessModal(false)
    navigate(`/${returnTo}`)
  }

  const successModalIsOpen = () =>
    successModal &&
    !addingLiquidity &&
    selectedTokenA !== undefined &&
    selectedTokenB !== undefined

  if (!selectedPool || !selectedTokenA || !selectedTokenB) return null

  return (
    <AddLiquidityContainer>
      <BackToPoolButton returnTo={returnTo} />
      <Card title='Add Liquidity' padded>
        <ProgressWrapper>
          <IconButtonWrapper onClick={() => setShowChart(!showChart)}>
            <LineUpChart />
          </IconButtonWrapper>
          <Countdown
            duration={5}
            onCountDownZero={updatePool}
            tooltip={t`Info refreshing in 4 seconds. Info will refresh immediately if you click on this loading icon.`}
          />
        </ProgressWrapper>
        <SelectWrapper>
          <p>
            <Trans>First Token</Trans>:
          </p>
          <PairCard
            amount={selectedTokenAAmt}
            featured={fmtAmtA > (Number(selectedTokenA?.balance) || 0)}
            onInputChange={(amt: string) => setAmount(amt, true)}
            onMaxClick={onMaxSelect}
            selectedTokId={selectedTokenA?.id.toString()}
            tokenA
            tokenList={selectedTokenA ? [selectedTokenA] : []}
            tokenLocked
          />
        </SelectWrapper>
        <PlusSign>+</PlusSign>
        <SelectWrapper>
          <p>
            <Trans>Second Token</Trans>:
          </p>
          <PairCard
            amount={selectedTokenBAmt}
            featured={fmtAmtB > (Number(selectedTokenB?.balance) || 0)}
            maxEnabled
            onInputChange={(amt: string) => setAmount(amt, false)}
            onMaxClick={onMaxSelect}
            selectedTokId={selectedTokenB?.id?.toString()}
            tokenA={false}
            tokenList={selectedTokenB ? [selectedTokenB] : []}
            tokenLocked
          />
        </SelectWrapper>
        {!addLiquidityDisabled() && (
          <>
            <PlusSign>
              <ArrowFromTo />
            </PlusSign>
            <SelectWrapper>
              <p>{t`You will receive`}</p>
              <PoolTokenCard
                amount={addedLiquidityAmount()}
                poolTokenId={selectedPool.poolTokenId}
                tokenAId={selectedTokenA.id}
                tokenASymbol={selectedTokenA.symbol}
                tokenBId={selectedTokenB.id}
                tokenBSymbol={selectedTokenB.symbol}
              />
            </SelectWrapper>
          </>
        )}
        <ShareOfPoolContainer>
          <ShareRow>
            <CurrentShareText>
              Share of the pool you already have
            </CurrentShareText>
            <CurrentShareText>{ownershipOfPool}%</CurrentShareText>
          </ShareRow>
          <ShareRow>
            <TotalShareText>
              Total share of pool after transaction
            </TotalShareText>
            <TotalShareText>{futureOwnership}</TotalShareText>
          </ShareRow>
        </ShareOfPoolContainer>
        {/* when I used `&&` here it was rendering a "0" in the dom...not sure why so made a ternary */}
        {selectedPool.tokBBalance && selectedPool.tokABalance ? (
          <RateContainer>
            <RateText>
              <Trans>Rate</Trans>
            </RateText>
            <RateValues>
              <RateText>
                {selectedPool.tokABalance / selectedPool.tokABalance}{' '}
                {selectedTokenA?.symbol}
                {' = '}
                {(selectedPool.tokBBalance / selectedPool.tokABalance).toFixed(
                  defaultDecimals(selectedTokenB?.decimals),
                )}{' '}
                {selectedTokenB?.symbol}
              </RateText>
              <ReverseRateText>
                {selectedPool.tokBBalance / selectedPool.tokBBalance}{' '}
                {selectedTokenB?.symbol}
                {' = '}
                {(selectedPool.tokABalance / selectedPool.tokBBalance).toFixed(
                  defaultDecimals(selectedTokenA?.decimals),
                )}{' '}
                {selectedTokenA?.symbol}
              </ReverseRateText>
            </RateValues>
          </RateContainer>
        ) : null}
        {isLiquidityTooLow && (
          <ErrorNotification boldText>
            <Trans>
              Please provide more than {MIN_TOKEN_BALANCE} tokens for token A or
              token B
            </Trans>
          </ErrorNotification>
        )}
        {doesNotHaveFunds() && (
          <WarningBox
            title={`${t`Not enough ${getInsufficientTokens()} tokens to add liquidity`}`}
          />
        )}
        {!optedPoolToken ? (
          <AddLiquidityButton data-testid='opt-in-button' onClick={optIn}>
            {`Opt-in to ${selectedTokenA?.symbol ?? ''} ${
              selectedTokenB?.symbol ?? ''
            } LP Token`}
          </AddLiquidityButton>
        ) : (
          <AddLiquidityButton
            data-testid='add-liq-button'
            onClick={supplyLiquidity}
            className={addLiquidityDisabled() ? 'disabled' : undefined}
            disabled={addLiquidityDisabled()}
          >
            {message}{' '}
            {minBalMessageCap(
              message,
              messages.minBalance,
              selectedTokenA?.minBalance,
            )}
          </AddLiquidityButton>
        )}
        <LiquidityDisclaimer />
      </Card>
      {selectedPool && showChart && (
        <ModalComponent
          open={showChart}
          onClose={() => setShowChart(false)}
          width={isMobile ? 390 : 850}
          sticky={false}
        >
          <PoolHistoryChart poolId={String(selectedPool.poolAddr)} />
        </ModalComponent>
      )}
      {selectedTokenA !== undefined && selectedTokenB !== undefined && (
        <MobileWalletConfirmationModal
          open={modal === MODAL.MOBILE_CONFIRM}
          onClose={clearGlobalModal}
          action='adding'
          tokenAAmt={selectedTokenAAmt}
          tokenASymbol={selectedTokenA.symbol}
          tokenBAmt={selectedTokenBAmt}
          tokenBSymbol={selectedTokenB.symbol}
        />
      )}
      {successModalIsOpen() && (
        <SuccessPoolModal
          open={successModalIsOpen()}
          title='You added liquidity!'
          image='add'
          onClose={onSuccessAddLiquidity}
          amount={(selectedPool.liquidityAmount - prevLiquidity).toString()}
          tokenA={selectedTokenA as Token}
          tokenB={selectedTokenB as Token}
          tokenAAmount={Number(selectedTokenAAmt)}
          tokenBAmount={Number(selectedTokenBAmt)}
        />
      )}
      <MobileWalletConfirmationModal
        open={showOptInModal}
        onClose={() => setShowOptInModal(false)}
        action='optingIn'
        tokenASymbol={`${selectedTokenA.symbol} / ${selectedTokenB.symbol}`}
        tokenAAmt='0'
      />
    </AddLiquidityContainer>
  )
}

export default AddLiquidity
