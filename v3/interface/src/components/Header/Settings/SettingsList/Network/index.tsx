import React, { useState } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'
import {
  clearPersistedUserAccount,
  getAllNetworks,
  setCurrentNetwork,
  useReach,
} from 'helpers/getReach'
import { NETWORKS } from 'constants/reach_constants'
import { clearUser } from 'state/reducers/user'
import useBlur from 'hooks/useBlur'
import useToast from 'hooks/useToast'
import { NetworkListItem } from 'types/shared'
import { ListToggle } from 'components/Common/Button'
import NetworksList from './NetworksList'

const NetworkContainer = styled.div`
  margin: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 1rem;
  &.active .material-icons,
  &.active:hover .material-icons {
    animation: rotate90 300ms ease-out;
    animation-play-state: forwards;
    transform: rotate(90deg);
  }
`

const Network = () => {
  const reach = useReach()
  const [selected, setSelected] = useState(NETWORKS[reach?.connector || 'ALGO'])
  const [isViewingNetworks, setIsViewingNetworks] = useState(false)
  const { launchToast } = useToast()
  const networkRef = React.useRef(null)
  const className = isViewingNetworks ? 'active' : undefined
  const toggleNetworksView = () => setIsViewingNetworks(!isViewingNetworks)

  // Change user network in local storage, and disconnect current session
  const selectNetwork = (nt: NetworkListItem): void => {
    if (nt.name === selected.name) return
    clearPersistedUserAccount()
    setSelected(nt)
    setIsViewingNetworks(false)
    clearUser()
    setCurrentNetwork(nt.abbr)
    launchToast('network', { message: t`Network change detected!` })
    setTimeout(() => window.location.reload(), 500)
  }

  useBlur(networkRef, () => setIsViewingNetworks(false))

  return (
    <NetworkContainer className={className}>
      <ListToggle active={isViewingNetworks} onClick={toggleNetworksView}>
        Network
      </ListToggle>
      {isViewingNetworks && (
        <NetworksList
          networks={getAllNetworks()}
          closeDrawer={() => setIsViewingNetworks(false)}
          onSelectNetwork={selectNetwork}
          parentRef={networkRef}
        />
      )}
    </NetworkContainer>
  )
}

export default Network
