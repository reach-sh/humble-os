import { useLocation } from 'react-router-dom'
import { t, Trans } from '@lingui/macro'
import { Maybe } from '@reach-sh/humble-sdk'
import styled from 'styled-components'
import { useEffect, useMemo, useState } from 'react'
import { Pool } from 'types/shared'
import useGlobalDex from 'hooks/useGlobalDex'
import useGlobalUser from 'hooks/useGlobalUser'
import {
  getOwnershipOfPool,
  getTokenById,
  isTokenOptedIn,
  optInToById,
} from 'helpers/pool'
import { WideButton } from 'components/Common/Button'
import Card from 'components/Common/Card'
import CryptoIcon from 'components/Common/CryptoIcon'
import ErrorNotification from 'components/Common/ErrorNotification'
import { loadFormattedPool } from 'reach/utils'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { useReach } from 'helpers/getReach'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import Countdown from 'components/Common/Countdown'
import { asMaybe } from 'utils/reach'
import AmountSelector from './AmountSelector'

const RemoveContainer = styled(Card)``

const Content = styled.div`
  margin-top: 2.5rem;
`
const Label = styled.p`
  margin-bottom: 0.5rem;
`
const ShareWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1.5rem 0 1rem 0;
`
const ShareText = styled.p`
  color: ${COLORS.darkSage};
`
const Summary = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
  padding: 0 0.5rem;

  @media (max-width: ${SIZE.xs}) {
    grid-template-columns: auto;

    > * {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }
  }
`
const TokenWrapper = styled.div<{ tokB?: boolean }>`
  display: flex;
  padding: 0.5rem 0;
`
const TokSymbol = styled.p`
  font-weight: bold;
  margin-left: 5px;
`
const TokAmount = styled.p`
  font-weight: bold;
  margin-left: 1rem;
  @media (max-width: ${SIZE.lg}) {
    margin-left: 0.5rem;
  }
`
const Asterisk = styled.span`
  color: ${({ theme }) => theme.colors.error};
`
const SubmitButton = styled(WideButton)`
  font-weight: 700;
  font-size: 1.25rem;
  margin-top: 1.5rem;
  width: 100%;
`
const Disclaimer = styled.p`
  font-size: 11px;
  margin-top: 3px;
`
const ProgressWrapper = styled.div`
  position: absolute;
  top: 23px;
  right: 21px;
  width: auto;

  @media (max-width: ${SIZE.sm}) {
    top: 7px;
  }
`

const calcAmount = (
  isTokA: boolean,
  withdrawPercentage: string,
  currentPool: Pool,
) => {
  if (!currentPool) return '0'
  const tokBalance = isTokA ? currentPool.tokABalance : currentPool.tokBBalance

  const { liquidityAmount, mintedLiquidityTokens } = currentPool
  return (
    (Number(withdrawPercentage) / 100) *
    Math.min((liquidityAmount * tokBalance) / mintedLiquidityTokens, tokBalance)
  ).toFixed(6)
}

export type RemoveLqData = {
  tokenAAmount: string
  tokenBAmount: string
  withdrawalAmount: number
  withdrawPercentage: string
}

type Props = {
  /** Pool data */
  pool: Pool
  /** Update pool on an interval */
  disableUpdate?: boolean
  /** UI: show/hide padding on card container */
  noPadding?: boolean
  /** UI: Form Title */
  formTitle?: string
  /** Handler for submitting form */
  onSubmit(d: RemoveLqData): any
}

const BTN_TXT = {
  OPTIN: t`Opt in to %%`,
  DEFAULT: t`Remove Liquidity`,
}

const defaultBtnTxt = t`Checking token opt-in...`

