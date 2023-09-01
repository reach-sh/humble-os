import styled from 'styled-components'
import { t } from '@lingui/macro'
import Button from 'components/Common/Button'
import CryptoIcon from 'components/Common/CryptoIcon'
import FlexContainer, {
  FlexColumnContainer,
} from 'components/Common/FlexContainer'
import ModalComponent from 'components/Modals/ModalComponent'
import { COLORS } from 'theme'

const ModalContent = styled(FlexColumnContainer)`
  padding: 32px 12px 12px;
`

const Subtitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  padding-left: 16px;
`

const Percentage = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-top: 16px;
  padding-left: 16px;
`

const RemovedLiquidityBox = styled.div`
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.black};
  margin-top: 32px;
  padding: 16px;
`

const AssetRow = styled(FlexContainer)`
  gap: 8px;
  margin-top: 8px;
`

const AssetName = styled.span`
  font-size: 16px;
  font-weight: 700;
  width: 50%;
`

const AssetAmount = styled.span`
  font-size: 16px;
  font-weight: 700;
  width: 50%;
  &::after {
    content: '*';
    color: ${COLORS.orange};
  }
`

const InfoMessage = styled.div`
  font-size: 12px;
  font-weight: 400;
  line-height: 14.4px;
  margin-top: 8px;
  &::before {
    content: '*';
    color: ${COLORS.orange};
  }
`

const ConfirmButton = styled(Button)`
  font-size: 20px;
  font-weight: 700;
  height: 54px;
  margin-top: 24px;
`

interface ConfirmRemoveLiquidityProps {
  onClose: () => void
  onConfirm: () => void
  open: boolean
  percentage: string
  tokenAAmt: string
  tokenAId: string | number
  tokenASymbol: string
  tokenBAmt: string
  tokenBId: string | number
  tokenBSymbol: string
}

const ConfirmRemoveLiquidity = ({
  onClose,
  onConfirm,
  open,
  percentage,
  tokenAAmt,
  tokenAId,
  tokenASymbol,
  tokenBAmt,
  tokenBId,
  tokenBSymbol,
}: ConfirmRemoveLiquidityProps) => (
  <ModalComponent
    modalTitle={t`Confirm removing liquidity`}
    onClose={onClose}
    open={open}
    sticky={false}
    width={420}
  >
    <ModalContent>
      <Subtitle>{t`Remove amount`}</Subtitle>
      <Percentage>{percentage}%</Percentage>
      <RemovedLiquidityBox>
        {t`You will receive`}
        <AssetRow>
          <CryptoIcon symbol={tokenASymbol} id={tokenAId} />
          <AssetName>{tokenASymbol}</AssetName>
          <AssetAmount>{tokenAAmt}</AssetAmount>
        </AssetRow>
        <AssetRow>
          <CryptoIcon symbol={tokenBSymbol} id={tokenBId} />
          <AssetName>{tokenBSymbol}</AssetName>
          <AssetAmount>{tokenBAmt}</AssetAmount>
        </AssetRow>
      </RemovedLiquidityBox>
      <InfoMessage>{t`Output is estimated.`}</InfoMessage>
      <ConfirmButton
        data-testid='remove-liquidity-confirmation'
        onClick={onConfirm}
      >{t`Confirm`}</ConfirmButton>
    </ModalContent>
  </ModalComponent>
)

export default ConfirmRemoveLiquidity
