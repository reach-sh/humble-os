import { clearUser } from 'state/reducers/user'
import { clearPersistedUserAccount } from 'helpers/getReach'
import GlobalModal, { MODAL } from 'state/reducers/modals'
import { t, Trans } from '@lingui/macro'
import WarningModal from 'components/Modals/WarningModal'
import { VERSION } from 'constants/reach_constants'

export default function ClearLocalDataModal({ open }: { open: boolean }) {
  const clearLocalData = () => {
    clearPersistedUserAccount()
    localStorage.removeItem(VERSION)
    GlobalModal.active(MODAL.NONE)
    clearUser()
  }

  return (
    <WarningModal
      open={open}
      onClose={() => GlobalModal.active(MODAL.NONE)}
      onConfirm={clearLocalData}
      title={t`Clear Local Data`}
      cancellationText={t`Cancel`}
    >
      <Trans>
        This will disconnect your session and clear all locally-cached data. You
        can reconnect your wallet after the window reloads.
      </Trans>
    </WarningModal>
  )
}
