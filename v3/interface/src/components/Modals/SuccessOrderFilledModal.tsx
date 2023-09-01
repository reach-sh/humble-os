import { useTheme } from 'contexts/theme'
import CryptoIcon from 'components/Common/CryptoIcon'
import FlexContainer from 'components/Common/FlexContainer'
import { LABELS, LIMIT_ORDER } from 'constants/messages'
import GenericImageModal from './GenericImageModal'
import {
  LargeText,
  RowContainer,
  ModalText,
  SuccessModalProps,
} from './Modals.Shared'

const SuccessOrderFilledModal = ({
  open,
  tokenB,
  amtB,
  onClose,
}: SuccessModalProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'

  return (
    <GenericImageModal
      open={open}
      title={LIMIT_ORDER.FILLED}
      width={420}
      onClose={onClose}
    >
      <>
        <ModalText fontSize={12} dark={isDarkMode}>
          {LABELS.RECEIVED_MIN}
        </ModalText>

        <RowContainer>
          <FlexContainer>
            <CryptoIcon symbol={tokenB.symbol} id={tokenB.id} size={24} />
            <LargeText dark={isDarkMode} iconLabel>
              {tokenB.symbol}
            </LargeText>
          </FlexContainer>

          <LargeText dark={isDarkMode}>{amtB}</LargeText>
        </RowContainer>
      </>
    </GenericImageModal>
  )
}

export default SuccessOrderFilledModal
