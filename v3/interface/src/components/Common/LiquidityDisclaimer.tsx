import styled from 'styled-components'
import { Trans } from '@lingui/macro'

const Disclamer = styled.p`
  margin: 1rem 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.cardText};
`

const LiquidityDisclaimer = () => (
  <Disclamer>
    <Trans>
      By adding liquidity you&apos;ll earn 0.25% of all trades on this pair
      proportional to your share of the pool. Fees are added to the pool,
      accumulate in real time and can be claimed by removing your liquidity.
    </Trans>
  </Disclamer>
)

export default LiquidityDisclaimer
