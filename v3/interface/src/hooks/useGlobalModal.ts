import { ListenerFn } from '@jackcom/raphsducks/lib/types'
import { useEffect, useState } from 'react'
import GlobalModal, { ModalInstance } from 'state/reducers/modals'

/** Global Application Modal state subscriber */
export default function useGlobalModal() {
  const { active: current } = GlobalModal.getState()
  const [modal, setModal] = useState(current)
  const onModal: ListenerFn<Partial<ModalInstance>> = ({ active }) => {
    if (active !== undefined) setModal(active)
  }

  useEffect(() => GlobalModal.subscribeToKeys(onModal, ['active']), [])

  return { modal }
}
