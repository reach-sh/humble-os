import logo from 'assets/logo-white.svg'
import styled, { css } from 'styled-components'
import ModalComponent from './Modals/ModalComponent'
import Button from './Common/Button'
import ExternalLinkIcon, { ExternalLink } from './Common/ExternalLink'

const LatoCSS = css`
  font-family: Lato;
  font-style: normal;
`

const ContentContainer = styled.div`
  max-width: 26.25em;
  height: 37.5635em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.walletWarningBg};
  border-radius: 1em;
  overflow: hidden;
`
const Title = styled.p`
  ${LatoCSS}
  color: ${({ theme }) => theme.colors.walletWarningText};
  font-size: 1.5em;
  font-weight: bold;
  height: 1.8125em;
  line-height: 1.8125em;
  text-align: center;
`
const WarningMessage = styled.div`
  ${LatoCSS}
  color: ${({ theme }) => theme.colors.walletWarningText};
  font-size: 1em;
  font-weight: normal;
  line-height: 1.25em;

  > * {
    margin-bottom: 1em;
  }
`
const HeroImg = styled.img`
  align-self: center;
  height: auto;
  width: 10.8125em;
`
const Accept = styled(Button).attrs({ size: 'lg', wide: true })`
  font-size: 1.25em;
  font-weight: bold;
`

type ModalProps = {
  open: boolean
  onClose: () => void
}

export default ({ open, onClose }: ModalProps) => (
  <ModalComponent open={open} width={420} onClose={onClose}>
    <ContentContainer>
      <HeroImg src={logo} />

      <Title>Thanks for visiting Humble!</Title>

      <WarningMessage>
        <p>
          Humble is currently offline while we proactively address a potential
          vulnerability.
        </p>

        <p>
          <b>Zero funds have been lost</b>. This is a proactive effort to secure
          the platform. If you have any liquidity on Humble, please remove it.
        </p>

        <p>
          We can&apos;t wait to get back online, but we&apos;re going to make
          sure we do it safely. Please watch our{' '}
          <ExternalLink href='https://twitter.com/HumbleDefi'>
            Twitter
            <ExternalLinkIcon width={16} />
          </ExternalLink>{' '}
          and{' '}
          <ExternalLink href='https://discord.gg/wG3wtv7qn6'>
            Discord
            <ExternalLinkIcon width={16} />
          </ExternalLink>{' '}
          for updates.
        </p>
      </WarningMessage>

      <Accept onClick={onClose}>Continue</Accept>
    </ContentContainer>
  </ModalComponent>
)
