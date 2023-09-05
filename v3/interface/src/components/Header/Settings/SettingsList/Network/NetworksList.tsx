import styled from 'styled-components'
import useBlur from 'hooks/useBlur'
import { NetworkListItem } from 'types/shared'

type NetworksListProps = {
  closeDrawer: () => void
  networks: NetworkListItem[]
  onSelectNetwork(nt: NetworkListItem): void
  parentRef: any
}

const ListContainer = styled.div`
  color: #333;
`

const NetworkItem = styled.div`
  cursor: pointer;
  padding: 8px 10px;
  transition: background 0.2s;
  border-radius: 4px;
  &:hover {
    background: #ededed;
  }
`

const DisabledNetwork = styled(NetworkItem)`
  cursor: not-allowed;
  color: lightgray;
`

const NetworksList = (props: NetworksListProps) => {
  const { parentRef, networks, closeDrawer, onSelectNetwork } = props

  useBlur(parentRef, closeDrawer)

  return (
    <ListContainer>
      {networks.map((nw) =>
        nw.abbr === 'ALGO' ? (
          <NetworkItem key={nw.abbr} onClick={() => onSelectNetwork(nw)}>
            {/* <CryptoIcon symbol={nw.abbr} color /> */}
          </NetworkItem>
        ) : (
          <DisabledNetwork key={nw.abbr}>
            {/* <CryptoIcon symbol={nw.abbr} color={false} /> */}
          </DisabledNetwork>
        ),
      )}
    </ListContainer>
  )
}

export default NetworksList
