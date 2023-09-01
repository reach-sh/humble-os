import { MODAL, GlobalModal } from 'state/reducers/modals'
import styled from 'styled-components'
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import { GridContainer } from 'components/Common/FlexContainer'
import { getCurrentNetwork } from 'helpers/getReach'
import { NETWORKS } from 'constants/reach_constants'
import { getStoredProviderOpt } from './utils'

const Container = styled.aside`
  border: 1px solid;
  border-radius: 24px;
  padding: 0.4rem 1rem;
  margin-top: 1rem;
`
const Description = styled.p`
  color: ${COLORS.midGray};
  font-size: smaller;
  line-height: 0.8rem;
  text-overflow: ellipsis;
`
const EditButton = styled(Button).attrs({ variant: 'link' })`
  color: ${COLORS.darkSage};
  font-size: 14px;
  font-weight: bold;
`
const Selected = styled(GridContainer)<{ condensed?: boolean }>`
  grid-template-columns: ${({ condensed = false }) =>
    condensed ? '100%' : 'auto 120px'};
  padding: 0.4rem 0;

  &.condensed ${EditButton} {
    max-width: 100%;
    place-content: flex-end;
    width: 100%;
  }
`
const Title = styled.h6`
  font-size: 14px;
  line-height: 2rem;
`

type Props = { condensed?: boolean }

function Component({ condensed = false }: Props) {
  const selectedClass = condensed ? 'condensed' : undefined
  const connector = getCurrentNetwork()
  const selected = getStoredProviderOpt()
  const onProviderEdit = () => {
    GlobalModal.active(MODAL.NETWORK_PROVIDER)
  }

  if (connector !== NETWORKS.ALGO.abbr) return <></>

  return (
    <Container>
      <Title>Network Provider</Title>

      <Selected className={selectedClass} condensed={condensed}>
        <div>
          <b>{selected?.title}</b>
          <Description>{selected?.description}</Description>
        </div>

        <EditButton onClick={onProviderEdit}>Edit (Advanced)</EditButton>
      </Selected>
    </Container>
  )
}

const NetworkProviderView = styled(Component)``
export default NetworkProviderView
