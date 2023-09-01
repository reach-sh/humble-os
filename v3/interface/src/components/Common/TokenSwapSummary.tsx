import { Trans } from '@lingui/macro'
import styled from 'styled-components'
import { COLORS } from 'theme'

import { Token } from 'types/shared'
import CryptoIcon from './CryptoIcon'
import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from './FlexContainer'
import VerifiedBadge from './VerifiedBadge'

const SummaryContainer = styled(FlexColumnContainer)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.text};
  margin-bottom: 0.25rem;

  div:first-child,
  div:last-child {
    border: none;
    cursor: default;
  }

  div:hover {
    background: initial;
  }
`
const InBetweenLine = styled(FlexContainer)`
  place-content: center;

  hr {
    background-color: ${({ theme }) => theme.colors.text};
    border: 0;
    flex-grow: 1;
    height: 1px;
  }
  span {
    position: absolute;
    border-radius: 16px;
    border: 1px solid ${({ theme }) => theme.colors.text};
    padding: 0.75rem;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.nameText};
    font-style: normal;
    font-weight: bold;
    font-size: 16px;
    line-height: 19px;
    text-align: right;
  }
`
const AssetInfoContainer = styled(FlexColumnContainer)`
  align-items: flex-start;
  place-content: center;

  b {
    margin-left: ${({ theme }) => theme.sizes.xs};
  }
`
const SmallText = styled.span<{ bold?: boolean }>`
  display: inline-block;
  font-size: smaller;
  font-weight: ${({ bold }) => (bold ? 'bolder' : 'normal')};
  margin-left: ${({ theme }) => theme.sizes.xs};
  margin-right: ${({ theme }) => theme.sizes.xs};
`
const AssetName = styled(SmallText)`
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-style: normal;
  font-weight: bold;
  line-height: 19px;
  text-align: left;
`
const AssetBalanceContainer = styled(FlexColumnContainer)`
  align-items: end;
  flex-grow: 1;
  font-size: 16px;
  font-style: normal;
  font-weight: bold;
  line-height: 19px;
  overflow: hidden;
  place-content: end;
  text-align: right;
`
const Asterisk = styled.span`
  &::after {
    content: '*';
    color: ${COLORS.errorRed};
  }
`
const AssetItemWrapper = styled(GridContainer)<{
  hideBorder?: boolean
  disabled?: boolean
}>`
  border-bottom: ${({ hideBorder, theme }) =>
    hideBorder ? 'none' : `1px solid ${theme.colors.border}`};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  grid-template-columns: repeat(2, 50%);
  justify-content: space-between;
  min-height: 4.24rem;
  padding: 1rem;
  transition: background 0.1s ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }

  ${AssetName}, ${Asterisk} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

type SwapSummaryProps = {
  tokA: Token
  tokB: Token
  amtA: string
  amtB: string
}

const TokenSwapSummary = (props: SwapSummaryProps) => {
  const { tokA, tokB, amtA, amtB } = props
  return (
    <SummaryContainer>
      <AssetItemWrapper>
        <AssetInfoContainer>
          <FlexContainer>
            <CryptoIcon id={tokA.id || ''} symbol={tokA.symbol || ''} />
            <AssetName>{tokA.symbol} </AssetName>
            <VerifiedBadge verifyStatus={tokA?.verificationTier} />
          </FlexContainer>
        </AssetInfoContainer>
        <AssetBalanceContainer>
          <span>{amtA}</span>
        </AssetBalanceContainer>
      </AssetItemWrapper>

      <InBetweenLine>
        <hr />
        <span>
          <Trans>TO</Trans>
        </span>
        <hr />
      </InBetweenLine>

      <AssetItemWrapper>
        <AssetInfoContainer>
          <FlexContainer>
            <CryptoIcon id={tokB.id || ''} symbol={tokB.symbol || ''} />
            <AssetName>{tokB.symbol} </AssetName>
            <VerifiedBadge verifyStatus={tokB?.verificationTier} />
          </FlexContainer>
        </AssetInfoContainer>
        <AssetBalanceContainer>
          <Asterisk>{amtB}</Asterisk>
        </AssetBalanceContainer>
      </AssetItemWrapper>
    </SummaryContainer>
  )
}

export default TokenSwapSummary
