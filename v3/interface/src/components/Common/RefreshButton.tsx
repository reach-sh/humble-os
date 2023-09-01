import styled from 'styled-components'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import RefreshIcon from 'assets/Icons/refresh.svg'

const RefreshWrapper = styled.div`
  background: ${({ theme }) => theme.colors.accent};
  border-radius: 8px;
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
  text-align: center;
  position: relative;
  cursor: pointer;
  margin-left: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: ${SIZE.sm}) {
    top: 0;
  }
`
const Refresh = styled.img`
  width: 85%;
  filter: grayscale(1) invert(1);
`

const RefreshButton = ({
  testId,
  updating,
  onClick,
}: {
  testId: string
  updating: boolean
  onClick: () => void
}) => (
  <RefreshWrapper data-testid={testId} onClick={onClick}>
    {updating ? (
      <span
        style={{
          position: 'relative',
          left: '3px',
          color: COLORS.white,
        }}
        className='spinner--before'
      />
    ) : (
      <Refresh src={RefreshIcon} />
    )}
  </RefreshWrapper>
)

export default RefreshButton
