import { useEffect } from 'react'
import { noOp } from '@reach-sh/humble-sdk'
import styled, { keyframes } from 'styled-components'
import { FlexColumnContainer } from 'components/Common/FlexContainer'

const LoadingContainer = styled(FlexColumnContainer)`
  background: ${({ theme }) => theme.colors.ring2};
  color: ${({ theme }) => theme.colors.text};
  height: 100vh;
  overflow: hidden;
  place-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;

  &,
  * {
    pointer-events: none;
  }
`
const loadingTextAnimation = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`
const expandingImageAnimation = keyframes`
  30% { transform: scale(1.5) }
  100% { transform: scale(0) }
`
const LoadingText = styled.p`
  font-weight: bold;
  transition: opacity 1s ease;
  text-align: center;

  &.expand {
    animation: ${loadingTextAnimation} 1s forwards;
  }
  &.fade {
    opacity: 0;
  }
  &.disappear {
    animation: ${expandingImageAnimation} 1s forwards 0.75s;
  }
`

const LoadingImage = styled.div`
  background-image: ${({ theme }) => `url(${theme.images.loading})`};
  height: 78px;
  margin-bottom: 10px;
  width: 60px;
  &.disappear {
    animation: ${expandingImageAnimation} 1s forwards 1s;
  }
`

type Props = { completeAnimation?: boolean; done?: (...a: any[]) => any }

const InitialLoadingScreen = (props: Props) => {
  const LOADING_TEXT = 'HumbleSwap is loading...'
  const { completeAnimation = false, done = noOp } = props

  useEffect(() => {
    if (!completeAnimation) return noOp
    const timeout = setTimeout(done, 800)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <LoadingContainer className={completeAnimation ? 'fade' : ''}>
      <LoadingImage className={completeAnimation ? 'disappear' : ''} />
      <LoadingText className={completeAnimation ? 'disappear' : ''}>
        {LOADING_TEXT}
      </LoadingText>
    </LoadingContainer>
  )
}

export default InitialLoadingScreen
