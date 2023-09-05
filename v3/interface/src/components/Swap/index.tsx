import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { paths } from 'App.routes'
import { t } from '@lingui/macro'
import { calculateTokenSwap, createReachAPI } from '@reach-sh/humble-sdk'
import styled from 'styled-components'
import { SwapInfo, Token } from 'types/shared'
import { tokenMetadata } from 'cache/shared'
import {
  DEFAULT_NETWORK,
  NETWORK_TOKEN_DEFAULT_ID,
} from 'constants/reach_constants'
import { WideButton } from 'components/Common/Button'
import { GridContainer } from 'components/Common/FlexContainer'
import PairCard from 'components/Common/PairCard'
import { GlobalDex } from 'state/reducers/dex'
import {
  calculatePriceImpact,
  convertSwapTokens,
  loadFormattedPool,
  minimumReceived,
  parseCurrency,
} from 'reach/utils'
import ModalComponent from 'components/Modals/ModalComponent'
import SuccessSwapModal from 'components/Modals/SuccessSwapModal'
import {
  getPoolForTokens,
  hasEnoughLiquidity,
  findMatchingPairs,
  belowMinBalance,
  minBalMessageCap,
  sortByBigNumberBalance,
  getTokenIdsForPool,
  getTokenById,
  isTokenOptedIn,
  optInToById,
} from 'helpers/pool'
import GlobalModal, { clearGlobalModal, MODAL } from 'state/reducers/modals'
import performSwap, { formatPoolForSDK } from 'reach/api/trader'
import RotateIconButton from 'components/Common/RotateIconButton'
import Countdown from 'components/Common/Countdown'
import { COLORS } from 'theme'
import SIZE from 'constants/screenSizes'
import SwapVert from 'assets/Icons/arrow-up-down.svg'
import MobileWalletConfirmationModal from 'components/Modals/MobileWalletConfirmationModal'
import PoolHistoryChart from 'components/Charts/PoolHistoryChart'
import { SwapContainer } from 'components/Common/Card'
import { asMaybe } from 'utils/reach'
import { getValueWithMaxDecimals } from 'utils/input'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import LineUpChart from 'components/Common/Icons/line-up-chart'
import IconButtonWrapper from 'components/Common/IconButtonWrapper'
import { useIsMobile } from 'hooks/useScreenSize'
import useGlobalUser from 'hooks/useGlobalUser'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalModal from 'hooks/useGlobalModal'
import SwapSummary from './Summary'
import Confirm from './Confirm'

export const MbH6 = styled.h6`
  margin-bottom: 1rem;
`

export const SwapTargetsHeading = styled(GridContainer)`
  align-items: baseline;
  grid-template-columns: 50% auto;
  place-content: start;

  .MuiButtonBase-root {
    border: 1px solid ${COLORS.sage};
    border-radius: 4px;
    padding: 0.4rem;
    margin: 0.4rem 0 0.4rem -0.8rem;

    > * {
      color: ${COLORS.sage};
    }
  }
`

const SwapButton = styled(WideButton)`
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: 18px;
`

const ProgressWrapper = styled.div`
  display: flex;
  gap: 8px;
  position: absolute;
  top: 23px;
  right: 21px;
  width: auto;

  @media (max-width: ${SIZE.sm}) {
    top: 7px;
  }
`

