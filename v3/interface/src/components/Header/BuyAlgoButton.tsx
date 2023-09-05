import styled from 'styled-components'
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import { GlobalUser } from 'state/reducers/user'
import GlobalModal, { MODAL } from 'state/reducers/modals'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { useLocation } from 'react-router-dom'
import { BUY_TOKENS } from 'constants/messages'
import { getBlockchain } from '@reach-sh/humble-sdk'

const OpenModalButton = styled(Button)`
  background: ${COLORS.black};
  color: ${COLORS.white};
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 1px;
  padding: ${({ theme }) => `${theme.sizes.xs} ${theme.sizes.xxlg}`};
  width: 100%;
  .content {
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

type BuyAlgoButtonProps = {
  onClick?: () => void
}

/**
 * Button for triggering Buy Algo popup (purchase Crypto with fiat funds)
 */
const BuyAlgoButton = styled((props: BuyAlgoButtonProps) => {
  const { search } = useLocation()
  const { onClick = () => null } = props

  const openModal = () => {
    const { reachAccount } = GlobalUser.getState()
    sendGoogleTagEvent('BUYALGO-Launch_Modal', reachAccount, search)
    GlobalModal.active(MODAL.SELECT_PAYMENT_MODAL)
    onClick()
  }

  return (
    <OpenModalButton className='sendwyre' onClick={openModal}>
      {BUY_TOKENS.DEFAULT.replace('%%', getBlockchain())}
    </OpenModalButton>
  )
})``

export default BuyAlgoButton
