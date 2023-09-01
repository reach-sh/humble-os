import { forwardRef, useEffect, useState } from 'react'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { getValueWithMaxDecimals, truncateText } from 'utils/input'
import { Token } from 'types/shared'
import useGlobalDex from 'hooks/useGlobalDex'
import { COLORS } from 'theme'
import SIZE from 'constants/screenSizes'
import { defaultDecimals } from 'helpers/getReach'
import { parseAddress } from 'reach/utils'
import { MODAL, GlobalModal } from 'state/reducers/modals'
import { GlobalUser } from 'state/reducers/user'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import { useTheme } from 'contexts/theme'
import { cacheUsersAssets } from 'cache'
import WalletIcon from 'assets/Icons/wallet.svg'
import WalletDarkIcon from 'assets/Icons/wallet-dark.svg'
import TokenSelector from './TokenSelector'
import Button, { GreyButton, TokSelector } from '../Button'
import TokenPrice from './TokenPrice'
import FlexContainer from '../FlexContainer'
import TokenInput from './TokenInput'

const Wrapper = styled.div<{ featured?: boolean }>`
  background: ${({ theme }) => theme.colors.lighterBackground};
  border: ${({ featured }) =>
    featured ? `1px solid ${COLORS.orange}` : 'none'};
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  padding: 10px 10px 0 10px;
  border-radius: 16px;
  min-height: 95px;
`

const TokenNames = styled.div`
  width: 40%;
  @media (max-width: ${SIZE.sm}) {
    width: 50%;
  }
`
const InitialSelector = styled(Button)`
  height: initial;
  background: black;
  color: white;
  font-size: 16px;
  padding: 2px 4px 2px 16px;
  border-radius: 8px;
  min-width: 115px;
  > .material-icons {
    font-size: 24px;
  }
  @media (max-width: ${SIZE.md}) {
    font-size: 13px;
    padding: 4px 2px 4px 7px;
    > .material-icons {
      font-size: 20px;
    }
  }
`
const YourBalance = styled.div`
  display: flex;
  padding-top: 2px;
  font-size: 12px;
  line-height: 14px;
`

const BalanceIcon = styled.img`
  padding-right: 4px;
`

const TokenStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 60%;

  @media (max-width: ${SIZE.sm}) {
    width: 50%;
  }
`

const MaxButton = styled(GreyButton)`
  max-width: 200px;
  padding: 4px 8px 4px 8px;
`

const FlexJustify = styled(FlexContainer)<{
  align?: string
  separator?: boolean
}>`
  align-items: ${({ align = 'center' }) => align};
  place-content: space-between;
  border-top: ${({ separator, theme }) =>
    separator ? `1px solid ${theme.colors.inputSeparator}` : ''};
  padding-bottom: 10px;
  padding-top: ${({ separator }) => (separator ? '8' : '0')}px;
  margin-left: ${({ separator }) => (separator ? '20' : '0')}px;
