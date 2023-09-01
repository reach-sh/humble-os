import styled from 'styled-components'
import { FlexColumnContainer } from 'components/Common/FlexContainer'

type ContainerProps = { fullscreen?: boolean }

const LoadingContainer = styled(FlexColumnContainer)<ContainerProps>`
  background: ${({ theme, fullscreen }) =>
    fullscreen ? theme.colors.ring2 : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  height: ${({ fullscreen }) => (fullscreen ? '100vh' : '100%')};
  place-content: center;
  overflow: hidden;
  position: absolute;
  width: 100%;
  z-index: 100;
`
const LoadingText = styled.p`
  font-weight: bold;
  text-align: center;
  transition: opacity 1s ease;
`
const LoadingImage = styled.div`
  background-image: ${({ theme }) => `url(${theme.images.loading})`};
  height: 78px;
  margin-bottom: 10px;
  width: 60px;
`

type Props = { msg?: string } & ContainerProps

const LoadingScreen = (props: Props) => {
  const LOADING_TEXT = 'HumbleSwap is loading...'
  const { msg = LOADING_TEXT, fullscreen = true } = props

  return (
    <LoadingContainer fullscreen={fullscreen}>
      <LoadingImage />
      <LoadingText>{msg}</LoadingText>
    </LoadingContainer>
  )
}

export default LoadingScreen
