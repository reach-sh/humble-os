import { ListenerFn } from '@jackcom/raphsducks/lib/types'
import { useEffect, useState } from 'react'
import GlobalProgressBar, { ProgressBarData } from 'state/reducers/progress-bar'

export default function useGlobalProgress() {
  const initial = GlobalProgressBar.getState()
  const [internal, setInternal] = useState(initial)
  const onProgress: ListenerFn<Partial<ProgressBarData>> = (u) => {
    setInternal((old) => ({ ...old, ...u }))
  }

  useEffect(() => GlobalProgressBar.subscribe(onProgress))

  return internal
}
