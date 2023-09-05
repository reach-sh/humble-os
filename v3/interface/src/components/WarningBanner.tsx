import { HUMBLE_SWAP_SUPPORT } from 'constants/links'
import SIZE from 'constants/screenSizes'
import styled, { keyframes } from 'styled-components'
import { buttonAndLinkStyles } from './Common/Button'
import FlexContainer from './Common/FlexContainer'

const pulse = keyframes`
  0% {
    opacity: .80;
  }
  100% {
    opacity: 1;
  }
`

const BannerContainer = styled(FlexContainer)`
  animation: ${pulse} 1100ms infinite alternate;
  background: #11100d;
  place-content: center;
  padding: 0.25rem 0;
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 99;
`

const BannerText = styled.span`
  color: White;
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

const LearnMore = styled.a`
  ${buttonAndLinkStyles}
  line-height: initial;
  letter-spacing: initial;
  padding: 0.25rem;
`

const Banner = () => (
  <BannerContainer>
    <BannerText>
      HumbleSwap is in beta. Test it out and share you feedback.
    </BannerText>
    <LearnMore
      size='tiny'
      variant='accent'
      href={HUMBLE_SWAP_SUPPORT}
      target='_blank'
      rel='noopener noreferrer nofollow'
    >
      Go to support
    </LearnMore>
  </BannerContainer>
)

export default Banner
