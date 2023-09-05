import styled from 'styled-components'
import SIZE from 'constants/screenSizes'
import useGlobalProgress from 'hooks/useGlobalProgress'

const Overlay = styled.div`
  background: rgba(0, 0, 0, 0.5);
  height: 100vh;
  left: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 9;
`

const Container = styled.div`
  bottom: 6.5rem;
  left: 50%;
  position: fixed;
  transform: translateX(-50%);
  width: 42rem;
  z-index: 10;
  @media (max-width: ${SIZE.md}) {
    bottom: 8.25rem;
    width: 95%;
  }
  @media (max-width: ${SIZE.sm}) {
    bottom: 1.75rem;
    width: 95%;
  }
`

const Message = styled.p`
  color: white;
  text-align: center;
  margin-bottom: 1.5rem;
`

const ProgressBarContainer = styled.div`
  overflow: hidden;
  height: 8px;
  background: black;
  border-radius: 8px;
`

const ProgressBarFill = styled.div<{ percent?: number }>`
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.main};
  width: ${({ percent }) => `${percent || 0}%`};
  height: 100%;
  transition: width 1s ease-in-out;
`

const ProgressBar = () => {
  const { isActive, message, totalSteps, currentStep } = useGlobalProgress()
  if (!isActive || !totalSteps) return null
  const percent = ((currentStep || 0) / totalSteps) * 100
  return (
    <Overlay>
      <Container>
        <Message>{message}</Message>
        <ProgressBarContainer>
          <ProgressBarFill percent={percent} />
        </ProgressBarContainer>
      </Container>
    </Overlay>
  )
}

export default ProgressBar
