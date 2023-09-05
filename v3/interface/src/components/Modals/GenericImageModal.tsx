import { useTheme } from 'contexts/theme'
import { t } from '@lingui/macro'

import BallonsPng from 'assets/success.png'
import BallonsPngDark from 'assets/success-dark.png'
import ModalComponent from 'components/Modals/ModalComponent'
import { clearGlobalModal } from 'state/reducers/modals'
import {
  BoxSection,
  ContentContainer,
  GenericModalProps,
  Heading,
  HeadingImage,
  ModalTitle,
} from './Modals.Shared'

/** `Modal` props */
type ModalProps = Omit<GenericModalProps, 'sticky' | 'onConfirm'> & {
  imageSrc?: string
  onConfirm?: () => any
}

/** Generic Success modal with "Balloon" image */
export default function GenericImageModal(props: ModalProps) {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const {
    open,
    title = t`Success!`,
    children,
    onClose,
    onConfirm = onClose || clearGlobalModal,
    width = 420,
    imageSrc = defaultImage(isDarkMode),
  } = props
  const closeAction = onClose || clearGlobalModal

  return (
    <ModalComponent
      hideCancelBtn
      open={open}
      width={width}
      onClose={closeAction}
      onConfirm={onConfirm}
      confirmationText={t`Close`}
      sticky={false}
    >
      <ContentContainer>
        <Heading>
          <HeadingImage src={imageSrc} />
          <ModalTitle>{title}</ModalTitle>
        </Heading>

        {/* Contents */}
        <BoxSection dark={isDarkMode}>{children}</BoxSection>
      </ContentContainer>
    </ModalComponent>
  )
}

function defaultImage(darkMode = false) {
  return darkMode ? BallonsPngDark : BallonsPng
}
