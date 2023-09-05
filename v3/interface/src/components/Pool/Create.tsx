import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { WideButton, BackToPoolButton } from 'components/Common/Button'
import SuccessPoolModal from 'components/Modals/SuccessPoolModal'
import PairCard from 'components/Common/PairCard'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalModal from 'hooks/useGlobalModal'
import createPool from 'reach/bridge/Admin/interface'
import MIN_TOKEN_BALANCE from 'constants/min-token-balance'
import { Token } from 'types/shared'
import Card from 'components/Common/Card'
import ErrorNotification from 'components/Common/ErrorNotification'
import {
  getPoolForTokens,
  sortByBalance,
  notEnoughFunds,
  belowMinBalance,
  minBalMessageCap,
} from 'helpers/pool'
import LiquidityDisclaimer from 'components/Common/LiquidityDisclaimer'
import ExchangeRate from 'components/Common/ExchangeRate'
import { parseAddress, parseCurrency } from 'reach/utils'
import { useReach } from 'helpers/getReach'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { getExports as getUtilExports } from 'reach/build/util.default.mjs'
import { getPreMintedAmt } from 'reach/api/liquidityProvider'
import { paths } from 'App.routes'
import MobileWalletConfirmationModal from 'components/Modals/MobileWalletConfirmationModal'
import { MODAL, clearGlobalModal } from 'state/reducers/modals'
import WarningBox from 'components/Common/WarningBox'
import { LABELS } from 'constants/messages'

const Container = styled.div``

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
  min-height: 3.5rem;
  display: flex;
  justify-content: space-between;
  margin: 0.75rem 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.cardText};
