import popupBlockedLightMode from 'assets/popup_blocked_light_mode.svg'
import popupBlockedDarkMode from 'assets/popup_blocked_dark_mode.png'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import { COLORS } from 'theme'
import { useTheme } from 'contexts/theme'
import ExternalLinkIcon from 'components/Common/ExternalLink'
import ModalComponent from 'components/Modals/ModalComponent'
import Button from 'components/Common/Button'

const ContentContainer = styled.div`
  max-width: 26.25em;
  height: 36em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.walletWarningBg};
  border-radius: 1em;
  overflow: hidden;
  padding: 0 1em 1em;
`
const Title = styled.p`
  font-family: Lato;
  font-style: normal;
  font-weight: bold;
  font-size: 2em;
  line-height: 1.1em;
  color: ${({ theme }) => theme.colors.walletWarningText};
  bottom: 1em;
`
const WarningMessage = styled.div`
  list-style-position: outside;
  list-style-type: circle;
  font-family: Lato;
  font-style: normal;
  font-weight: normal;
  font-size: 1em;
  line-height: 1.25em;
  color: ${({ theme }) => theme.colors.walletWarningText};
`
const HowToLink = styled.a.attrs({
  rel: 'noopener noreferrer',
  target: '_blank',
})`
  align-self: flex-start;
  align-items: center;
  color: ${COLORS.darkSage};
  font-weight: bold;
  line-height: 1.28rem;
  margin-top: 1em;
`
const BrokenImage = styled.img`
  width: 15em;
  height: 15em;
`
const OkButton = styled(Button)`
  width: 100%;
  font-family: Lato;
  font-weight: bold;
  background: ${COLORS.yellow};
`
const Top = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Bottom = styled.div``

type PopupBlockerModalProps = {
  open: boolean
  onClose: () => void
}

export default ({ open, onClose }: PopupBlockerModalProps) => {
  const { theme } = useTheme()
  const isDarkTheme = theme === 'Dark'
  const popupBlocked = isDarkTheme
    ? popupBlockedDarkMode
    : popupBlockedLightMode

  return (
    <ModalComponent open={open} width={335} onClose={onClose}>
      <ContentContainer>
        <Top>
          <BrokenImage src={popupBlocked} />
          <Title>
            <Trans>
              Hey! It seems that you have the pop-up blocker activated.
            </Trans>
          </Title>
          <WarningMessage>
            <Trans>
              ⚠️ It usually prevents the Wallet popups from showing, which
              effectively blocks the transaction. To successfully use Humble
              please deactivate your pop-up blocker.
            </Trans>
          </WarningMessage>
          <HowToLink href='https://support.humble.sh/618634-How-to-Disable-Pop-up-Blocker-in-Chrome'>
            Learn how to do it <ExternalLinkIcon width={20} />
          </HowToLink>
        </Top>
        <Bottom>
          <OkButton onClick={onClose}>
            <Trans>OK</Trans>
          </OkButton>
        </Bottom>
      </ContentContainer>
    </ModalComponent>
  )
}
