import { useEffect, useState } from 'react'
import { DataFlags, LoadingFlags } from 'state/reducers/loading-flags'

type LFInstance = ReturnType<typeof LoadingFlags.getState>
const defaultKeys: (keyof DataFlags)[] = ['fetchRequest', 'farms', 'pools']

/**
 * Reusable lifecycle hook for global loading state. Allow components
 * to susbscribe to only the state updates they care about.
 */
export default function useGlobalLoadingFlags(keys = defaultKeys) {
  const flgs = LoadingFlags.getState()
  const [internal, setInternal] = useState(
    keys.reduce((acc, k) => ({ ...acc, [k]: flgs[k] }), {} as LFInstance),
  )

  // Set connected status and account
  useEffect(() =>
    LoadingFlags.subscribeToKeys((updates) => {
      setInternal((old) => ({ ...old, ...updates }))
    }, keys),
  )

  // UI can just check for and use these properties
  return internal
}
