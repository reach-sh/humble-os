import React, { useState, useRef } from 'react'
import { t } from '@lingui/macro'
import Icon from 'components/Common/Icon'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
import styled from 'styled-components'
import { HUMBLE_SWAP_FAQ, HUMBLE_SWAP_SLIPPAGE } from 'constants/links'
import { COLORS } from 'theme'
import {
  SIZEABLE_SWAP_RISK_LIMIT,
  SLIPPAGE_RISK_LIMIT,
} from 'constants/reach_constants'
import StatRow from './StatRow'
import AllowedSlippage from '../AllowedSlippage'

const WarningCardContainer = styled(FlexColumnContainer)<{ risk?: boolean }>`
  margin-top: 16px;
  &:first-of-type {
    margin-top: 24px;
  }
  border: 1px solid
    ${({ risk, theme }) =>
      risk ? theme.colors.warningBg : theme.colors.warningSageBg};
  border-radius: 8px;
`
const WarningHeader = styled.div<{ risk?: boolean; expanded?: boolean }>`
  background-color: ${({ risk, theme }) =>
    risk ? theme.colors.warningBg : theme.colors.warningSageBg};
  cursor: pointer;
  padding: 16px;
  border-radius: ${({ expanded }) => (expanded ? '8px 8px 0 0' : '8px')};
`
const HeaderTop = styled.div`
  display: flex;
  align-items: center;
`
const HeaderIcon = styled.div<{ risk?: boolean }>`
  font-size: 14px;
  color: ${({ risk, theme }) => (risk ? COLORS.errorRed : theme.colors.text)};
  margin-right: ${({ risk }) => (risk ? '0' : '8px')};
  margin-left: ${({ risk }) => (risk ? '-8px' : '0')};
  line-height: 0;
`
const HeaderTitle = styled.b`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
`
const HeaderBottom = styled.div`
  width: 80%;
  margin-top: 10px;
  font-size: 12px;
  line-height: 14px;
`
const WarningBodyWapper = styled.div`
  overflow: hidden;

  &.expanding {
    height: 100px;
    transition: height 300ms ease-out;
  }
  &.hiding {
    height: 0;
    transition: height 300ms ease-out;
  }
`
const WarningBody = styled.div`
  background-color: transparent;
  padding: 0 16px 28px;
  border-radius: 8px;
  opacity: 1;
  transition: all 1s ease-in;
`

const WarningDetails = {
  none: {
    levelId: 0,
    warningMsg: 'Very low risk',
    warningDesc: '',
  },
  sizeableSwap: {
    levelId: 1,
    warningMsg: 'High Risk: Sizeable Swap',
    warningDesc: `The swap you are about to make has a substantial amount value 
      compared to the liquidity available in the pool and due to that price of the 
      trade is being impacted. Consider lowering the amount you are trading to get 
      a better price.
    `,
  },
  slippage: {
    levelId: 2,
    warningMsg: 'High risk: high slippage',
    warningDesc: `Your allowed slippage tolerance is high and you may lose 
      quite a significant amount of money swapping high volatile tokens.`,
  },
  both: {
    levelId: 3,
    warningMsg: 'High risk: high slippage and sizable swap',
    warningDesc: `Your allowed slippage tolerance is high and the swap you are 
      about to make has a substantial amount value compared to the liquidity available 
      in the pool. Due to that price of trade is being impacted. You may lose a 
      significant amount of money swapping high volatile tokens.
    `,
  },
}

const WarningCard = ({
  priceImpact,
  slippageTolerance,
}: {
  priceImpact: string
  slippageTolerance: number
}) => {
  const [expanded, setExpanded] = useState(false)
  const animationRef = useRef<HTMLDivElement>(null)

  const expandWarningCard = () => {
    setExpanded(!expanded)
    if (animationRef && animationRef.current) {
      if (!expanded) {
        animationRef.current.style.overflow = 'unset'
      } else {
        animationRef.current.style.overflow = 'hidden'
      }
    }
  }

  let warningDetail = WarningDetails.none
  if (
    Number(priceImpact) > SIZEABLE_SWAP_RISK_LIMIT &&
    slippageTolerance > SLIPPAGE_RISK_LIMIT
  ) {
    warningDetail = WarningDetails.both
  } else if (slippageTolerance > SLIPPAGE_RISK_LIMIT) {
    warningDetail = WarningDetails.slippage
  } else if (Number(priceImpact) > SIZEABLE_SWAP_RISK_LIMIT) {
    warningDetail = WarningDetails.sizeableSwap
  }

  return (
    <WarningCardContainer rounded risk={!!warningDetail.warningDesc}>
      <WarningHeader
        onClick={expandWarningCard}
        risk={!!warningDetail.warningDesc}
        expanded={expanded}
      >
        <HeaderTop>
          <HeaderIcon risk={!!warningDetail.warningDesc}>
            <Icon
              iconType={
                warningDetail.warningDesc ? 'priority_high' : 'thumb_up'
              }
              outlined
            />
          </HeaderIcon>
          <HeaderTitle>{warningDetail.warningMsg}</HeaderTitle>
          <Icon iconType={expanded ? 'expand_less' : 'expand_more'} />
        </HeaderTop>
        {warningDetail.warningDesc && (
          <HeaderBottom>{warningDetail.warningDesc}</HeaderBottom>
        )}
      </WarningHeader>
      <WarningBodyWapper
        ref={animationRef}
        className={expanded ? 'expanding' : 'hiding'}
      >
        <WarningBody>
          <StatRow
            name={t`Price impact`}
            tooltip={t`The difference between the mid-price and the execution price of a
            trade. Price impact gives you an idea what slippage to actually
            expect based on the size of the order you’re placing and what’s
            going on in the market.`}
            tooltipLink={t`Learn more about price impact`}
            link={HUMBLE_SWAP_FAQ}
            value={`≈${priceImpact}%`}
            warning={warningDetail.levelId === 1 || warningDetail.levelId === 3}
          />
          <StatRow
            name={t`Allowed slippage`}
            tooltip={t`The maximum difference between your estimated price and execution
            price.`}
            tooltipLink={t`Learn more about slippage.`}
            link={HUMBLE_SWAP_SLIPPAGE}
            value={`${slippageTolerance.toFixed(2)}%`}
            CustomStat={<AllowedSlippage />}
            warning={warningDetail.levelId >= 2}
          />
        </WarningBody>
      </WarningBodyWapper>
    </WarningCardContainer>
  )
}

export default WarningCard
