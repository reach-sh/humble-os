import { useEffect, useState } from 'react'
import { Form, Input, Label } from 'components/Common/Form'
import styled from 'styled-components'
import { COLORS } from 'theme'
import { ExLinkWithIcon } from 'components/Common/ExternalLink'
import { getProviderOverride, ProviderConfigOverride } from './utils'

const Container = styled(Form).attrs({ className: 'slide-down-fade-in' })`
  animation-duration: 250ms;
`
const FormInput = styled(Input)`
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  min-height: 2.4rem;
  padding: 0.6rem 0.4rem;
  width: 100%;
`
const FormLabel = styled(Label)`
  align-items: flex-start;
  flex-direction: column;
  margin-top: 0.9rem;

  &:last-of-type {
    margin-bottom: 1.8rem;
  }

  > span {
    line-height: 2.2rem;
    font-size: 14px;
  }
`
const Required = styled.span`
  color: ${COLORS.errorRed};
  content: '*';
`
type EventHandler = {
  (e: { stopPropagation: any; preventDefault: any }): any
}
type Props = {
  provider: string
  onChange?: (data: ProviderConfigOverride) => any
  onSubmit?: (data: ProviderConfigOverride) => any
}

function Component({
  provider,
  onSubmit = () => null,
  onChange = () => null,
}: Props) {
  const name = provider === 'PURESTAKE' ? 'PureStake' : 'Server'
  const { settings = {}, provider: storedProv } = getProviderOverride()
  const [serverToken, setServerToken] = useState('')
  const [serverUrl, setServer] = useState('')
  const [indexerToken, setIndexerToken] = useState('')
  const [indexerUrl, setIndexer] = useState('')
  const submitCapture: EventHandler = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    submit()
  }
  const extractValue = (e: any) => {
    e.preventDefault()
    const [val, copied] = [e.target?.value, e.clipboardData?.getData('text')]
    return val || copied
  }
  const updateServerToken = (e: any) => {
    const newServerToken = extractValue(e)
    setServerToken(newServerToken)
    onChange(formData({ ALGO_TOKEN: newServerToken }))
  }
  const updateServer = (e: any) => {
    const newServerUrl = extractValue(e)
    setServer(newServerUrl)
    onChange(formData({ ALGO_SERVER: newServerUrl }))
  }
  const updateIndexerToken = (e: any) => {
    const newIndexerToken = extractValue(e)
    setIndexerToken(newIndexerToken)
    onChange(formData({ ALGO_INDEXER_TOKEN: newIndexerToken }))
  }
  const updateIndexer = (e: any) => {
    const newIndexerUrl = extractValue(e)
    setIndexer(newIndexerUrl)
    onChange(formData({ ALGO_INDEXER_SERVER: newIndexerUrl }))
  }
  const clearInputs = () => {
    setServerToken('')
    setServer('')
    setIndexerToken('')
    setIndexer('')
  }
  const loadInputs = () => {
    setServerToken(settings.ALGO_TOKEN)
    setServer(settings.ALGO_SERVER)
    setIndexerToken(settings.ALGO_INDEXER_TOKEN)
    setIndexer(settings.ALGO_INDEXER_SERVER)
  }
  const formData = (updates: any = {}) => ({
    ALGO_INDEXER_SERVER: indexerUrl,
    ALGO_INDEXER_TOKEN: indexerToken,
    ALGO_SERVER: serverUrl,
    ALGO_TOKEN: serverToken,
    ...updates,
  })
  const submit = () => {
    if (!indexerUrl || !serverUrl) return
    onSubmit(formData())
  }

  useEffect(() => {
    if (!storedProv || storedProv !== provider) clearInputs()
    else if (settings) loadInputs()
  }, [provider])

  return (
    <Container onSubmit={submitCapture}>
      <FormLabel>
        <span>{name} API Token</span>
        <FormInput
          placeholder='Example: 38954nNHldtgv8034thRCPeio43mfmdwe560'
          onChange={updateServerToken}
          value={serverToken || ''}
        />
      </FormLabel>

      <FormLabel>
        <span>
          {name} Server URL<Required>*</Required>
        </span>
        <FormInput
          placeholder='https://'
          type='url'
          onChange={updateServer}
          value={serverUrl || ''}
        />
      </FormLabel>

      <FormLabel>
        <span>Indexer API Token</span>
        <FormInput
          placeholder='Example: 38954nNHldtgv8034thRCPeio43mfmdwe560'
          onChange={updateIndexerToken}
          value={indexerToken || ''}
        />
      </FormLabel>

      <FormLabel>
        <span>
          Indexer URL<Required>*</Required>
        </span>
        <FormInput
          placeholder='https://'
          type='url'
          onChange={updateIndexer}
          value={indexerUrl || ''}
        />
      </FormLabel>

      {provider === 'PURESTAKE' ? (
        <ExLinkWithIcon href='https://www.purestake.com/technology/algorand-api/'>
          Get PureStake subscription
        </ExLinkWithIcon>
      ) : (
        <ExLinkWithIcon href='https://developer.algorand.org/docs/run-a-node/setup/install/'>
          How to run your own Algorand node&nbsp;and indexer{' '}
        </ExLinkWithIcon>
      )}
    </Container>
  )
}

const CustomNodeForm = styled(Component)``
export default CustomNodeForm
