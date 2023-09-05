import SIZE from 'constants/screenSizes'
import styled, { keyframes } from 'styled-components'
import { useState } from 'react'
import FlexContainer from './Common/FlexContainer'
import RotateIconButton from './Common/RotateIconButton'
import closeIcon from '../assets/Icons/Close.svg'

const pulse = keyframes`
  0% {
    opacity: .80;
  }
  100% {
    opacity: 1;
  }
`

const RotateIconContainer = styled(FlexContainer)`
  justify-content: flex-end;
  width: 100%;
  position: absolute;
`

const BannerContainer = styled(FlexContainer)`
  animation: ${pulse} 1100ms infinite alternate;
  background: ${({ theme }) => theme.colors.accent};
  place-content: center;
  padding: 0.25rem 0;
  top: 28;
  width: 100%;
  z-index: 99;
`

const BannerText = styled.span`
  color: Black;
  flex: 1;
  font-size: x-small;
  margin-right: 1rem;
  text-align: center;
  white-space: nowrap;

  @media screen and (max-width: ${SIZE.sm}) {
    line-height: initial;
    white-space: pre-wrap;
    margin: 0 0.5rem;
    text-align: left;
  }
`

const Banner = () => {
  const [visible, setVisible] = useState(true)
  const onClose = () => {
    setVisible(false)
  }

  if (!visible) return null

  return (
    <BannerContainer>
      <BannerText>
        Always make sure the URL is app.humble.sh - bookmark it to be safe
      </BannerText>
      <RotateIconContainer>
        <RotateIconButton
          customIcon={closeIcon}
          onClick={onClose}
          filter='light-mode-svg-filter'
        />
      </RotateIconContainer>
    </BannerContainer>
  )
}

export default Banner
