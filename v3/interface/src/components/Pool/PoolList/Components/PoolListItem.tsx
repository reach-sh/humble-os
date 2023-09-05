/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useTheme } from 'contexts/theme'
import { useLocation } from 'react-router-dom'
import { Pool } from 'types/shared'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { getTokenById } from 'helpers/pool'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { paths } from 'App.routes'
import { GlobalUser } from 'state/reducers/user'
import { LinkAsButton } from 'components/Common/Button'
import { IconWrapper } from 'components/Common/Icon'
import { formatCurrencyShort } from 'reach/utils'
import VerifiedBadge from 'components/Common/VerifiedBadge'
import { PoolROICalculator } from 'components/ROICalculator'
import CalculatorIcon from 'assets/Icons/calculator.svg'
import CalculatorDarkIcon from 'assets/Icons/calculator-dark.svg'
import CryptoIconPair from 'components/Common/CryptoIconPair'
import PoolGrid from './PoolGrid'
import PoolTotalValue, { Value } from './PoolTotalValue'

const ListItem = styled(PoolGrid)<{ userPool: boolean }>`
  background-color: ${({ theme, userPool }) =>
    userPool ? theme.colors.lighterBackground : 'transparent'};
  align-items: center;
  padding: 0.5rem 0.5rem;
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.05s;
  min-height: 60px;
  /* mobile grid */
  @media (max-width: ${SIZE.sm}) {
    grid-template-columns: 3.6rem 0.8fr 1.2fr 1.2fr 0.8fr;
    grid-template-rows: 27px 1fr;
  }
`

const StatLabel = styled.p`
  color: ${COLORS.midGray};
  @media (min-width: ${SIZE.sm}) {
    display: none;
  }
`

const Stat = styled.div<{ col: number; colMobile?: number }>`
  grid-row: 1;
  grid-column: ${({ col }) => col};
  justify-self: flex-start;
  margin-top: 0;
  margin: 0;
  text-align: left;
  width: 100%;
  @media (max-width: ${SIZE.sm}) {
    align-self: center;
    display: flex;
    flex-direction: column;
    grid-column: ${({ col, colMobile }) => colMobile || col} / 4;
    grid-row: 2;
    justify-content: space-between;
    justify-self: center;
    margin: 1rem 0;
    text-align: center;
  }
`

const TVLStat = styled(Stat)`
  @media (max-width: ${SIZE.sm}) {
    width: 100%;
    grid-column-start: 1;
    grid-column-end: 3;
    display: inherit;
    justify-content: center;
  }
`

const Symbol = styled.div`
  font-size: 14px;
  grid-column: 2;
  white-space: nowrap;
  font-weight: 700;
  @media (max-width: ${SIZE.sm}) {
    grid-column-start: 2;
    grid-column-end: 4;
    grid-row: 1;
  }

  display: flex;
  gap: 4px;
  align-items: center;
`

const AddWrapper = styled.div<{ col: number; colMobile?: number }>`
  grid-column: ${({ col }) => col};
  text-align: right;
  @media (max-width: ${SIZE.sm}) {
    grid-row: 1;
    grid-column: ${({ col, colMobile }) => colMobile || col};
  }
`

export const AddLiquidityButton = styled(LinkAsButton)`
  width: 62px;
  border-radius: 5px;
  height: 22px;
  font-size: 12px;
  border: none;
  background-color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
  transition: opacity 0.2s;
`

const TokIds = styled.div`
  grid-row: 2;
  display: flex;
  font-size: 10px;
  grid-column: 2/3;
  color: ${COLORS.white};
  @media (max-width: ${SIZE.sm}) {
    display: none;
  }
`

const TokId = styled.p`
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 4px;
  padding: 0 4px;
`

const StyledValue = styled(Value)`
  font-size: 12px;
  border: none;
`

const HStyledValue = styled(StyledValue)`
  display: flex;
  align-items: center;
`

export const CalcIcon = styled.img`
  cursor: pointer;
  height: 17px;
  margin-left: 8px;
`

const PoolListItem = (pool: Pool) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const { search } = useLocation()
  const [showCalculator, setShowCalculator] = useState(false)
  const {
    apr,
    tokAId,
    tokBId,
    poolAddr,
    tokABalance,
    tokBBalance,
    tokenAFees,
    tokenBFees,
    poolTokenId,
    volume,
  } = pool
  const [tokA, tokB, lpTok] = useMemo(
    () => [
      getTokenById(tokAId),
      getTokenById(tokBId),
      getTokenById(poolTokenId),
    ],
    [pool],
  )

  if (!tokA || !tokB) return null

  const userPool = Number(lpTok?.balance || 0) > 0
  const onAddLiqButtonClick = () => {
    const { reachAccount } = GlobalUser.getState()
    sendGoogleTagEvent('LIQUIDITY-Launch_Add_New', reachAccount, search)
  }

  return (
    <ListItem data-testid='list-item' userPool={userPool}>
      <CryptoIconPair
        firstTokId={tokA.id}
        secondTokId={tokB.id}
        firstTokSymbol={tokA.symbol}
        secondTokSymbol={tokB.symbol}
      />
      <Symbol data-testid={`pool-${tokA.name}-${tokB.name}-symbol`}>
        {tokA.symbol}
        <VerifiedBadge verifyStatus={tokA.verificationTier} />
        {' / '}
        {tokB.symbol}
        <VerifiedBadge verifyStatus={tokB.verificationTier} />
      </Symbol>
      <TokIds>
        <TokId>ID:{tokA.id}</TokId>
        <TokId style={{ marginLeft: '10px' }}>ID:{tokB.id}</TokId>
      </TokIds>
      <TVLStat
        col={3}
        colMobile={2}
        data-testid={`pool-${tokA.name}-${tokB.name}-tvl`}
      >
        <StatLabel>TVL</StatLabel>
        <PoolTotalValue
          poolAddr={poolAddr}
          tokenAFees={tokenAFees}
          tokenBFees={tokenBFees}
          tokABalance={tokABalance}
          tokBBalance={tokBBalance}
          tokAId={tokAId}
          tokBId={tokBId}
        />
      </TVLStat>
      <Stat col={4} colMobile={3}>
        <StatLabel>Volume</StatLabel>
        <StyledValue>
          <span>
            {volume || volume === 0 ? `$${formatCurrencyShort(volume)}` : '-'}
          </span>
        </StyledValue>
      </Stat>
      <Stat col={5} colMobile={4}>
        <StatLabel>APR</StatLabel>
        <HStyledValue>
          <span>{apr || apr === 0 ? `${(apr * 100).toFixed(2)}%` : '-'}</span>
          {(apr || apr === 0) && (
            <CalcIcon
              src={isDarkMode ? CalculatorDarkIcon : CalculatorIcon}
              alt='calculator icon'
              onClick={() => setShowCalculator(true)}
            />
          )}
        </HStyledValue>
      </Stat>
      <AddWrapper col={6} colMobile={5}>
        <AddLiquidityButton
          to={paths.pool.add(poolAddr)}
          onClick={onAddLiqButtonClick}
        >
          Add
        </AddLiquidityButton>
      </AddWrapper>
      {showCalculator && (
        <PoolROICalculator
          pool={pool}
          onClose={() => setShowCalculator(false)}
          open={showCalculator}
        />
      )}
    </ListItem>
  )
}

export default PoolListItem