export default function SwapTokens() {
  const btnMessageOptions: Record<string, string> = {
    selection: t`Select a token above`,
    enterAmt: t`Enter an amount above`,
    loading: t`Loading...`,
    insufficient: t`Not enough %% for this swap`,
    liquidity: t`Not enough %% liquidity for this swap`,
    connect: t`Connect wallet`,
    swap: t`Swap Tokens`,
    minBalance: t`Must maintain a minimum balance of`,
    aboveMaxInput: t`Slippage is at (or over) 100%`,
    noMinReceived: t`The minimum received is zero`,
    optInTo: t`Opt in to`,
  }

  const { modal } = useGlobalModal()
  const { reachAccount } = useGlobalUser()
  const [tokenBOptedIn, setTokenBOptedIn] = useState(false)
  const [tokenAmountA, setTokenAmountA] = useState('')
  const [tokenAmountB, setTokenAmountB] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [amtReceived, setAmtReceived] = useState('0')
  const [btnMessage, setBtnMessage] = useState<string>(
    btnMessageOptions.connect,
  )
  const isMobile = useIsMobile()
  // This is a flag to know what's the fixed value when switching tokens (true -> tokA)
  const [fixedTokenIsA, setFixedTokenIsA] = useState(true)
  const [swapSuccess, setSwapSuccess] = useState(false)
  const { tokenAId, tokenBId, tokenList, pools } = useGlobalDex([
    'tokenAId',
    'tokenBId',
    'tokenList',
    'pools',
  ])
  const navigate = useNavigate()
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)
  const poolId = searchParams.get('poolId')
  const assetIn = searchParams.get('asset_in')
  const assetOut = searchParams.get('asset_out')

  const tokens = [tokenAId, tokenBId].map((tokenId) =>
    tokenList.find(({ id }) => `${id}` === `${tokenId}`),
  )

  const tokenAFocusRef = useRef<HTMLInputElement>(null)

  const defaultToken = useMemo(
    () =>
      tokenList.find(({ id }) => id?.toString() === NETWORK_TOKEN_DEFAULT_ID),
    [DEFAULT_NETWORK, tokenList],
  )

  const swap: SwapInfo = useMemo(
    () => ({
      tokA: tokens[0] || defaultToken,
      tokB: tokens[1],
      amtA: tokenAmountA,
      amtB: tokenAmountB,
    }),
    [defaultToken, tokens, tokenAmountA, tokenAmountB],
  )

  const noToken = { id: '' } as Token

  useEffect(() => {
    if (!!swap.tokA && !!swap.tokB) {
      tokenAFocusRef?.current?.focus()
    }
  }, [swap.tokA?.id, swap.tokB?.id])

  const publishPairs = (s: SwapInfo = {}) => {
    const { amtA = '', amtB = '', tokA = noToken, tokB = noToken } = s
    GlobalDex.multiple({ tokenAId: tokA?.id ?? '', tokenBId: tokB?.id ?? '' })
    setTokenAmountA(amtA)
    setTokenAmountB(amtB)
  }

  // Handle URL
  useEffect(() => {
    if (poolId) {
      const { tokAId, tokBId } = getTokenIdsForPool(poolId, pools)
      if (tokAId && tokBId) {
        const tokA = getTokenById(tokAId)
        const tokB = getTokenById(tokBId)
        if (tokA && tokB) {
          const showInvertedPoolTokenOrder =
            tokA.id.toString() === assetOut && tokB.id.toString() === assetIn

          if (showInvertedPoolTokenOrder) {
            publishPairs({
              tokA: tokB,
              tokB: tokA,
              amtA: tokenAmountA,
              amtB: tokenAmountB,
            })
          } else {
            publishPairs({
              tokA,
              tokB,
              amtA: tokenAmountA,
              amtB: tokenAmountB,
            })
          }

          // Remove asset ids if these don't match the pool's token ids or if any undefined
          const assets = [assetIn, assetOut]
          if (
            !assetIn ||
            !assetOut ||
            !assets.includes(tokA.id.toString()) ||
            !assets.includes(tokB.id.toString())
          ) {
            navigate(paths.swap.pool(poolId))
          }

          return
        }
      }
    }

    // Case: Only asset ids in url or assets with wrong pool id
    if (assetIn && assetOut) {
      const tokA = getTokenById(assetIn)
      const tokB = getTokenById(assetOut)
      const checkTokBOptIn = async () => {
        setTokenBOptedIn(await isTokenOptedIn(assetOut))
      }
      checkTokBOptIn()
      if (tokA && tokB) {
        const pool = getPoolForTokens(tokA.id, tokB.id, pools)

        if (pool) {
          const { poolAddr } = pool
          const swapInfo = {
            tokA,
            tokB,
            amtA: tokenAmountA,
            amtB: tokenAmountB,
          }
          publishPairs(swapInfo)
          const next = paths.swap.pool(poolAddr)
          navigate(`${next}&asset_in=${assetIn}&asset_out=${assetOut}`)
        }
      }
    }
  }, [poolId, assetIn, assetOut, pools.length, tokenList.length])

  const tradeWrapup = (data: SwapInfo) => {
    const currentSwap = {
      tokA: data.tokA,
      amtA: data.amtA || '',
      tokB: data.tokB,
      amtB: data.amtB || '',
    }
    validateAndPublish(currentSwap, 0)
    setAmtReceived(data.amtB)
    setSwapping(false)
  }

  useEffect(
    () =>
      function cleanup() {
        publishPairs()
      },
    [],
  )

  useEffect(() => {
    const msg = swapping ? btnMessageOptions.loading : validateSwapForm(swap)
    setBtnMessage(msg)
  }, [reachAccount, swap, swapping])

  const tokenAList: Token[] = useMemo(() => {
    const userTokens: Token[] = []
    const customTokens: Token[] = []
    const { tokA, tokB } = swap
    tokenList.forEach((tok) => {
      const { balance = 0, custom } = tok
      if (custom || [tokA?.id, tokB?.id].includes(tok.id)) {
        customTokens.push(tok)
      } else if (balance > 0) userTokens.push(tok)
    })

    return [
      ...sortByBigNumberBalance(userTokens),
      ...sortByBigNumberBalance(customTokens),
    ]
  }, [swap, tokenList])

  const tokenBList: Token[] = useMemo(
    () => (swap.tokA ? findMatchingPairs(swap.tokA.id, pools) : []),
    [swap.tokA, pools],
  )

  // Complete user entry validation and dispatch updates
  const validateAndPublish = async (i: SwapInfo, index: number) => {
    const sdkPool = formatPoolForSDK(
      getPoolForTokens(i.tokA?.id, i.tokB?.id, pools) as any,
    )

    try {
      if (Object.keys(i.tokA || {}).length === 0 || !sdkPool) return
      // NEW: can import 'poolIsOverloaded' from SDK to check what value will trigger
      // overflow on swapTokenAToB or swapTokenBToA. error handling can be done within the
      // try/catch of those functions
      const calcSwap = calculateTokenSwap({
        swap: {
          tokenAId: i.tokA?.id,
          tokenBId: i.tokB?.id,
          amountA: i.amtA,
          amountB: i.amtB,
        },
        pool: sdkPool,
      })

      let updates = {
        amtA: calcSwap.amountA,
        amtB: calcSwap.amountB,
        tokA: calcSwap.tokenIn === i.tokA?.id ? i.tokA : i.tokB,
        tokB: calcSwap.tokenIn === i.tokA?.id ? i.tokB : i.tokA,
      }

      if ((index === 0 && !i.amtA) || (index === 1 && !i.amtB)) {
        updates = { ...updates, amtA: '', amtB: '' }
      }

      publishPairs(updates)
    } catch (err) {
      // @TODO | handle overflow error
    }
  }

  // Update user-entries in swap info
  const updateSwap = async (tok = {} as Token, amt: string, index: number) => {
    const swapInfo = {
      ...swap,
      ...(index === 0
        ? { amtB: '', tokA: tok, amtA: amt } // clear token B amount if A changed
        : { amtA: '', tokB: tok, amtB: amt }), // clear token A amount if B changed
    }
    // Stop tokA's amount from resetting when selecting tokB.
    if (index === 1 && !amt) {
      swapInfo.amtA = swap.amtA
    }
    validateAndPublish(swapInfo, index)
  }

  const selectToken = async (tok: Token, tokA: boolean) => {
    if (tokA) {
      const pool = swap.tokB
        ? getPoolForTokens(swap.tokB.id, tok.id, pools)
        : null
      // update opposing swap amount on tok change
      if (swap.tokB && swap.amtB) {
        const updates = { ...swap, tokA: tok, amtA: '' }
        if (!pool) {
          updates.amtB = ''
          updates.tokB = undefined
        }
        const updatedSwap = convertSwapTokens(updates)

        publishPairs(updatedSwap)
      } else {
        if (!pool) GlobalDex.tokenBId('')
        GlobalDex.tokenAId(tok.id)
      }

      navigate(paths.swap.index)
    } else {
      const checkTokBOptIn = async (tokenB?: Token) => {
        setTokenBOptedIn(await isTokenOptedIn(tokenB?.id))
      }
      checkTokBOptIn(tok)
      const pool = swap.tokA
        ? getPoolForTokens(swap.tokA.id, tok.id, pools)
        : null
      // update opposing swap amount on tok change
      if (swap.tokA && swap.amtA) {
        const updates = { ...swap, tokB: tok, amtB: '' }
        if (!pool) {
          updates.amtA = ''
          updates.tokA = undefined
        }
        const updatedSwap = convertSwapTokens(updates)

        publishPairs(updatedSwap)
      } else {
        if (!pool) GlobalDex.tokenAId('')
        GlobalDex.tokenBId(tok.id)
      }

      // Update URL to user selection
      if (swap.tokA) {
        const p = getPoolForTokens(swap.tokA.id, tok.id, pools)
        if (p) {
          const next = paths.swap.pool(p.poolAddr)
          navigate(`${next}&asset_in=${swap.tokA.id}&asset_out=${tok.id}`)
        }
      }
    }
  }

  const handleInputChange = (amt: string, tokA: boolean) => {
    setFixedTokenIsA(tokA)
    if (!swap.tokA || !swap.tokB) return
    const pool = getPoolForTokens(swap.tokA.id, swap.tokB.id, pools)
    if (!pool) return
    const isDecimal = amt === '.'
    const fmtAmt = isDecimal ? '0.' : amt
    const tokenToUse = tokA ? swap.tokA : swap.tokB
    const index = tokA ? 0 : 1
    updateSwap(tokenToUse, fmtAmt, index)
  }

  // Begin token-swap process
  const beginSwap = async () => {
    sendGoogleTagEvent('SWAP-Begin_Swap', reachAccount, search)
    clearGlobalModal()
    setSwapping(true)
    const { succeded, swapInfo } = await performSwap(reachAccount, swap)
    if (succeded) {
      tradeWrapup(swapInfo)
      await tokenMetadata(swapInfo.tokA?.id, reachAccount)
      await tokenMetadata(swapInfo.tokB?.id, reachAccount)
      setSwapSuccess(true)
    } else {
      tradeWrapup(swapInfo)
    }
  }

  const onCancel = () => {
    sendGoogleTagEvent('SWAP-Cancel_Swap_Confirm', reachAccount, search)
    clearGlobalModal()
  }

  const swapBtnConfirmedText = useMemo(
    () => (tokenBOptedIn ? btnMessageOptions.swap : btnMessageOptions.optInTo),
    [tokenBOptedIn],
  )

  // Validate swap info
  const validateSwapForm = (info: SwapInfo) => {
    const { tokA, tokB, amtB, amtA } = info
    switch (true) {
      case reachAccount === undefined:
        return btnMessageOptions.connect
      case !tokA || !tokB:
        return btnMessageOptions.selection
      case !amtB || !amtA:
        return btnMessageOptions.enterAmt
      // no default
    }

    const fmtAmtB = Number(amtB)
    const fmtAmtA = Number(amtA)
    const hasId = ({ id, address }: Token) => Boolean(id || address)
    if (!(tokA && hasId(tokA)) || !(tokB && hasId(tokB)))
      return swapBtnConfirmedText
    const pool = getPoolForTokens(tokA.id, tokB.id, pools)
    const tokBal = (pt: Token) => {
      if (!pool) return 0
      const isTokA = `${pool.tokAId}` === `${pt.id}`
      return isTokA ? pool.tokABalance : pool.tokBBalance
    }

    const hasEnoughFunds = fmtAmtA <= Number(tokA?.balance)
    const reach = createReachAPI()
    const sufficientLiquidity = reach.lt(
      parseCurrency(tokBal(tokB), tokB.decimals),
      parseCurrency(fmtAmtB, tokB.decimals),
    )
    const minReceived = Number(
      getValueWithMaxDecimals(
        minimumReceived(fmtAmtB).toString(),
        tokB.decimals,
      ),
    )

    switch (true) {
      case (pool && !hasEnoughLiquidity(pool)) || sufficientLiquidity:
        return btnMessageOptions.liquidity.replace('%%', tokB.symbol)
      case !hasEnoughFunds:
        return btnMessageOptions.insufficient.replace('%%', tokA.symbol)
      case belowMinBalance(tokA, fmtAmtA):
        return btnMessageOptions.minBalance
      case Number(calculatePriceImpact(fmtAmtA, tokA, tokB)) >= 100:
        return btnMessageOptions.aboveMaxInput
      case minReceived === 0:
        return btnMessageOptions.noMinReceived
      case fmtAmtB === 0:
        return btnMessageOptions.enterAmt
      default:
        return swapBtnConfirmedText
    }
  }

  // Swap A and B tokens
  const updateSwapTargets = async () => {
    const { tokA, tokB, amtB, amtA } = swap
    const reversedSwap = {
      ...swap,
      amtA: amtB,
      amtB: amtA,
      tokA: tokB,
      tokB: tokA,
    }
    const pool = getPoolForTokens(tokB?.id, tokA?.id, pools)
    if (!pool) return

    setFixedTokenIsA((sp) => !sp)
    publishPairs(reversedSwap)
    const poolAddress = pool.poolAddr.toString()
    const tokenA: any = asMaybe(pool.tokAId)
    await loadFormattedPool(reachAccount, poolAddress, tokenA)
    setRecalculate(true)

    if (!(tokA && tokB)) return
    const assetParams = `asset_in=${tokB.id}&asset_out=${tokA.id}`
    navigate(`${paths.swap.pool(pool.poolAddr)}&${assetParams}`)
  }

  const onSwapBtnClick = async () => {
    const confirm = [
      btnMessageOptions.swap,
      btnMessageOptions.optInTo,
    ].includes(btnMessage)
    if (confirm) {
      if (btnMessage === btnMessageOptions.optInTo) {
        sendGoogleTagEvent('SWAP-Token_opt_in', reachAccount, search)
        await optInToById(swap.tokB?.id)
        const isTokBOptedIn = await isTokenOptedIn(swap.tokB?.id)
        setTokenBOptedIn(isTokBOptedIn)
        setBtnMessage(validateSwapForm(swap))
        return
      }
      sendGoogleTagEvent('SWAP-Launch_Swap_Confirm', reachAccount, search)
      GlobalModal.active(MODAL.CONFIRM_SWAP)
    } else if (btnMessage === btnMessageOptions.connect) {
      sendGoogleTagEvent('CONNECT_WALLET-From_Swap', null, search)
      GlobalModal.active(MODAL.CONNECT_WALLET)
    }
  }

  const onMaxClick = (maxInput: number) =>
    updateSwap(swap.tokA, maxInput.toString(), 0)

  const tokensUndefined = !swap.tokA || !swap.tokB

  const handleCloseSuccessModal = () => {
    sendGoogleTagEvent('SWAP-Complete_Swap', reachAccount, search)
    handleInputChange('0', true)
    setSwapSuccess(false)
  }

  const [recalculate, setRecalculate] = useState(false)
  useEffect(() => {
    if (recalculate) {
      const token = fixedTokenIsA ? swap.tokA : swap.tokB
      const amt = fixedTokenIsA ? swap.amtA : swap.amtB
      const index = fixedTokenIsA ? 0 : 1
      updateSwap(token, amt, index)
      setRecalculate(false)
    }
  }, [recalculate])
  const buttonDisabled = useMemo(
    () =>
      btnMessage !== swapBtnConfirmedText &&
      btnMessage !== btnMessageOptions.connect,
    [btnMessage],
  )

  const updatePool = async () => {
    if (!swap.tokA || !swap.tokB) return
    const pool = getPoolForTokens(swap.tokA.id, swap.tokB.id, pools)
    if (!pool) return

    const poolAddress = pool.poolAddr.toString()
    const tokenA: any = asMaybe(pool.tokAId)
    await loadFormattedPool(reachAccount, poolAddress, tokenA)
    setRecalculate(true)
  }

  const pool = getPoolForTokens(swap.tokA?.id ?? '', swap.tokB?.id ?? '', pools)

  // "Swap Tokens" view
  return (
    <>
      <SwapContainer className='slide-down-fade-in'>
        {swap.amtA && swap.amtB && (swap.amtA !== '0' || swap.amtB !== '0') && (
          <ProgressWrapper>
            <IconButtonWrapper onClick={() => setShowChart(!showChart)}>
              <LineUpChart />
            </IconButtonWrapper>
            <Countdown
              duration={5}
              onCountDownZero={updatePool}
              tooltip={t`Info refreshing in 5 seconds. Info will refresh immediately if you click on this loading icon.`}
            />
          </ProgressWrapper>
        )}
        {/* Source Token */}
        <MbH6>{t`Swap from`}:</MbH6>
        <PairCard
          tokenA
          selectedTokId={swap.tokA?.id.toString()}
          amount={swap.amtA}
          onInputChange={(amt: string) => handleInputChange(amt, true)}
          tokenList={tokenAList}
          disabled={swapping}
          onTokSelect={(tok: Token) => selectToken(tok, true)}
          onMaxClick={onMaxClick}
          maxDisabled={tokensUndefined}
          ref={tokenAFocusRef}
        />
        {/* Conversion Target Token */}
        <SwapTargetsHeading>
          <h6>{t`Swap to`}:</h6>
          <RotateIconButton
            disabled={tokensUndefined}
            customIcon={SwapVert}
            onClick={updateSwapTargets}
            filter='dark-sage-svg-filter'
          />
        </SwapTargetsHeading>

        <PairCard
          selectedTokId={swap.tokB?.id?.toString()}
          amount={swap.amtB}
          onInputChange={(amt: string) => handleInputChange(amt, false)}
          tokenList={tokenBList}
          disabled={swapping || tokensUndefined}
          onTokSelect={(tok: Token) => selectToken(tok, false)}
        />

        <SwapSummary {...swap} />
        <SwapButton
          data-testid='do-swap-btn'
          disabled={buttonDisabled}
          onClick={() => onSwapBtnClick()}
        >
          {btnMessage}{' '}
          {btnMessage === btnMessageOptions.optInTo
            ? swap.tokB?.symbol
            : minBalMessageCap(
                btnMessage,
                btnMessageOptions.minBalance,
                swap.tokA?.minBalance,
              )}
        </SwapButton>
      </SwapContainer>

      {swap.tokA !== undefined && swap.tokB !== undefined && (
        <MobileWalletConfirmationModal
          open={modal === MODAL.MOBILE_CONFIRM}
          onClose={clearGlobalModal}
          action='swapping'
          tokenAAmt={swap.amtA}
          tokenASymbol={swap.tokA.symbol}
          tokenBAmt={swap.amtB}
          tokenBSymbol={swap.tokB.symbol}
        />
      )}

      {swapSuccess && swap.tokA !== undefined && swap.tokB !== undefined && (
        <SuccessSwapModal
          open={swapSuccess}
          tokenB={swap.tokB}
          amtB={amtReceived}
          onClose={handleCloseSuccessModal}
        />
      )}

      {pool && showChart && (
        <ModalComponent
          open={showChart}
          onClose={() => setShowChart(false)}
          width={isMobile ? 390 : 850}
          sticky={false}
        >
          <PoolHistoryChart poolId={String(pool.poolAddr)} />
        </ModalComponent>
      )}

      <ModalComponent
        open={modal === MODAL.CONFIRM_SWAP}
        width={420}
        modalTitle={t`Confirm Swap`}
        confirmationText={t`Confirm`}
        onClose={onCancel}
        onConfirm={beginSwap}
      >
        <Confirm {...swap} />
      </ModalComponent>
    </>
  )
}
