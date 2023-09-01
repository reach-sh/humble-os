import Icon from 'components/Common/Icon'
import styled from 'styled-components'
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import ModalComponent from 'components/Modals/ModalComponent'
import { Trans } from '@lingui/macro'

const CenterIcon = styled.div`
  display: flex;
  justify-content: center;
`

const ContentContainer = styled.div`
  padding: 0 16px;
`

const StyledIcon = styled(Icon)`
  color: ${COLORS.orange};
  font-size: 120px;
`

const Title = styled.p`
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  line-height: 28px;
  margin-top: 20px;
  margin-bottom: 14px;
`

const Text = styled.p`
  font-size: 16px;
  line-height: 20px;
  margin-bottom: 16px;
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 40px;
`

type Props = {
  onUseDefault: () => void
  onProceed: () => void
  open: boolean
}

export default function SlippageChangeModal({
  onProceed,
  onUseDefault,
  open,
}: Props) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    <ModalComponent kind='noClose' open={open} width={420}>
      <ContentContainer>
        <CenterIcon>
          <StyledIcon iconType='warning_amber' outlined />
        </CenterIcon>
        <Title>
          <Trans>High slippage tolerance is risky!</Trans>
        </Title>
        <Text>
          <Trans>
            Allowing a high slippage tolerance you may lose quite a significant
            amount of money swapping high volatile tokens.
          </Trans>
        </Text>
        <Text>
          <Trans>
            We recommend customizing slippage ONLY IF YOU ARE
            <b>COMPLETELY CONFIDENT</b> in what you are doing.
          </Trans>
        </Text>
        <ButtonsContainer>
          <Button
            data-testid='slippage-warning-proceed'
            wide
            variant='cancel'
            onClick={onProceed}
          >
            <Trans>Proceed</Trans>
          </Button>
          <Button wide onClick={onUseDefault}>
            <Trans>Use default 0.5%</Trans>
          </Button>
        </ButtonsContainer>
      </ContentContainer>
    </ModalComponent>
  )
}
