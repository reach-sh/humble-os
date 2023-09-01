import { useEffect, useState } from 'react'
import { GlobalUser, UserInstance, UserKeys } from 'state/reducers/user'

type UserInstancePlus = UserInstance & { connected: boolean }
const defaultKeys: UserKeys[] = [
  'connecting',
  'nfdWalletAddress',
  'liquidityPools',
  'reachAccount',
  'slippageTolerance',
  'walletAddress',
]

/**
 * Reusable lifecycle hook for getting user tingz from state. Allow components
 * to susbscribe to only the state updates they care about.
 */
export default function useGlobalUser(keys = defaultKeys) {
  const user = GlobalUser.getState()
  const [connected, setConnected] = useState(Boolean(user.walletAddress))
  const [internal, setInternal] = useState(
    keys.reduce((acc, k) => ({ ...acc, [k]: user[k] }), {} as UserInstancePlus),
  )

  // Set connected status and account
  useEffect(() =>
    GlobalUser.subscribeToKeys((userUpdates) => {
      setConnected(Boolean(user.walletAddress))
      setInternal((old) => ({ ...old, ...userUpdates }))
    }, keys),
  )

  // UI can just check for and use these properties
  return { ...internal, connected }
}
