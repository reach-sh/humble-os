import { t } from '@lingui/macro'
import { useTheme } from 'contexts/theme'
import CryptoIcon from 'components/Common/CryptoIcon'
import FlexContainer from 'components/Common/FlexContainer'
import GenericImageModal from './GenericImageModal'
import {
  LargeText,
  RowContainer,
  ModalText,
  SuccessModalProps,
} from './Modals.Shared'

const SuccessSwapModal = ({
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
      title={t`You swapped successfully!`}
      width={420}
      onClose={onClose}
    >
      <>
        <ModalText fontSize={12} dark={isDarkMode}>
          {t`You received`}
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

export default SuccessSwapModal
