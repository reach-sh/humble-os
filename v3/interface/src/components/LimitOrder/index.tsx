import { t } from '@lingui/macro'
import { WideButton } from 'components/Common/Button'
import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from 'components/Common/FlexContainer'
import PairCard from 'components/Common/PairCard'
import RotateIconButton from 'components/Common/RotateIconButton'
import { MbH6, SwapTargetsHeading } from 'components/Swap'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { LimitOrderCore, Token } from 'types/shared'
import SwapVert from 'assets/Icons/arrow-up-down.svg'
import { parseAddress } from 'reach/utils'
import {
  DEFAULT_NETWORK,
  NETWORK_TOKEN_DEFAULT_ID,
} from 'constants/reach_constants'
import { COLORS } from 'theme'
import ModalComponent from 'components/Modals/ModalComponent'
import { ConfirmOrder } from 'components/Swap/Confirm'
import GlobalModal, { MODAL } from 'state/reducers/modals'
import { GlobalDex } from 'state/reducers/dex'
import useGlobalDex from 'hooks/useGlobalDex'
import { paths } from 'App.routes'
import WarningIcon from 'components/Common/Icons/warning'
import TokenInput from 'components/Common/PairCard/TokenInput'
import TokenPrice from 'components/Common/PairCard/TokenPrice'
import SIZE from 'constants/screenSizes'
import { colorAndOpacityToHex } from 'utils/styling'
import { findMatchingPairs, getPoolForTokens } from 'helpers/pool'
import { formatPoolForSDK, submitLimitOrder } from 'reach/api/trader'
import { calculateTokenSwap } from '@reach-sh/humble-sdk'
import getDelta from 'helpers/limitOrder'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import useGlobalUser from 'hooks/useGlobalUser'
import LimitOrderSubmitModal from 'components/Modals/LimitOrderSubmitModal'
import { SwapContainer } from 'components/Common/Card'

const LimitOrderButton = styled(WideButton)`
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: 18px;
`
const RateWrapper = styled(FlexColumnContainer)<{ featured?: boolean }>`
  background: ${({ theme }) => theme.colors.lighterBackground};
  border: ${({ featured }) =>
    featured ? `1px solid ${COLORS.orange}` : 'none'};
  border-radius: 16px;
  justify-content: space-between;
  margin-top: 2rem;
  min-height: 95px;
  padding: 10px;
`
const RateLabel = styled.div`
  color: ${COLORS.midGray};
  font-weight: 700;
  font-size: 12px;
  line-height: 14px;
`
const MarketPriceContainer = styled(FlexContainer)`
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
  height: 68px;
  @media screen and (max-width: ${SIZE.sm}) {
    flex-direction: column;
    height: auto;
  }
`
const BoxTemplateCss = css`
  border: 1px solid ${({ theme }) => theme.colors.borderAlt};
  border-radius: 14px;
`
const DistributedContainer = styled(FlexColumnContainer)`
  justify-content: space-between;
  height: 100%;
`
const DescLabel = styled.div`
  color: ${({ theme }) => theme.colors.timerColor};
  font-size: 14px;
  font-weight: 700;
  line-height: 17px;
`
const RateBox = styled(GridContainer)`
  ${BoxTemplateCss}
  padding: 8px 12px;
  grid-template-columns: max-content auto;
  height: 100%;
  flex: 1;
  justify-content: space-between;
  @media screen and (max-width: ${SIZE.sm}) {
    width: 100%;
    height: auto;
    flex: content;
  }
`
const CheckMarketButton = styled.button`
  cursor: pointer;
  background-color: ${COLORS.lightGray};
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 600;
  line-height: 12px;
  width: max-content;
  &:hover {
    background-color: ${COLORS.sage};
  }
`
const NotEnoughContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  max-height: 48px;
  gap: 20px;
`

const NotEnoughNotification = styled.div`
  display: flex;
  padding: 8px 11px 8px 11px;
  border-radius: 16px;
  font-size: 12px;
  align-items: center;
  background-color: ${colorAndOpacityToHex(COLORS.orange, 10)};
  color: ${COLORS.orange};
  flex-basis: 70%;
  flex-grow: 2;
  gap: 10px;
`
const NotEnoughText = styled.span`
  line-height: 16px;
`
const SwapButton = styled(WideButton)`
  flex-basis: 30%;
  height: 40px;
  flex-grow: 1;
  margin: 0;
`
const btnMessageOptions: Record<string, string> = {
  connect: t`Connect wallet`,
  reviewLimitOrder: t`Review Limit Order`,
}
const TokenStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 8px;
`

