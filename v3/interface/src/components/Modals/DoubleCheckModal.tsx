import { t } from '@lingui/macro'
import styled from 'styled-components'
import { CURRENT_PROVIDER } from 'constants/reach_constants'
import WarningModal from './WarningModal'

const WarningMessage = styled.div`
  color: ${({ theme }) => theme.colors.walletWarningText};
  line-height: 1.25em;
  padding: 0 16px;
  z-index: 9999;
`
const CheckList = styled.ul`
  left: 1.5em;
  list-style-position: outside;
  list-style-type: circle;
  margin: 0;
  padding: 0 0 2.4rem;
  width: 88.5%;
`

type DoubleCheckModalProps = {
  open: boolean
  onConfirm: () => void
  onClose: () => void
}

export default ({ open, onConfirm, onClose }: DoubleCheckModalProps) => (
  <WarningModal
    {...{ open, onClose }}
    title={t`Before you begin`}
    onConfirm={onConfirm}
  >
    <WarningMessage>
      <p>Please double check your network and make sure:</p>

      <CheckList>
        <li>you are on {CURRENT_PROVIDER.toLowerCase()}</li>
        <li>
          you don&apos;t have any active Wallet Connect sessions to HumbleSwap
        </li>
      </CheckList>
    </WarningMessage>
  </WarningModal>
)
