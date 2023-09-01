import styled, { css } from 'styled-components'
import FlexContainer, { GridContainer } from 'components/Common/FlexContainer'
import {
  HUMBLE_SWAP_DISCORD,
  HUMBLE_SWAP_REDDIT,
  HUMBLE_SWAP_TELEGRAM,
  HUMBLE_SWAP_TWITTER,
} from 'constants/links'
import diver2 from 'assets/diver2_light.svg'
import reddit from 'assets/Icons/social-reddit.svg'
import discord from 'assets/Icons/social-discord.svg'
import telegram from 'assets/Icons/social-telegram.svg'
import twitter from 'assets/Icons/social-twitter.svg'
import ImageLoader from 'components/Common/ImageLoader'
import { COLORS } from 'theme'
import SIZE from 'constants/screenSizes'

const promptFont = css`
  color: #000;
  font-family: 'Prompt', sans-serif;
`
const H = styled.h1`
  ${promptFont}
  font-size: 4.7rem;
  z-index: 10;

  &:first-of-type {
    display: inline-block;

    &::before {
      background-color: ${COLORS.yellow};
      bottom: -8px;
      content: '';
      height: 25px;
      left: -10px;
      position: absolute;
      width: calc(100% + 20px);
      z-index: -1;
    }
  }

  @media screen and (max-width: ${SIZE.sm}) {
    font-size: 3.2rem;
  }
`
const Space = styled.hr`
  border: 0;
  margin: 1rem 0 0.5rem;
  font-weight: 500;
`
const GridText = styled.div`
  @media screen and (max-width: ${SIZE.sm}) {
    width: 100vw;
  }
`
const P = styled.p`
  ${promptFont}
  font-size: 1.7rem;
  font-weight: 500;
  line-height: 3.6rem;

  @media screen and (max-width: ${SIZE.sm}) {
    font-size: 1rem;
  }
`
const Diver = styled(ImageLoader)`
  max-width: 500px;

  @media screen and (max-width: ${SIZE.md}) {
    max-width: 250px;
  }

  @media screen and (max-width: ${SIZE.sm}) {
    margin: 0 auto;
    max-width: 100%;
    width: 427px;
  }
`
const MainGrid = styled(GridContainer)`
  background-color: ${COLORS.milk};
  grid-template-columns: repeat(2, minmax(400px, max-content));
  min-height: 100vh;
  padding-top: 3rem;
  place-content: center;

  @media screen and (max-width: ${SIZE.md}) {
    grid-template-columns: 250px max-content;
  }

  @media screen and (max-width: ${SIZE.sm}) {
    align-items: center;
    grid-template-columns: 100%;
    place-content: center;
    text-align: center;
  }
`
const SocialLinks = styled(FlexContainer)`
  width: 100%;

  > * {
    margin-right: 0.5rem;
  }
  @media screen and (max-width: ${SIZE.sm}) {
    place-content: center;
  }
`
const Socials = [
  { alt: 'Humble Reddit', href: HUMBLE_SWAP_REDDIT, icon: reddit },
  { alt: 'Humble Discord', href: HUMBLE_SWAP_DISCORD, icon: discord },
  { alt: 'Humble Telegram', href: HUMBLE_SWAP_TELEGRAM, icon: telegram },
  { alt: 'Humble Twitter', href: HUMBLE_SWAP_TWITTER, icon: twitter },
]
const ImgLink = styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})``

const ComingSoon = () => (
  <MainGrid>
    <Diver src={diver2} />

    <GridText>
      <H>Humble 2.0</H>
      <Space />
      <H>coming soon!</H>
      <Space />
      <Space />
      <P>Follow us on social media for updates.</P>

      <SocialLinks>
        {Socials.map(({ href, icon }, i) => (
          <ImgLink href={href} key={i}>
            <ImageLoader width={48} src={icon} />
          </ImgLink>
        ))}
      </SocialLinks>
    </GridText>
  </MainGrid>
)

export default ComingSoon
