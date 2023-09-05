import { clearUser } from 'state/reducers/user'
import styled from 'styled-components'
import { clearPersistedUserAccount } from 'helpers/getReach'
import { WideButton } from 'components/Common/Button'
import { COLORS } from 'theme'
import GlobalModal, { MODAL } from 'state/reducers/modals'
import { Trans } from '@lingui/macro'
import { useWallet } from '@txnlab/use-wallet'
import { useCallback } from 'react'

const Container = styled.div`
  margin-top: 1rem;
  text-align: center;
  width: 100%;
`

const DisconnectButton = styled(WideButton)`
  font-size: 16px;
  font-weight: bold;
  height: 40px;
`
const ClearDataButton = styled(WideButton).attrs({ variant: 'link' })`
  color: ${COLORS.errorRed};
  font-size: 10px;
  font-weight: bold;
  height: 32px;
  margin-top: 0.4rem;
`

const Disconnect = () => {
  const { providers, activeAccount } = useWallet()

  const warnClearData = () => GlobalModal.active(MODAL.CONFIRM_CLEAR_DATA)
  const clearUserState = useCallback(() => {
    if (!providers || !activeAccount) return
    providers
      .find((el) => el.metadata.id === activeAccount.providerId)
      ?.disconnect()
      ?.then(() => {
        clearPersistedUserAccount()
        clearUser()
      })
  }, [providers, activeAccount])

  return (
    <>
      <Container>
        <DisconnectButton
          variant='accent'
          className='trigger'
          onClick={clearUserState}
        >
          <Trans>Disconnect</Trans>
        </DisconnectButton>

        <ClearDataButton
          variant='accent'
          className='trigger'
          onClick={warnClearData}
        >
          <Trans>Clear Local Data</Trans>
        </ClearDataButton>
      </Container>
    </>
  )
}

export default Disconnect
