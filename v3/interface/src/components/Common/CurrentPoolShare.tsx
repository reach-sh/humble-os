import styled from 'styled-components'
import { Trans } from '@lingui/macro'

const CurrentShareContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: 4px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  border: 1px solid #e0e0e0;
`
const CurrentShareTitle = styled.p``
const CurrentShareAmount = styled.p`
  font-weight: bold;
`

const CurrentShare = () => (
  <CurrentShareContainer>
    <CurrentShareTitle>
      <Trans>Current Share of the Pool</Trans>
    </CurrentShareTitle>
    <CurrentShareAmount>99.99%</CurrentShareAmount>
  </CurrentShareContainer>
)

export default CurrentShare