const LimitOrderForm = () => {
  const {
    tokenAId,
    tokenBId,
    reopenOrder,
    selectedLimitOrderInfo,
    tokenList,
    pools,
  } = useGlobalDex([
    'tokenAId',
    'tokenBId',
    'reopenOrder',
    'selectedLimitOrderInfo',
    'tokenList',
    'pools',
  ])
  const navigate = useNavigate()
  const [tokenAmountA, setTokenAmountA] = useState('')
  const [tokenAmountB, setTokenAmountB] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const { walletAddress, reachAccount } = useGlobalUser([
    'reachAccount',
    'walletAddress',
  ])
  const [tokSellDisabled, setTokSellDisabled] = useState(false)
  const [tokBuyDisabled, setTokBuyDisabled] = useState(false)
  const [rateInputDisabled, setRateInputDisabled] = useState(false)
  const [rate, setRate] = useState('')

  useEffect(() => {
    if (reopenOrder) {
      setTokenAmountA(selectedLimitOrderInfo?.amtA)
      setTokenAmountB(selectedLimitOrderInfo?.amtB)
      GlobalDex.reopenOrder(false)
    }
  }, [reopenOrder, selectedLimitOrderInfo])
  const tokens = [tokenAId, tokenBId].map((tokenId) =>
    tokenList.find(({ id }) => `${id}` === `${tokenId}`),
  )
  const defaultToken = useMemo(
    () =>
      tokenList.find(({ id }) => id?.toString() === NETWORK_TOKEN_DEFAULT_ID),
    [DEFAULT_NETWORK, tokenList],
  )
  const limitOrder = useMemo(
    () => ({
      tokA: tokens[0] || defaultToken,
      tokB: tokens[1],
      amtA: tokenAmountA,
      amtB: tokenAmountB,
      limitOrderRate: rate,
    }),
    [defaultToken, tokens, tokenAmountA, tokenAmountB, rate],
  )
  const tokenListToSell = useMemo(
    () =>
      tokenList.filter(
        ({ id }) => parseAddress(id) !== parseAddress(limitOrder.tokB?.id),
      ),
    [tokenList, limitOrder.tokB?.id],
  )

  // NOTE: tokenList in dependency array because findMatchingPairs ueses it under the hood
  const tokenListToBuy = useMemo(
    () =>
      limitOrder.tokA ? findMatchingPairs(limitOrder.tokA?.id, pools) : [],
    [tokenList, limitOrder.tokA?.id],
  )
  const selectedTokenToSell = useMemo(
    () =>
      limitOrder.tokA?.id
        ? tokenListToSell.find(
            ({ id }) => parseAddress(id) === parseAddress(limitOrder.tokA?.id),
          )
        : undefined,
    [tokenListToSell, limitOrder.tokA?.id],
  )

  const notEnoughTokA = useMemo(
    () =>
      selectedTokenToSell?.balance !== undefined &&
      selectedTokenToSell.balance < Number(limitOrder.amtA),
    [selectedTokenToSell, limitOrder?.amtA],
  )

  const disableLimitOrderButton =
    notEnoughTokA || !tokenBId || !limitOrder?.amtA || !limitOrder?.amtB

  const [btnMessage, setBtnMessage] = useState<string>(
    btnMessageOptions.connect,
  )

  const tokensUndefined = !limitOrder.tokA || !limitOrder.tokB

  useEffect(() => {
    if (walletAddress) {
      setBtnMessage(btnMessageOptions.reviewLimitOrder)
    }
  }, [walletAddress])

  const publishPairs = (s: LimitOrderCore = {}, forceUpdateRate = false) => {
    const { amtA = '', amtB = '' } = s
    setTokenAmountA(amtA)
    setTokenAmountB(amtB)
    if (rateInputDisabled || forceUpdateRate) {
      const nAmtA = Number(amtA)
      const nAmtB = Number(amtB)
      setRate(nAmtB !== 0 ? (nAmtA / nAmtB).toFixed(6) : '')
    }
  }
  // Swap A and B tokens
  const updateLimitOrderTargets = async () => {
    const { tokA, tokB, amtB, amtA } = limitOrder
    const reversedSwap = {
      ...limitOrder,
      amtA: amtB,
      amtB: amtA,
      tokA: tokB,
      tokB: tokA,
    }
    GlobalDex.multiple({ tokenAId: tokB?.id, tokenBId: tokA?.id })
    publishPairs(reversedSwap, true)
  }
  // Update user-entries in swap info
  const updateLimitOrder = async (
    tok = {} as Token,
    amt: string,
    index: number,
  ) => {
    const limitOrderInfo = {
      ...limitOrder,
      ...(index === 0 ? { tokA: tok, amtA: amt } : { tokB: tok, amtB: amt }),
    }
    // Stop tokA's amount from resetting when selecting tokB.
    if (index === 1 && !amt) limitOrderInfo.amtA = limitOrder.amtA
    validateAndPublish(limitOrderInfo)
  }
  // Complete user entry validation and dispatch updates
  const validateAndPublish = async (i: LimitOrderCore) => {
    try {
      if (Object.keys(i.tokA || {}).length === 0) return
      publishPairs({
        amtA: i.amtA,
        amtB: i.amtB,
        tokA: i.tokA,
        tokB: i.tokB,
      })
    } catch (err) {
      // @TODO | handle overflow error
    }
  }

  const handleInputChange = (amt: string, isTokA: boolean) => {
    if (!limitOrder.tokA || !limitOrder.tokB) return
    const isDecimal = amt === '.'
    const fmtAmt = isDecimal ? '0.' : amt
    const tokenToUse = isTokA ? limitOrder.tokA : limitOrder.tokB
    const index = isTokA ? 0 : 1
    updateLimitOrder(tokenToUse, fmtAmt, index)
  }

  const handleLimitOrder = async () => {
    sendGoogleTagEvent('LIMIT-ORDER-Begin_Order', reachAccount)
    setShowConfirmation(false)
    setTokBuyDisabled(true)

    const { succeded } = await submitLimitOrder(reachAccount, limitOrder)

    // TODO: Add new state to cacheReducer
    if (succeded) setShowSuccessModal(true)
  }

  const onCancel = () => {
    setShowConfirmation(false)
    sendGoogleTagEvent('LIMIT-ORDER-Cancel_LimitOrder_Confirm', reachAccount)
  }

  const onLimitOrderBtnClick = () => {
    if (btnMessage === btnMessageOptions.reviewLimitOrder) {
      setShowConfirmation(true)
      sendGoogleTagEvent('LIMIT-ORDER-Launch_LimitOrder_Confirm', reachAccount)
    } else if (btnMessage === btnMessageOptions.connect) {
      GlobalModal.active(MODAL.CONNECT_WALLET)
    }
  }
  const selectToken = async (tok: Token, tokA: boolean) => {
    if (tokA) GlobalDex.tokenAId(tok.id)
    else GlobalDex.tokenBId(tok.id)
  }
  const onFocus = (variant: 'tokSell' | 'tokBuy' | 'rate') => {
    switch (variant) {
      case 'tokSell':
        setTokBuyDisabled(true)
        setRateInputDisabled(true)
        break
      case 'tokBuy':
        setTokSellDisabled(true)
        setRateInputDisabled(true)
        break
      case 'rate':
        setTokSellDisabled(true)
        setTokBuyDisabled(true)
        break
      default:
        onBlur()
        break
    }
  }
  const onBlur = () => {
    setTokBuyDisabled(false)
    setTokSellDisabled(false)
    setRateInputDisabled(false)
  }
  const handleRateChange = (value: string) => {
    const isDecimal = value === '.'
    const fmtAmt = isDecimal ? '0.' : value
    setRate(fmtAmt)
    const rateAmt = Number(fmtAmt)
    const amtA = Number(limitOrder.amtA)
    if (rateAmt !== 0) handleInputChange((amtA / rateAmt).toString(), false)
    else handleInputChange('', false)
  }

  const sdkPool = useMemo(
    () =>
      formatPoolForSDK(
        getPoolForTokens(
          limitOrder.tokA?.id,
          limitOrder.tokB?.id,
          pools,
        ) as any,
      ),
    [limitOrder.tokA?.id, limitOrder.tokB?.id, pools],
  )

  const handleCloseLimitOrderSubmitModal = () => {
    sendGoogleTagEvent('LIMIT-ORDER-Complete_LimitOrder', reachAccount)
    setShowSuccessModal(false)
  }

  const onClickMarketBtn = () => {
    try {
      if (Object.keys(limitOrder.tokA || {}).length === 0 || !sdkPool) return
      // NEW: can import 'poolIsOverloaded' from SDK to check what value will trigger
      // overflow on swapTokenAToB or swapTokenBToA. error handling can be done within the
      // try/catch of those functions
      const calcSwap = calculateTokenSwap({
        swap: {
          tokenAId: limitOrder.tokA?.id,
          tokenBId: limitOrder.tokB?.id,
          amountA: limitOrder.amtA || limitOrder.amtB ? limitOrder.amtA : 1,
          amountB: limitOrder.amtB,
        },
        pool: sdkPool,
      })

      const updates = {
        amtA: calcSwap.amountA,
        amtB: calcSwap.amountB,
        tokA:
          calcSwap.tokenIn === limitOrder.tokA?.id
            ? limitOrder.tokA
            : limitOrder.tokB,
        tokB:
          calcSwap.tokenIn === limitOrder.tokA?.id
            ? limitOrder.tokB
            : limitOrder.tokA,
      }

      publishPairs(updates, true)
    } catch (err) {
      // @TODO | handle overflow error
    }
  }

  return (
    <>
      <SwapContainer className='slide-down-fade-in'>
        {/* Source Token */}
        <MbH6>{t`Sell`}:</MbH6>
        <PairCard
          tokenA
          selectedTokId={limitOrder.tokA?.id.toString()}
          amount={limitOrder.amtA}
          tokenList={tokenListToSell}
          disabled={tokSellDisabled}
          onBlur={onBlur}
          onFocus={() => onFocus('tokSell')}
          onInputChange={(amt: string) => handleInputChange(amt, true)}
          onTokSelect={(tok: Token) => selectToken(tok, true)}
        />
        {notEnoughTokA && limitOrder.tokA && (
          <NotEnoughContainer>
            <NotEnoughNotification>
              <WarningIcon />
              <NotEnoughText>
                {t`Not enough ${limitOrder.tokA.symbol} tokens to create a Limit
                Order. To proceed, go to`}
                <b> &quot;{t`SWAP`}&quot;</b>
              </NotEnoughText>
            </NotEnoughNotification>
            <SwapButton onClick={() => navigate(paths.swap.index)}>
              {t`SWAP`}
            </SwapButton>
          </NotEnoughContainer>
        )}
        {/* Conversion Target Token */}
        <SwapTargetsHeading>
          <h6>{t`Buy`}:</h6>
          <div>
            <RotateIconButton
              disabled={tokensUndefined}
              customIcon={SwapVert}
              onClick={updateLimitOrderTargets}
              filter='dark-sage-svg-filter'
            />
          </div>
        </SwapTargetsHeading>

        <PairCard
          selectedTokId={limitOrder.tokB?.id?.toString()}
          amount={limitOrder.amtB}
          tokenList={tokenListToBuy}
          disabled={tokBuyDisabled}
          onBlur={onBlur}
          onFocus={() => onFocus('tokBuy')}
          onInputChange={(amt: string) => handleInputChange(amt, false)}
          onTokSelect={(tok: Token) => selectToken(tok, false)}
        />

        <RateWrapper>
          <RateLabel>Place a limit order to trade at a set rate</RateLabel>
          <MarketPriceContainer>
            <RateBox>
              <DistributedContainer>
                <DescLabel>{t`Rate`}</DescLabel>
                <CheckMarketButton
                  onClick={onClickMarketBtn}
                  disabled={tokensUndefined}
                >{t`= MARKET`}</CheckMarketButton>
              </DistributedContainer>
              <TokenStats>
                <TokenInput
                  tokenSymbol={limitOrder.tokB?.symbol}
                  inputAmt={limitOrder.limitOrderRate}
                  variant='rate'
                  placeholder='0.00'
                  dataTestId='amount-rate'
                  onAmountInput={handleRateChange}
                  onBlur={onBlur}
                  onFocus={() => onFocus('rate')}
                  isDisabled={rateInputDisabled}
                />
                {limitOrder.tokB && (
                  <TokenPrice
                    tokenId={limitOrder.tokB.id}
                    tokenAmt={limitOrder.limitOrderRate}
                  />
                )}
              </TokenStats>
            </RateBox>
          </MarketPriceContainer>
        </RateWrapper>

        <LimitOrderButton
          data-testid='do-limit-order-btn'
          onClick={onLimitOrderBtnClick}
          disabled={disableLimitOrderButton}
        >
          {btnMessage}
        </LimitOrderButton>
      </SwapContainer>
      <ModalComponent
        open={showConfirmation}
        width={420}
        modalTitle={t`Confirm Limit Order`}
        confirmationText={t`Confirm`}
        onClose={onCancel}
        onConfirm={handleLimitOrder}
      >
        <ConfirmOrder
          order={{
            amtA: tokenAmountA,
            amtB: tokenAmountB,
            tokA: limitOrder.tokA,
            tokB: limitOrder.tokB,
            delta: getDelta(
              rate,
              limitOrder.tokA?.id,
              limitOrder.tokB?.id,
              sdkPool,
            )?.toString(),
          }}
        />
      </ModalComponent>
      {limitOrder.tokB && (
        <LimitOrderSubmitModal
          open={showSuccessModal}
          onClose={handleCloseLimitOrderSubmitModal}
          token={limitOrder.tokB}
          amt={limitOrder.amtB || '0'}
        />
      )}
    </>
  )
}

export default LimitOrderForm
