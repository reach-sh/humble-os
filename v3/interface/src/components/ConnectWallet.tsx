import { useEffect } from 'react'
import { t, Trans } from '@lingui/macro'
// redux actions
import { useLocation } from 'react-router-dom'
import { createReachAPI } from '@reach-sh/humble-sdk'
import { GlobalModal, MODAL, clearGlobalModal } from 'state/reducers/modals'
import { GlobalUser } from 'state/reducers/user'
// notification
import useToast from 'hooks/useToast'
import {
  clearPersistedUserAccount,
  persistUserAccount,
  use,
} from 'helpers/getReach'
import { ReachAccount } from 'types/shared'
import Button from 'components/Common/Button'
import { ButtonProps } from 'components/Common/Button.props'
import styled from 'styled-components'
import { cacheUsersAssets, initTokens } from 'cache'
import { initializePricing } from 'prices'
import attachPoolListener from 'reach/listeners/poolListener'
import { INFLIGHT_MAX } from 'constants/reach_constants'
import Lock from 'helpers/lock'
import { sendGoogleTagEvent } from 'helpers/googleAnalytics'
import { captureException } from 'helpers/error'
import { getNDFAddress, loadAPIData } from 'utils/getServerResource'
import attachLimitOrdersListener from 'reach/listeners/limitOrderListener'
import useGlobalModal from 'hooks/useGlobalModal'
import { useWallet } from '@txnlab/use-wallet'
import DoubleCheck from './Modals/DoubleCheckModal'
import SelectProvider from './SelectProvider'

const ConnectButton = styled(Button)<ButtonProps>`
  box-shadow: none;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  font-size: 14.5px;
  font-weight: 200;
  padding: 8px 7px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.2s;
  min-width: initial;
  &:hover {
    background: ${({ theme }) => theme.colors.buttonHover};
    color: ${({ theme }) => theme.colors.textHover};
  }
`

/** Component for connecting user to account */
const ConnectWallet = () => {
  const { activeAccount } = useWallet()
  const RUNNING_TESTS = process.env.REACT_APP_RUNNING_TESTS
  const TEST_ACCOUNT_PHRASE = process.env
    .REACT_APP_TEST_ACCOUNT_PHRASE as string
  const autoClose30s = { autoClose: 30000 }
  const { launchToast } = useToast()
  const { modal } = useGlobalModal()
  let closeBtn: Element | undefined
  const clearUser = () => clearPersistedUserAccount()
  const inFlightStack: string[] = []
  const reqLock = new Lock()

  const observer = new MutationObserver(() => {
    if (closeBtn !== undefined) return
    const closeBtns = document.getElementsByClassName(
      'walletconnect-modal__close__wrapper',
    )
    if (closeBtns.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      closeBtn = closeBtns[0]
      closeBtns[0].addEventListener('click', clearUser, true)
    }
  })

  observer.observe(document, { childList: true, subtree: true })

  const processRequests = async (eventName: string) => {
    if (eventName === 'before') {
      if (inFlightStack.length >= INFLIGHT_MAX) {
        await reqLock.acquire()
        await new Promise((resolve) => {
          setTimeout(() => {
            processRequests(eventName)
            resolve('')
          }, 1000)
        })
      } else {
        inFlightStack.push(eventName)
      }
    }
    if (eventName === 'success' || eventName === 'error') {
      inFlightStack.pop()
      reqLock.release()
    }
  }

  const onAccountConnected = async (acc: ReachAccount) => {
    try {
      const reach = createReachAPI()
      const address = reach.formatAddress(acc.getAddress())
      reach.setCustomHttpEventHandler(async (e: any) => {
        await processRequests(e.eventName)
      })
      const nfd = await getNDFAddress(address)
      GlobalUser.multiple({
        reachAccount: acc,
        walletAddress: address,
        nfdWalletAddress: nfd,
      })
      persistUserAccount(acc)
      if (RUNNING_TESTS !== 'true') initTokens()
      //
      const { fetchError } = await loadAPIData()
      cacheUsersAssets(acc, true)
      // Get all blockchain pools if API is down; else, get only new ones
      attachPoolListener(acc, !fetchError)
      attachLimitOrdersListener(acc, !fetchError)
      initializePricing()
      GlobalUser.connecting(false)
    } catch (e) {
      captureException(e, 'Login')
      const m = t`There was an error while connecting you. If it persists, please contact support.`
      launchToast('reject', { message: m }, undefined, autoClose30s)
    }
  }

  const { search } = useLocation()

  const connectAccount = async () => {
    const reach = createReachAPI()
    const wallet = JSON.parse(localStorage.getItem('txnlab-use-wallet') || '{}')
    try {
      const defaultAccount =
        RUNNING_TESTS === 'true'
          ? await reach.newAccountFromMnemonic(TEST_ACCOUNT_PHRASE)
          : await reach.connectAccount({
              addr: wallet?.state?.activeAccount?.address ?? '',
            })

      sendGoogleTagEvent('USER_CONNECT', defaultAccount, search)
      onAccountConnected(defaultAccount)
    } catch (e: any) {
      if (e.toString().includes('Can not open popup window')) {
        GlobalModal.active(MODAL.POPUP_BLOCKED)
        GlobalUser.multiple({ connecting: false })
      } else clearUser()
    }
  }
  const reconnectAccount = async (providerId: string, acc: any) => {
    use(providerId)
    const reach = createReachAPI()
    const account = await (RUNNING_TESTS === 'true'
      ? reach.newAccountFromMnemonic(TEST_ACCOUNT_PHRASE)
      : reach.connectAccount(acc))
    sendGoogleTagEvent('USER_RECONNECT', account, search)
    onAccountConnected(account)
  }

  const cancel = () => {
    clearGlobalModal()
    window.location.reload()
  }

  useEffect(() => {
    if (!activeAccount) return
    reconnectAccount(activeAccount.providerId, { addr: activeAccount.address })
  }, [activeAccount])

  const onConnectButtonClick = () => {
    sendGoogleTagEvent('CONNECT_WALLET-From_Header', null, search)
    GlobalModal.active(MODAL.DOUBLE_CHECK)
  }

  return (
    <>
      <ConnectButton
        onClick={onConnectButtonClick}
        icon='power_settings_new'
        data-testid='connect'
      >
        <Trans>Connect</Trans>
      </ConnectButton>
      <SelectProvider
        open={modal === MODAL.CONNECT_WALLET}
        onCancel={cancel}
        onConnect={connectAccount}
      />
      <DoubleCheck
        open={modal === MODAL.DOUBLE_CHECK}
        onConfirm={() => {
          GlobalModal.active(MODAL.CONNECT_WALLET)
        }}
        onClose={cancel}
      />
    </>
  )
}

export default ConnectWallet
