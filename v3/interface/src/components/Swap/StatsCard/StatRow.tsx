import React from 'react'
import FlexContainer from 'components/Common/FlexContainer'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { SwapStat } from 'types/shared'
import Tooltip from 'components/Common/Tooltip'

const StatContainer = styled(FlexContainer)`
  margin-top: 16px;
  align-items: flex-start;
  &:first-of-type {
    margin-top: 24px;
  }
`
const StatsLabel = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  font-size: 14px;
  font-weight: 600;
  line-height: 17px;
`

const NameLabel = styled.div``

const ValuesWrapper = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  word-break: break-word;
`

const Text = styled.b<{ warning?: boolean }>`
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  text-align: right;
  color: ${({ warning, theme }) =>
    warning ? COLORS.errorRed : theme.colors.text};
`

const BoldText = styled(Text)`
  font-weight: 600;
`

const TvlText = styled.span`
  margin-top: 4px;
  font-size: 12px;
  line-height: 14px;
  text-align: right;
  color: ${COLORS.darkSage};
`

type StatRowProps = SwapStat & {
  CustomStat?: React.ReactNode
}

const StatRow = ({
  name,
  tooltip,
  tooltipLink,
  link,
  value,
  symbol,
  warning,
  CustomStat,
  tvl,
}: StatRowProps) => (
  <StatContainer>
    <StatsLabel>
      <NameLabel>{name}</NameLabel>
      {tooltip && (
        <Tooltip message={tooltip} linkMessage={tooltipLink} link={link} />
      )}
    </StatsLabel>
    <ValuesWrapper>
      {CustomStat || (
        <>
          <BoldText warning={warning}>
            {value}
            {symbol && (
              <>
                &nbsp;<span>{symbol}</span>
              </>
            )}
          </BoldText>
          {tvl && <TvlText>≈{tvl}</TvlText>}
        </>
      )}
    </ValuesWrapper>
  </StatContainer>
)

export default StatRow

export const LimitOrderStatRow = ({
  name,
  value,
}: {
  name: string
  value: string
}) => (
  <StatContainer>
    <StatsLabel>
      <NameLabel>{name}</NameLabel>
    </StatsLabel>
    <ValuesWrapper>
      <Text>
        {value}
        <>
          &nbsp;<span>days</span>
        </>
      </Text>
    </ValuesWrapper>
  </StatContainer>
)
