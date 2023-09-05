import { t } from '@lingui/macro'
import { getBlockchain } from '@reach-sh/humble-sdk'
import { WalletButton } from 'components/Common/Button'
import { FlexColumnContainer } from 'components/Common/FlexContainer'
// import MoonPayLogo from 'components/Common/Icons/moon-pay-logo'
import WyreLogo from 'components/Common/Icons/wyre-logo'
import ModalComponent from 'components/Modals/ModalComponent'
import { ASSURANCE, BUY_TOKENS } from 'constants/messages'
import GlobalModal, { clearGlobalModal, MODAL } from 'state/reducers/modals'
import styled from 'styled-components'
import { COLORS } from 'theme'

const BuyAlgoButton = styled(WalletButton)`
  background-color: ${({ theme }) => theme.colors.lighterBackground};
  border: 1px solid ${COLORS.sage};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
  height: 56px;
  align-items: center;
  width: 100%;
  padding-left: 11px;
  gap: 9px;
  &:not([disabled]):hover {
    background-color: ${({ theme }) => theme.colors.hover};
  }
`

const Container = styled(FlexColumnContainer)`
  align-items: center;
`
const DescLabel = styled.span`
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  margin-top: 0.8rem;
  margin-bottom: 2.5rem;
  text-align: center;
`
type SelectPaymentMethodModalProps = {
  open: boolean
}
export type PaymentOptions = 'Wyre' | 'Moon pay'
type PaymentOption = {
  name: PaymentOptions
  modal: MODAL
  component: (...a: any) => JSX.Element
}

// TODO: Enable Moonpay when we have prod credentials
const SelectPaymentMethodModal = ({ open }: SelectPaymentMethodModalProps) => {
  const select = (modal: MODAL) => GlobalModal.active(modal)
  const format = (o: PaymentOptions) =>
    BUY_TOKENS.BY_PROVIDER.replace('%%', getBlockchain()).replace('%PRV%', o)
  const paymentOptions: PaymentOption[] = [
    {
      name: 'Wyre',
      modal: MODAL.WYRE_MODAL,
      component: () => <WyreLogo />,
    },
    // {
    //   name: 'Moon pay',
    //   modal: MODAL.MOONPAY_MODAL,
    //   component: () => <MoonPayLogo />,
    // },
  ]

  return (
    <ModalComponent
      modalTitle={t`Payment method`}
      open={open}
      onClose={clearGlobalModal}
    >
      <Container>
        <DescLabel>{ASSURANCE.SECURE_TXNS}</DescLabel>
        {paymentOptions.map((paymentOption) => (
          <BuyAlgoButton
            key={String(paymentOption.name)}
            onClick={() => select(paymentOption.modal)}
          >
            {paymentOption.component()}
            <span>{format(paymentOption.name)}</span>
          </BuyAlgoButton>
        ))}
      </Container>
    </ModalComponent>
  )
}

export default SelectPaymentMethodModal
