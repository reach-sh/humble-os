import { useReach } from 'helpers/getReach'
import { ReachAccount } from 'types/shared'
import { numberify } from 'reach/utils'
import {
  MIN_TRANSACTION_FEES,
  NETWORK_TOKEN_DEFAULT_ID,
  WALLETCONNECT_STORAGE_KEY,
} from 'constants/reach_constants'
import { isMobile } from 'react-device-detect'
import { lsGetJSON } from './localStorage'

export function shouldConfirmMobileWallet() {
  return lsGetJSON(WALLETCONNECT_STORAGE_KEY) !== null
}

export function maybeOpenWallet() {
  if (shouldConfirmMobileWallet() && isMobile)
    // Don't open wallet app for iOS
    window.location.href = 'algorand://'
}

export const getMinBalance = async (id: any, acct: ReachAccount) => {
  if (id !== NETWORK_TOKEN_DEFAULT_ID) return 0
  const reach = useReach()
  const { algodClient } = await reach.getProvider()
  const query = await algodClient
    .accountInformation(reach.formatAddress(acct))
    .exclude('all')
    .do()
    .catch(() => ({}))
  return numberify(query['min-balance']) + MIN_TRANSACTION_FEES
}
