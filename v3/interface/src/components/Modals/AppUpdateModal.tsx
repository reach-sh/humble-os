import { Trans } from '@lingui/macro'
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import styled from 'styled-components'
import announce from 'assets/announce.png'
import { VERSION } from 'constants/reach_constants'
import ModalComponent from './ModalComponent'
import { FlexColumnContainer } from '../Common/FlexContainer'

const GotItButton = styled(Button)`
  width: 100%;
  height: 54px;
  background: ${COLORS.yellow};
  font-weight: 700;
  font-size: 20px;
  font-family: Lato;
`

const ModalContent = styled(FlexColumnContainer)`
  align-items: center;
  gap: 16px;
  justify-content: space-between;
  padding: 12px 24px 24px;
`

const Message = styled.div`
  align-self: flex-start;
  font-weight: 500;
  font-size: 17px;
`

const Image = styled.img`
  width: 200px;
  height: 200px;
`

const Subtitle = styled.h4`
  align-self: flex-start;
  font-weight: 900;
  color: ${COLORS.midGray};
`

const Title = styled.h3`
  align-self: flex-start;
  font-weight: 900;
  font-size: 32px;
`

const ImageContainer = styled.div`
  margin: 16px 0;
  display: flex;
  justify-content: center;
`
const AppUpdateModal = ({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) => (
  <ModalComponent open={open} width={382} onClose={onClose}>
    <ModalContent>
      <ImageContainer>
        <Image src={announce} />
      </ImageContainer>
      <Title>
        <Trans>App updated</Trans>
      </Title>
      <Subtitle>{localStorage.getItem(VERSION)}</Subtitle>
      <Message>
        <Trans>
          All local data has been cleared: the window will reload when you close
          this modal.
        </Trans>
      </Message>
      <GotItButton onClick={onClose}>
        <Trans>Got it</Trans>
      </GotItButton>
    </ModalContent>
  </ModalComponent>
)

export default AppUpdateModal