const RemoveLiquidityForm = ({
  pool,
  onSubmit: onWithdrawLiquidity,
  disableUpdate = false,
  formTitle = t`Remove liquidity`,
  noPadding = false,
}: Props) => {
  const reach = useReach()
  const { search } = useLocation()
  const { reachAccount } = useGlobalUser()
  const { withdrawingLiquidity } = useGlobalDex(['withdrawingLiquidity'])
  const [error, setError] = useState('')
  const [submitPrompt, setSubmitPrompt] = useState(defaultBtnTxt)
  const [withdrawPercentage, setWithdrawalPercentage] = useState('50')

  const updatePool = async (id?: string) => {
    const poolAddress = id || pool.poolAddr.toString()
    if (!poolAddress) return
    const tokenA = asMaybe(pool.tokAId) as Maybe<string>
    await loadFormattedPool(reachAccount, poolAddress, tokenA)
  }

  const setButtonText = async (currentPoolObj: Pool) => {
    if (!tokA || !tokB) return t`Loading tokens ...`
    const checkTokA = await isTokenOptedIn(currentPoolObj.tokAId)
    const optin = BTN_TXT.OPTIN
    if (!checkTokA) return setSubmitPrompt(optin.replace('%%', tokA.symbol))

    const checkTokB = await isTokenOptedIn(currentPoolObj.tokBId)
    if (!checkTokB) return setSubmitPrompt(optin.replace('%%', tokB.symbol))

    return setSubmitPrompt(BTN_TXT.DEFAULT)
  }

  const makeWithdrawData = async () => {
    if (error) setError('')
    if (!pool) return null
    const tokenBalance = await reach.balanceOf(
      reachAccount,
      Number(pool.poolTokenId),
    )
    const divisor = 100 / Number(withdrawPercentage)
    const tokenBalanceNum = reach.bigNumberToNumber(tokenBalance)
    const withdrawalAmountNum = tokenBalanceNum / divisor

    return {
      tokenAAmount,
      tokenBAmount,
      withdrawalAmount: Math.floor(withdrawalAmountNum),
      withdrawPercentage,
    }
  }

  const [tokA, tokB, tokenAAmount, tokenBAmount, removalPct] = useMemo(() => {
    let pct = ''
    if (pool) {
      const { liquidityAmount, mintedLiquidityTokens } = pool || {}
      const currentOwnership = getOwnershipOfPool(
        liquidityAmount,
        mintedLiquidityTokens,
      )
      pct = (
        (Number(withdrawPercentage) / 100) *
        Number(currentOwnership)
      ).toFixed(2)
    }

    return [
      getTokenById(pool.tokAId ?? ''),
      getTokenById(pool.tokBId ?? ''),
      calcAmount(true, withdrawPercentage, pool),
      calcAmount(false, withdrawPercentage, pool),
      pct,
    ]
  }, [pool, withdrawPercentage])

  const zeroLiquidityRemove: boolean = useMemo(
    () =>
      Number(withdrawPercentage) <= 0 ||
      (Number(tokenAAmount) === 0 && Number(tokenBAmount) === 0),
    [tokenAAmount, tokenBAmount],
  )

  const trim = (s: string | number) =>
    s.toString().replace(/0*$/, '').replace(/\.$/, '')

  const isDisabled =
    submitPrompt === defaultBtnTxt ||
    withdrawingLiquidity ||
    zeroLiquidityRemove

  const onRemoveButtonClick = async () => {
    const eventLabel = 'LIQUIDITY-Launch_Remove_Confirm'
    const d = await makeWithdrawData()

    switch (true) {
      case tokA && submitPrompt.includes(tokA.symbol):
        await optInToById(pool.tokAId)
        setButtonText(pool)
        return

      case tokB && submitPrompt.includes(tokB.symbol):
        await optInToById(pool.tokBId)
        setButtonText(pool)
        return

      default:
        if (!d) return
        sendGoogleTagEvent(eventLabel, reachAccount, search)
        onWithdrawLiquidity(d)
        break
    }
  }

  useEffect(() => {
    if (pool) setButtonText(pool)
  }, [pool])

  if (!pool) return null

  return (
    <>
      <RemoveContainer title={formTitle} padded={!noPadding}>
        {!disableUpdate && (
          <ProgressWrapper>
            <Countdown
              duration={5}
              onCountDownZero={updatePool}
              tooltip={t`Info refreshing in 5 seconds. Click this button to refresh immediately.`}
            />
          </ProgressWrapper>
        )}

        <Content>
          <Label>
            <Trans>Remove amount:</Trans>
          </Label>
          <AmountSelector
            setWithdrawalPercentage={setWithdrawalPercentage}
            withdrawPercentage={withdrawPercentage}
            withdrawing={withdrawingLiquidity}
          />
          <ShareWrapper>
            <ShareText>Share of pool that will be removed</ShareText>
            <ShareText>{removalPct}%</ShareText>
          </ShareWrapper>

          <Label>
            <Trans>You will receive:</Trans>
          </Label>

          {tokA && tokB && (
            <Summary>
              {[tokA, tokB].map((token, index) => (
                <TokenWrapper tokB={index === 1} key={token.symbol}>
                  <CryptoIcon symbol={token.symbol} id={token.id} />
                  <TokSymbol>{token.symbol}</TokSymbol>
                  <TokAmount>
                    {trim(index === 0 ? tokenAAmount : tokenBAmount)}
                    <Asterisk>*</Asterisk>
                  </TokAmount>
                </TokenWrapper>
              ))}
            </Summary>
          )}

          <Disclaimer>
            <Asterisk>*</Asterisk>
            {t`Output is estimated.`}
          </Disclaimer>

          {error && <ErrorNotification>{error}</ErrorNotification>}

          <SubmitButton
            data-testid='remove-liq-button'
            onClick={onRemoveButtonClick}
            disabled={isDisabled}
          >
            {submitPrompt}
          </SubmitButton>
        </Content>
      </RemoveContainer>
    </>
  )
}

export default RemoveLiquidityForm
