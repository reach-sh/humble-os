/**
 * @file Containers for Limit order components.
 */
import styled from 'styled-components'
import FlexContainer, {
  FlexColumnContainer,
  GridContainer,
} from 'components/Common/FlexContainer'
import SIZE from 'constants/screenSizes'

export const CellHeading = styled.h6`
  /* Hide above this screen size */
  @media screen and (min-width: ${SIZE.md}) {
    display: none;
  }
`

export const ListItemContainer = styled(GridContainer)`
  border-radius: ${({ theme }) => theme.sizes.borderRadius};
  grid-template-columns: repeat(4, 1fr) 1rem;
  grid-template-areas: 'sell buy rate status menu';
  padding: 0.65rem 1rem;
  @media screen and (max-width: ${SIZE.md}) {
    grid-template-columns: repeat(2, 1fr) 1rem;
    grid-template-areas:
      'status   status  status'
      'sell     buy     menu'
      'rate     rate    rate';
  }
`
export const ListOrderItemContainer = styled(ListItemContainer)`
  @media screen and (max-width: ${SIZE.md}) {
    grid-template-columns: 2fr 1rem;
    grid-template-areas:
      'status status'
      'sell   menu'
      'buy    menu'
      'rate   rate';
  }
`
export const ListHeading = styled(FlexContainer)`
  justify-content: space-between;
  margin-bottom: 2rem;
`
export const LimitOrderTokenAmount = styled.div`
  grid-area: amount;
  max-width: 7rem;
  padding: 0.2rem 0;
  h4 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`
export const LimitOrderRateContainer = styled(FlexColumnContainer)`
  align-self: stretch;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  grid-area: rate;
  margin-right: 1rem;
  @media screen and (max-width: ${SIZE.md}) {
    border-right: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.border2};
    flex-direction: row;
    margin: 0.6rem 0 0;
    padding-top: 1rem;
    justify-content: space-between;
    > * {
      width: initial;
    }
  }
`
type LOTCP = { side: 'buy' | 'sell' }
export const LimitOrderTokenContainer = styled(GridContainer)<LOTCP>`
  border-right: 1px solid ${({ theme }) => theme.colors.border2};
  margin-right: 1rem;
  grid-area: ${({ side = 'buy' }) => side};
  grid-template-areas:
    'icon icon'
    '..   amount'
    '..   price';
  grid-template-columns: 1.6rem max-content;
  place-content: flex-start;
  @media screen and (max-width: ${SIZE.md}) {
    grid-template-columns: 0.8fr 0.4fr 1.2fr 1.6fr;

    border: 0;
    grid-template-areas:
      '..  icon  icon  amount'
      '..  ..    ..    price';
  }
`
export const LimitOrderTokenInfo = styled(FlexContainer)`
  grid-area: icon;
`
export const LimitOrderTokenPrice = styled.span`
  font-size: smaller;
  grid-area: price;
`
export const ListTitle = styled.h2`
  font-size: 24px;
  @media (max-width: ${SIZE.sm}) {
    font-size: 18px;
  }
`
