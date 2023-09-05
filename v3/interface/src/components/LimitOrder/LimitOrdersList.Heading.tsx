import SIZE from 'constants/screenSizes'
import styled from 'styled-components'
import { ListItemContainer } from './LimitOrders.Containers'

const Container = styled(ListItemContainer)`
  @media screen and (max-width: ${SIZE.md}) {
    display: none;
  }
`
const Column = styled.div`
  padding-left: 0.2rem;
`

const LimitOrdersHeading = () => (
  <Container>
    <Column>You sell</Column>
    <Column>You buy</Column>
    <Column>Order rate</Column>
    <Column>Status</Column>
    <span />
  </Container>
)

export default LimitOrdersHeading
