import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from 'components/Common/FlexContainer'
import SIZE from 'constants/screenSizes'
import styled from 'styled-components'
import { COLORS } from 'theme'
import FarmGrid from './FarmGrid'
import ItemDetails from './ItemDetails'

/** FarmTableItem Component Wrapper */
export const FarmItemWrapper = styled.div<{ isStakedFarm: boolean }>`
  background-color: ${({ theme, isStakedFarm }) =>
    isStakedFarm ? theme.colors.lighterBackground : 'transparent'};
  border: 1px solid
    ${({ theme, isStakedFarm }) =>
      isStakedFarm ? theme.colors.lighterBackground : theme.colors.border};
  border-radius: 8px;
  margin-bottom: 8px;
  p {
    font-size: 16px;
    line-height: 19px;
    @media (max-width: ${SIZE.sm}) {
      font-size: 12px;
      line-height: 14px;
    }
  }
`
/** FarmTableItem visible contents (when collapsed) */
export const FarmItemContents = styled(FarmGrid)`
  align-items: flex-start;
  border-radius: 8px 8px 0 0;
  margin-bottom: -1px;
  padding: 0.5rem;
  grid-template-areas:
    'name   rem_reward  apr   tvl         arrow'
    'ends   balance     roi   tvl_price   arrow';
  transition: all 0.05s;

  @media screen and (max-width: ${SIZE.sm}) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-areas:
      'ends   balance'
      'name   arrow  '
      'tvl    apr    ';
  }
`
export const IconsAndName = styled(GridContainer)`
  grid-area: name;
  grid-template-columns: max-content auto 1fr;

  &,
  * {
    overflow: visible;
  }

  @media screen and (max-width: ${SIZE.sm}) {
    width: calc(80vw - 8rem);
  }
`
export const PartnerCheckDiv = styled(FlexContainer)`
  cursor: pointer;
`
export const EndsInNDays = styled.div`
  grid-area: ends;
  margin-left: 0.3rem;

  @media screen and (max-width: ${SIZE.sm}) {
    margin-bottom: 0.6rem;
  }
`
export const TotalReward = styled.div`
  cursor: pointer;
  font-size: 0.8rem;
  grid-area: rem_reward;
  overflow: visible;

  @media screen and (max-width: ${SIZE.sm}) {
    display: none;
  }
`
export const PairName = styled(ItemDetails)`
  flex-direction: row;
  padding-left: 0.4rem;
  place-content: start;
  width: 12rem;
`
export const ItemTitle = styled(FlexContainer)`
  @media screen and (max-width: ${SIZE.sm}) {
    order: 2;
  }
`
export const Icons = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  margin: 0;
`
export const IconWrapper = styled.div`
  height: 20px;

  &:nth-child(2) {
    margin-left: -0.35rem;
  }

  @media (max-width: ${SIZE.sm}) {
    transform: scale(0.8);
    margin-right: 0px;
  }
`
export const ExpandButtonCell = styled(FlexContainer)`
  align-content: flex-end;
  cursor: pointer;
  grid-area: arrow;
  justify-content: center;

  @media screen and (max-width: ${SIZE.sm}) {
    display: block;
    text-align: right;
  }
`
export const TightColumn = styled(FlexColumnContainer)`
  font-size: 0.8rem;
  max-width: 15rem;
  padding-left: 1rem;

  @media screen and (max-width: ${SIZE.sm}) {
    padding-left: 0;
  }
`
export const APRDetails = styled(TightColumn)`
  grid-area: apr;
`
export const HiddenTitle = styled.h6`
  display: none;
  font-weight: 300;
  font-size: 11.6187px;
  line-height: 15px;
  color: ${COLORS.midGray};
  text-align: left;
  width: 100%;

  @media screen and (max-width: ${SIZE.sm}) {
    display: block;
  }
`
export const TotalStaked = styled(TightColumn)`
  @media screen and (max-width: ${SIZE.sm}) {
    align-items: flex-start;
  }
`
export const TVLPrice = styled(ItemDetails)`
  font-size: 10px;
  grid-area: tvl_price;

  @media screen and (max-width: ${SIZE.sm}) {
    display: none;
  }
`
export const BalanceContainer = styled.div`
  cursor: pointer;
  grid-area: balance;

  @media screen and (max-width: ${SIZE.sm}) {
    > div > div:nth-child(2) {
      align-self: end;
    }
  }
`
export const BalanceInfo = styled(FlexContainer)<{ dark?: boolean }>`
  justify-content: space-between;
  padding: 0 8px;
  border: 1px dashed ${({ dark }) => (dark ? COLORS.white : COLORS.darkGray)};
  border-radius: 20px;
`

type SpanProps = { fontSize?: number; fontWeight?: number }
export const Span = styled.span<SpanProps>`
  color: ${({ theme }) => theme.colors.textAlt};
  font-size: ${({ fontSize }) => fontSize || '32'}px;
  font-weight: ${({ fontWeight }) => fontWeight || '700'};
  margin: 0 4px;
  text-align: right;
`
export const BalanceIcon = styled.img.attrs({ alt: 'wallet icon' })``
export const CheckIcon = styled.img`
  margin-left: 8px;
`
export const CalcIcon = styled.img`
  cursor: pointer;
  height: 17px;
  margin-left: 8px;
`
