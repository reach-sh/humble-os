import { LimitOrderCore, SwapInfo } from 'types/shared'
import ExchangeRate, {
  ExchangeRateLimitOrder,
} from 'components/Common/ExchangeRate'
import styled from 'styled-components'
import StatsCard from './StatsCard'

const LimitOrderContainer = styled.div`
  margin: 32px 0 16px 0;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.cardHighlight};
  border-radius: 16px;
`

const SwapSummary = (props: SwapInfo) => {
  const { tokA, tokB, amtA, amtB } = props
  if (!amtA || !amtB) return <></>

  return (
    <>
      <ExchangeRate tokA={tokA} tokB={tokB} amtA={amtA} amtB={amtB} />
      <StatsCard {...props} />
    </>
  )
}

export default SwapSummary

export const LimitOrderSummary = (props: LimitOrderCore) => {
  const { tokA, tokB, amtA, amtB, delta } = props
  if (!amtA || !amtB || !delta) return <></>

  return (
    <LimitOrderContainer>
      <ExchangeRateLimitOrder
        tokA={tokA}
        tokB={tokB}
        amtA={amtA}
        amtB={amtB}
        delta={delta}
      />
    </LimitOrderContainer>
  )
}
