import OrderCanceledSvg from 'assets/order-canceled.svg'
import OrderCanceledDarkSvg from 'assets/order-canceled-dark.svg'
import { useTheme } from 'contexts/theme'
import { t } from '@lingui/macro'
import { clearGlobalModal } from 'state/reducers/modals'
import { Token } from 'types/shared'
import CryptoIcon from 'components/Common/CryptoIcon'
import FlexContainer from 'components/Common/FlexContainer'
import ModalComponent from 'components/Modals/ModalComponent'
import {
  BoxSection,
  ContentContainer,
  GenericModalProps,
  Heading,
  HeadingImage,
  LargeText,
  ModalText,
  ModalTitle,
  RowContainer,
} from './Modals.Shared'

/** `LimitOrderCanceledModal` props */
type ModalProps = Pick<GenericModalProps, 'open' | 'onClose' | 'width'> & {
  token?: Token
  amount?: any
}

/** "Limit Order Canceled" notification modal */
export default function LimitOrderCanceledModal(props: ModalProps) {
  const { open, amount, onClose, token, width = 420 } = props
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const closeAction = onClose || clearGlobalModal
  const imageSrc = isDarkMode ? OrderCanceledDarkSvg : OrderCanceledSvg

  return (
    <ModalComponent
      hideCancelBtn
      open={open}
      width={width}
      onClose={closeAction}
      onConfirm={closeAction}
      confirmationText={t`Close`}
    >
      <ContentContainer>
        <Heading>
          <HeadingImage src={imageSrc} />
          <ModalTitle>{t`Limit Order Canceled!`}</ModalTitle>
        </Heading>

        {/* Contents */}
        <BoxSection dark={isDarkMode}>
          <ModalText fontSize={12} dark={isDarkMode}>
            {t`You received`}
          </ModalText>

          <RowContainer>
            <FlexContainer>
              <CryptoIcon
                symbol={token?.symbol ?? 'ALGO'}
                id={token?.id}
                size={24}
              />
              <LargeText dark={isDarkMode} iconLabel>
                {token?.symbol}
              </LargeText>
            </FlexContainer>

            <LargeText dark={isDarkMode}>{amount}</LargeText>
          </RowContainer>
        </BoxSection>
      </ContentContainer>
    </ModalComponent>
  )
}
