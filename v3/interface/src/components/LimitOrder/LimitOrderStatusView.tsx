import FlexContainer from 'components/Common/FlexContainer'
import SIZE from 'constants/screenSizes'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { LimitOrderStatus } from 'types/shared'
import { capitalizeFirstLetter } from 'utils/input'

export const ViewContainer = styled(FlexContainer)<ViewProps>`
  color: ${({ status = 'open' }) => statusColor(status)};
  font-size: 1.2rem;
  grid-area: status;
  @media screen and (max-width: ${SIZE.md}) {
    background-color: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.sizes.borderRadius};
    margin-bottom: 1.2rem;
    place-content: center;
  }
`

type ViewProps = { status?: LimitOrderStatus }

const LimitOrderStatusView = ({ status }: ViewProps) => (
  <ViewContainer status={status}>{capitalizeFirstLetter(status)}</ViewContainer>
)

export default LimitOrderStatusView

export function statusColor(status: LimitOrderStatus) {
  switch (status) {
    case 'open':
      return COLORS.darkSage
    case 'closed':
      return COLORS.errorRed
    default:
      return COLORS.midGray
  }
}
