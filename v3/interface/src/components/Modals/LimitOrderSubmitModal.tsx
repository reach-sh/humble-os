import styled from 'styled-components'
import { useTheme } from 'contexts/theme'
import CryptoIcon from 'components/Common/CryptoIcon'
import { COLORS } from 'theme'
import { t, Trans } from '@lingui/macro'

import { FlexColumnContainer } from 'components/Common/FlexContainer'
import Button from 'components/Common/Button'
import BallonsPng from 'assets/success.png'
import BallonsPngDark from 'assets/success-dark.png'
import { Token } from 'types/shared'
import ModalComponent from 'components/Modals/ModalComponent'

export const BoxContainer = styled.div<{ dark: boolean }>`
  border: 1px solid ${({ dark }) => (dark ? COLORS.DMMidGray : COLORS.black)};
  border-radius: 8px;
  max-width: 350px;
  padding: 16px;
  margin-bottom: 20px;
`

export const RowContainer = styled.div`
  display: flex;
  overflow: hidden;
  padding: 5px 9px;
  margin-top: 5px;

  &:first-of-type {
    margin-top: 13px;
  }

  > div:last-of-type {
    overflow: hidden;
    span:first-child {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
`

export const Column = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
`

export const Span = styled.span<{
  highlight?: boolean
  fontSize?: number
  fontWeight?: number
  marginSides?: boolean
  dark?: boolean
  iconLabel?: boolean
}>`
  font-size: ${({ fontSize }) => fontSize || '32'}px;
  font-weight: ${({ fontWeight }) => fontWeight || '700'};
  color: ${({ dark, highlight }) =>
    highlight ? COLORS.yellow : dark ? COLORS.white : COLORS.black};
  margin: 0px ${({ marginSides }) => (marginSides ? '12' : '0')}px;
  margin-left: ${({ iconLabel }) => (iconLabel ? '8' : '0')}px;
`

export const ModalContent = styled(FlexColumnContainer)`
  padding: 16px;
`

export const ImageContainer = styled.div`
  margin: 16px 0;
  display: flex;
  justify-content: center;
`

export const Image = styled.img`
  width: 200px;
  height: 200px;
`

const CloseButton = styled(Button)`
  width: 100%;
  height: 54px;
  background: ${COLORS.yellow};
  font-weight: 700;
  font-size: 20px;
  font-family: Lato;
`

interface SuccessModalProps {
  open: boolean
  token: Token
  amt: string
  onClose: () => void
}

const LimitOrderSumbitModal = ({
  open,
  token,
  amt,
  onClose,
}: SuccessModalProps) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'Dark'
  const imageSrc = isDarkMode ? BallonsPngDark : BallonsPng

  return (
    <ModalComponent
      open={open}
      modalTitle={t`Limit Order submitted`}
      width={420}
      onClose={onClose}
      sticky={false}
    >
      <ModalContent>
        <ImageContainer>
          <Image src={imageSrc} />
        </ImageContainer>
        <BoxContainer dark={isDarkMode}>
          <Span fontSize={12} dark={isDarkMode}>
            {t`You will receive`}
          </Span>
          <RowContainer>
            <Column>
              <CryptoIcon symbol={token.symbol} id={token.id} size={24} />
              <Span fontSize={16} dark={isDarkMode} iconLabel>
                {token.symbol}
              </Span>
            </Column>
            <Column>
              <Span fontSize={16} dark={isDarkMode}>
                {Number(amt).toFixed(6)}
              </Span>
            </Column>
          </RowContainer>
        </BoxContainer>
        <CloseButton onClick={onClose}>
          <Trans>Close</Trans>
        </CloseButton>
      </ModalContent>
    </ModalComponent>
  )
}

export default LimitOrderSumbitModal