`

const CreatePoolButton = styled(WideButton)`
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: 18px;
`

const CreatePoolForm = () => {
  const { search } = useLocation()
  const { modal } = useGlobalModal()
  const { reachAccount } = useGlobalUser(['reachAccount'])
  const navigate = useNavigate()
  const reach = useReach()
  // TODO this verifySqrtView function should be migrated to the SDK
  const { verifySqrtView } = getUtilExports(reach)
  const { pools, creatingPool, tokenList } = useGlobalDex([
    'pools',
    'creatingPool',
    'tokenList',
  ])
  const [selectedTokenA, setSelectedTokenA] = useState<Token>()
  const [selectedTokenB, setSelectedTokenB] = useState<Token>()
  const [selectedTokenAAmt, setSelectedTokenAAmt] = useState<string>('')
  const [selectedTokenBAmt, setSelectedTokenBAmt] = useState<string>('')
  const fmtAmtA = Number(selectedTokenAAmt)
  const fmtAmtB = Number(selectedTokenBAmt)
  const [newPoolLiquidityAmount, setNewPoolLiquidityAmount] = useState<
    number | undefined
  >(undefined)

  // we need to check if the desired amounts will overflow in any step of the create pool
  // this will emit an error that can be caught and handled if there are any overflow issues
  const checkForOverflow = (amt: string, tokA: boolean) => {
    const fmtAmtToCheck = Number(amt)
    if (!fmtAmtToCheck) return
    const parsedIncomingVal = parseCurrency(
      fmtAmtToCheck,
      tokA ? selectedTokenA?.decimals : selectedTokenB?.decimals,
    )
    // make sure incoming amt can be converted to a number
    reach.bigNumberToNumber(parsedIncomingVal)
    const shouldCheck = tokA ? Boolean(amt && fmtAmtB) : Boolean(amt && fmtAmtA)
    if (!shouldCheck) return
    const amtA = tokA ? fmtAmtToCheck : fmtAmtA
    const amtB = tokA ? fmtAmtB : fmtAmtToCheck
    // makes sure both values can be parsed with their respected decimal amount
    const parsedAmtA = parseCurrency(amtA, selectedTokenA?.decimals)
    const parsedAmtB = parseCurrency(amtB, selectedTokenB?.decimals)
    // make sure both parsed amts can be converted to big numbers
    reach.bigNumberToNumber(parsedAmtB)
    reach.bigNumberToNumber(parsedAmtA)
    const preminted = getPreMintedAmt(parsedAmtA, parsedAmtB)
    const poolBalance = reach.bigNumberify(2).pow(64).sub(1)
    // check if verify sqr root will not overflow in the contract
    verifySqrtView(preminted, parsedAmtA, parsedAmtB, poolBalance)
  }

  const messages = {
    default: LABELS.CREATE.POOL,
    duplicatePool: t`Pool already exists`,
    imbalancedPool: t`Cannot create a partially empty pool`,
    insufficientFunds: t`Not enough funds`,
    tokensMatch: t`Cannot create a pool with matching tokens`,
    minBalance: t`Must maintain a minimum balance of`,
  }
  const [message, setMessage] = useState<string>(messages.default)
  const titleText = messages.default

  useEffect(() => {
    checkIfValidPool(selectedTokenA?.id, selectedTokenB?.id)
  }, [selectedTokenA, selectedTokenB, fmtAmtA, fmtAmtB])

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

  const checkIfValidPool = (tokAId: string, tokBId: string) => {
    const pool =
      tokAId && tokBId ? getPoolForTokens(tokAId, tokBId, pools) : null
    if (pool === null) {
      setMessage(messages.default)
      return
    }

    switch (true) {
      case (fmtAmtA > 0 && fmtAmtB === 0) || (fmtAmtB > 0 && fmtAmtA === 0): {
        setMessage(messages.imbalancedPool)
        break
      }
      case doesNotHaveFunds(): {
        setMessage(messages.insufficientFunds)
        break
      }
      case selectedTokenA ? belowMinBalance(selectedTokenA, fmtAmtA) : false: {
        setMessage(messages.minBalance)
        break
      }
      case parseAddress(selectedTokenB?.id || -1) ===
        parseAddress(selectedTokenA?.id || -2): {
        setMessage(messages.tokensMatch)
        break
      }
      default: {
        // go to pool's add liquidity page if pool exists
        navigate(paths.pool.add(pool?.poolAddr))
      }
    }
  }

  const createPair = async () => {
    const ready = selectedTokenA !== undefined && selectedTokenB !== undefined
    if (!ready) return

    sendGoogleTagEvent('LIQUIDITY-Begin_Create_Pool', reachAccount, search)
    const res = await createPool(
      reachAccount,
      [selectedTokenA, selectedTokenB],
      [fmtAmtA, fmtAmtB],
      setNewPoolLiquidityAmount,
    )
    const event = res?.succeeded ? 'Complete_Create_Pool' : 'ERROR_Create_Pool'
    sendGoogleTagEvent(`LIQUIDITY-${event}`, reachAccount, search)
  }

  const setAmount = (amt: string, tokenA: boolean) => {
    const fmtAmt = amt === '.' ? '0.' : amt
    try {
      checkForOverflow(fmtAmt, tokenA) // throws error on overflow
      if (tokenA) setSelectedTokenAAmt(fmtAmt)
      else setSelectedTokenBAmt(fmtAmt)
    } catch (err) {
      // @TODO | handle overflow error
      // tell user to use smaller amount (launch toast or show inline message)
    }
  }

  const selectToken = (tok: Token, tokA: boolean) => {
    if (tokA) {
      setSelectedTokenA(tok)
    } else {
      setSelectedTokenB(tok)
    }
  }

  const liquidityIsTooLow =
    Boolean(fmtAmtA && fmtAmtB) &&
    fmtAmtA < MIN_TOKEN_BALANCE &&
    fmtAmtB < MIN_TOKEN_BALANCE

  const createPoolDisabled = () =>
    creatingPool ||
    selectedTokenB === undefined ||
    selectedTokenA === undefined ||
    (fmtAmtA > 0 && fmtAmtB === 0) ||
    (fmtAmtB > 0 && fmtAmtA === 0) ||
    doesNotHaveFunds() ||
    (selectedTokenA ? belowMinBalance(selectedTokenA, fmtAmtA) : false) ||
    message === messages.duplicatePool ||
    Number(selectedTokenB?.id || -1) === Number(selectedTokenA?.id || -2) ||
    liquidityIsTooLow ||
    !fmtAmtA ||
    !fmtAmtB

  const shouldShowRatio =
    selectedTokenA &&
    selectedTokenB &&
    fmtAmtA > 0 &&
    fmtAmtB > 0 &&
    !liquidityIsTooLow

  const sortedTokenList = sortByBalance(tokenList)
  const tokAList = sortedTokenList.filter(
    ({ id, balance }) => id !== selectedTokenB?.id && (balance || 0) > 0,
  )
  const tokBList = sortedTokenList.filter(
    ({ id, balance }) => id !== selectedTokenA?.id && (balance || 0) > 0,
  )

  const onMaxSelect = (maxInput: number, tokenA: boolean) =>
    setAmount(maxInput.toString(), tokenA)

  const successModalIsOpen = () =>
    newPoolLiquidityAmount !== undefined &&
    !creatingPool &&
    selectedTokenA !== undefined &&
    selectedTokenB !== undefined

  const onCloseSuccessModal = () => {
    setNewPoolLiquidityAmount(undefined)
    navigate(paths.pool.index)
  }

  return (
    <Container>
      <BackToPoolButton />
      <Card title={titleText} padded>
        <SelectWrapper>
          <p>
            <Trans>First Token</Trans>:
          </p>
          <PairCard
            amount={selectedTokenAAmt}
            featured={fmtAmtA > (Number(selectedTokenA?.balance) || 0)}
            onInputChange={(amt: string) => {
              if (!selectedTokenA) return
              setAmount(amt, true)
            }}
            onMaxClick={onMaxSelect}
            onTokSelect={(tok: Token) => selectToken(tok, true)}
            selectedTokId={selectedTokenA?.id.toString()}
            tokenA
            tokenList={tokAList}
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
            onInputChange={(amt: string) => {
              if (!selectedTokenB) return
              setAmount(amt, false)
            }}
            onMaxClick={onMaxSelect}
            onTokSelect={(tok: Token) => selectToken(tok, false)}
            selectedTokId={selectedTokenB?.id?.toString()}
            tokenA={false}
            tokenList={tokBList}
          />
        </SelectWrapper>
        {liquidityIsTooLow && (
          <ErrorNotification boldText>
            <Trans>
              Please provide more than {MIN_TOKEN_BALANCE} tokens for token A or
              token B
            </Trans>
          </ErrorNotification>
        )}
        <RateContainer>
          {shouldShowRatio && (
            <ExchangeRate
              tokA={selectedTokenA}
              tokB={selectedTokenB}
              amtA={fmtAmtA}
              amtB={fmtAmtB}
            />
          )}
        </RateContainer>
        {doesNotHaveFunds() && (
          <WarningBox
            title={`${t`Not enough`} ${getInsufficientTokens()} ${t`tokens to proceed`}`}
          />
        )}
        {selectedTokenA !== undefined && selectedTokenB !== undefined && (
          <MobileWalletConfirmationModal
            open={modal === MODAL.MOBILE_CONFIRM}
            onClose={clearGlobalModal}
            action='creating'
            tokenAAmt={selectedTokenAAmt}
            tokenASymbol={selectedTokenA.symbol}
            tokenBAmt={selectedTokenBAmt}
            tokenBSymbol={selectedTokenB.symbol}
          />
        )}
        {successModalIsOpen() && (
          <SuccessPoolModal
            open={successModalIsOpen()}
            title='You have created a new pool!'
            image='add'
            onClose={onCloseSuccessModal}
            amount={newPoolLiquidityAmount?.toString()}
            tokenA={selectedTokenA as Token}
            tokenB={selectedTokenB as Token}
            tokenAAmount={fmtAmtA}
            tokenBAmount={fmtAmtB}
          />
        )}

        <CreatePoolButton
          onClick={createPair}
          className={createPoolDisabled() ? 'disabled' : undefined}
          disabled={createPoolDisabled()}
          data-testid='create-pool-btn'
        >
          {creatingPool ? <p className='spinner--before' /> : message}{' '}
          {minBalMessageCap(
            message,
            messages.minBalance,
            selectedTokenA?.minBalance,
          )}
        </CreatePoolButton>
        <LiquidityDisclaimer />
      </Card>
    </Container>
  )
}

export default CreatePoolForm