`

type PairCardProps = {
  tokenA?: boolean
  maxEnabled?: boolean
  amount?: number | string
  selectedTokId?: string
  disabled?: boolean
  tokenList: Token[]
  tokenLocked?: boolean
  onTokSelect?: (tok: Token) => void
  onInputChange?: (v: string) => void
  onBlur?: () => void
  onFocus?: () => void
  onMaxClick?: (max: number, tokenA: boolean) => void
  maxDisabled?: boolean
  featured?: boolean
}

const PairCard = forwardRef(
  (
    {
      tokenA = false,
      maxEnabled = false,
      amount = '',
      disabled = false,
      onInputChange,
      onBlur,
      onFocus,
      onTokSelect,
      selectedTokId = '',
      tokenList,
      tokenLocked,
      onMaxClick,
      maxDisabled,
      featured,
    }: PairCardProps,
    ref,
  ) => {
    const [max, setMax] = useState(0)
    const [inputAmt, setInputAmt] = useState<string>('')
    const {
      addingLiquidity,
      creatingPool,
      tokenList: stateTokens,
      withdrawingLiquidity,
    } = useGlobalDex([
      'addingLiquidity',
      'creatingPool',
      'tokenList',
      'withdrawingLiquidity',
    ])
    const [isSelecting, setSelecting] = useState(false)
    const isDisabled =
      withdrawingLiquidity || addingLiquidity || creatingPool || disabled

    const { theme } = useTheme()
    const isDarkMode = theme === 'Dark'

    // Because tokenList is being filtered,
    // we need to get the unfiltered list in state
    // to find the correct token.
    const selectedToken = stateTokens.find(
      ({ id }) => parseAddress(id) === parseAddress(selectedTokId),
    )

    const onAmountInput = (value: string) => {
      const decs = defaultDecimals(selectedToken?.decimals)
      const cappedValue = getValueWithMaxDecimals(value, decs)
      if (onInputChange) onInputChange(cappedValue)
      else setAmount(cappedValue)
    }

    // Cap value to max decimal places on "amount" entry
    const setAmount = (amt: string) => {
      const decs = defaultDecimals(selectedToken?.decimals)
      const newVal = getValueWithMaxDecimals(amt, decs)
      if (newVal !== inputAmt) setInputAmt(newVal)
    }

    // Update token selection and token amount input
    const selectToken = (t: Token) => {
      getMax(t)
      if (onTokSelect) onTokSelect(t)
    }

    const getMax = (t: Token | undefined) => {
      if (t === undefined) {
        setMax(0)
        return
      }

      let newMax = Number(t.balance)
      if (t.id === NETWORK_TOKEN_DEFAULT_ID) {
        const minBalance = t?.minBalance === undefined ? 0 : t?.minBalance
        newMax -= minBalance
      }
      setMax(newMax < 0 ? 0 : newMax)
    }

    const handleMaxClick = () => {
      if (onMaxClick) onMaxClick(max, tokenA)
      setAmount(`${max}`)
    }

    const toggleSelecting = () => {
      const { reachAccount } = GlobalUser.getState()
      if (!reachAccount) GlobalModal.active(MODAL.CONNECT_WALLET)
      else if (!selectedToken || !tokenLocked) {
        if (isSelecting === false) cacheUsersAssets(reachAccount)
        setSelecting(!isSelecting)
      }
    }

    useEffect(() => {
      setAmount(amount.toString())
      // change "max" value ONLY for token A selector
      getMax(selectedToken)
    }, [selectedToken, amount])

    const side = tokenA ? 'A' : 'B'
    const darkOrLightIcon = isDarkMode ? WalletDarkIcon : WalletIcon

    return (
      <>
        <Wrapper featured={featured}>
          <FlexJustify align='start' data-testid={`token-info-${side}`}>
            <TokenNames>
              {!selectedToken ? (
                <InitialSelector
                  rightIcon='expand_more'
                  onClick={toggleSelecting}
                  data-testid={`select-${side}`}
                >
                  Select a Token
                </InitialSelector>
              ) : (
                <>
                  <TokSelector
                    cryptoIcon={selectedToken.symbol}
                    locked={tokenLocked}
                    onClick={toggleSelecting}
                    tokenName={truncateText(selectedToken.name)}
                    testLabel={`select-${side}`}
                    tokenStatus={selectedToken.verificationTier}
                    id={selectedToken.id}
                  >
                    {selectedToken.symbol}
                  </TokSelector>
                </>
              )}
            </TokenNames>

            <TokenStats>
              <TokenInput
                variant='pairCard'
                ref={ref}
                amount={amount}
                inputAmt={inputAmt}
                placeholder='0.00'
                dataTestId={`amount-${side}`}
                onAmountInput={onAmountInput}
                onBlur={onBlur}
                onFocus={onFocus}
                isDisabled={isDisabled}
              />

              {tokenA && selectedToken && (
                <TokenPrice tokenId={selectedToken.id} tokenAmt={inputAmt} />
              )}
            </TokenStats>
          </FlexJustify>

          {selectedToken && (
            <FlexJustify separator>
              <YourBalance>
                <BalanceIcon src={darkOrLightIcon} alt='wallet icon' />
                <span>
                  <Trans>Your balance</Trans>:{' '}
                  {selectedToken.balance?.toString()} {selectedToken.symbol}
                </span>
              </YourBalance>

              {(tokenA || maxEnabled) && (
                <MaxButton
                  disabled={!selectedToken || maxDisabled}
                  onClick={handleMaxClick}
                >
                  <Trans>Max</Trans>
                </MaxButton>
              )}
            </FlexJustify>
          )}
        </Wrapper>

        <TokenSelector
          selected={selectedToken}
          onTokenSelected={selectToken}
          isSelecting={isSelecting}
          setSelecting={setSelecting}
          tokenList={tokenList}
        />
      </>
    )
  },
)

export default PairCard
