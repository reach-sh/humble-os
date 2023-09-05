import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { COLORS } from 'theme'
import Button from 'components/Common/Button'
import ListView from 'components/Common/ListView'
import ModalComponent from 'components/Modals/ModalComponent'
import { GlobalUser } from 'state/reducers/user'
import { algoExplorerEnv, algoNodeEnv } from 'helpers/getReach'
import CustomNodeForm from 'components/NetworkProvider/CustomNodeForm'
import {
  clearProviderOverride,
  ProviderConfigOverride,
  storeProviderOverride,
  ProviderOpt,
  Providers,
  ProviderOpts,
  getStoredProviderOpt,
} from 'components/NetworkProvider/utils'

const Container = styled.aside`
  border-radius: 24px;
  padding: 1rem 0;
  min-height: 300px;
  min-width: 300px;
  width: 100%;
`
const Description = styled.p`
  color: ${COLORS.midGray};
  font-size: 10px;
  text-overflow: ellipsis;
`
const SelectButton = styled(Button).attrs({ variant: 'link' })`
  border: 1px solid ${COLORS.sage};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text};
  display: grid;
  grid-template-columns: auto 16px;
  justify-content: space-between;
  height: 46px;
  padding: 1rem 0.6rem;
  width: 100%;

  .content {
    display: block;
    text-align: left;
  }
  .material-icons {
    font-size: 1.3rem;
    margin-top: -0.6rem;
  }
`
const ListItem = styled(SelectButton)`
  border: 0;
  border-radius: 0;
  padding: 0.4rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.popoverBg};
  }
`
const Label = styled.h5`
  font-size: 16px;
  line-height: 2rem;
`
const Options = styled(ListView)`
  animation: slide-down-fade-in 400ms ease-out;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${COLORS.sage};
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  border-top: 0;
  position: absolute;
  width: 100%;
  z-index: 99;
`
const Placeholder = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 100%;
  min-height: 180px;
  place-content: flex-end;
`
const Title = styled.h6`
  font-size: 14px;
`

const { NONE, ALGONODE, ALGOEXPLORER, CUSTOM, HUMBLESWAP, PURESTAKE } =
  Providers
type Props = { open: boolean; onClose(): any }

function Component({ open, onClose }: Props) {
  const [selecting, showOptions] = useState(false)
  const [selected, setProvider] = useState<ProviderOpt>(getStoredProviderOpt())
  const [override, setOverride] = useState<ProviderConfigOverride>()
  const toggleSelecting = () => showOptions(!selecting)
  const closeAndExit = (didChange = false) => {
    const { reachAccount } = GlobalUser.getState()
    if (selecting) showOptions(false)
    // Reload window + stdlib if user is in state and settings changed
    if (reachAccount && didChange) return window.location.reload()
    // Else, reset modal UI before closing
    setProvider(getStoredProviderOpt())
    return onClose()
  }
  const select = (prov: ProviderOpt) => {
    setProvider(prov)
    showOptions(false)

    switch (prov.title) {
      case ALGOEXPLORER:
        setOverride(algoExplorerEnv())
        break

      case ALGONODE:
        setOverride(algoNodeEnv())
        break

      case NONE:
      case HUMBLESWAP:
        setOverride(undefined)
        break

      default:
        break
    }
  }
  const saveAndExit = () => {
    if ([NONE, HUMBLESWAP].includes(selected.title)) clearProviderOverride()
    else storeProviderOverride(selected.key, override)
    closeAndExit(true)
  }

  useEffect(() => {
    setProvider(getStoredProviderOpt())
  }, [])

  return (
    <ModalComponent
      open={open}
      onClose={closeAndExit}
      onConfirm={saveAndExit}
      modalTitle='Select network provider'
      width={420}
    >
      <Container>
        <Label>Network Provider</Label>

        {/* Selected option */}
        {selected && (
          <SelectButton rightIcon='expand_more' onClick={toggleSelecting}>
            <Title>{selected.title}</Title>
            <Description>{selected.description}</Description>
          </SelectButton>
        )}

        {/* Options */}
        {selecting && (
          <Options
            data={ProviderOpts}
            itemText={(provider: ProviderOpt) => (
              <ListItem onClick={() => select(provider)}>
                <Title>{provider.title}</Title>
                <Description>{provider.description}</Description>
              </ListItem>
            )}
          />
        )}

        {/* Save/exit (when non-configurable provider is selected) */}
        {[NONE, HUMBLESWAP].includes(selected?.title) && <Placeholder />}

        {/* PureStake and/or custom configuration */}
        {[PURESTAKE, CUSTOM].includes(selected?.title) && (
          <CustomNodeForm provider={selected?.key} onChange={setOverride} />
        )}
      </Container>
    </ModalComponent>
  )
}

const NetworkProviderModal = styled(Component)``
export default NetworkProviderModal
