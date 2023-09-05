import { useEffect, useState } from 'react'
import { blockConstants } from '@reach-sh/humble-sdk'
import { GlobalBlocktime, GlobalUser, initBlockTimeRefresh } from 'state/store'

const blockDuration = blockConstants().BLOCK_LENGTH * 1000

/** Subscribe to global process that fetches latest block */
export default function useBlockTime() {
  const { reachAccount } = GlobalUser.getState()
  const { algorand: algoBlocktime } = GlobalBlocktime.getState()
  const [connected, setConnected] = useState(reachAccount !== null)
  const [{ blockTime }, setLocalState] = useState({
    blockTime: algoBlocktime,
  })

  useEffect(() => {
    if (algoBlocktime === 0 && connected) initBlockTimeRefresh()

    const unsubTime = GlobalBlocktime.subscribeToKeys(
      ({ algorand }) => algorand && setLocalState({ blockTime: algorand }),
      ['algorand'],
    )
    const unsubUser = GlobalUser.subscribeToKeys(
      ({ reachAccount: acc }) => setConnected(acc !== null),
      ['reachAccount'],
    )

    return () => {
      unsubTime()
      unsubUser()
    }
  })

  return { blockTime, blockDuration }
}
