import { t } from '@lingui/macro'
import hand from 'assets/halt-hand.svg'
import { noOp } from '@reach-sh/humble-sdk'
import ModalComponent from 'components/Modals/ModalComponent'
import { clearGlobalModal } from 'state/reducers/modals'
import {
  ContentContainer,
  GenericModalProps,
  Heading,
  HeadingImage,
  ModalTitle,
} from './Modals.Shared'

/** Generic Warning modal with "Hand" image */
export default function WarningModal(props: GenericModalProps) {
  const {
    open,
    title = t`Before you proceed`,
    cancellationText,
    children,
    sticky,
    onConfirm = noOp,
    onClose,
    width = 420,
  } = props
  const closeAction = onClose || clearGlobalModal

  return (
    <ModalComponent
      open={open}
      width={width}
      sticky={sticky}
      onClose={closeAction}
      onConfirm={onConfirm}
      confirmationText={t`Got it`}
      cancellationText={cancellationText}
      hideCancelBtn={!cancellationText}
    >
      <ContentContainer>
        <Heading>
          <HeadingImage src={hand} />
          <ModalTitle>{title}</ModalTitle>
        </Heading>

        {/* Contents */}
        {children}
      </ContentContainer>
    </ModalComponent>
  )
}
