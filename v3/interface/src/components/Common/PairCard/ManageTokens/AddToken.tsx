import styled from 'styled-components'
import { useState } from 'react'
import useToast from 'hooks/useToast'
import { Token } from 'types/shared'
import { useReach } from 'helpers/getReach'
import { t } from '@lingui/macro'
import { WideButton } from 'components/Common/Button'
import { formatCurrency, formatTokenMetadata, parseAddress } from 'reach/utils'
import cacheReducer from 'state/cacheReducer'
import { captureException } from 'helpers/error'
import useGlobalUser from 'hooks/useGlobalUser'

const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const TokenInput = styled.input`
  border-bottom: 1px solid lightgray;
  padding: 0.25rem 0.5rem;
  margin: 0.75rem 0;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  &:focus {
    outline: none;
  }
`
const ErrorMessage = styled.p`
  text-align: center;
  animation: shake 300ms ease-out;
  color: ${({ theme }) => theme.colors.error};
`

const SearchToken = ({ customTokenList }: { customTokenList: Token[] }) => {
  const { launchToast } = useToast()
  const reach = useReach()
  const { reachAccount } = useGlobalUser(['reachAccount'])
  if (!reachAccount) return null

  const [newTokenId, setNewTokenId] = useState('')
  const [errorMessage, setError] = useState('')
  const [isAdding, setAdding] = useState(false)

  const handleIdChange = (e: any) => {
    const { value: updateTokenId } = e.target
    if (errorMessage) setError('')
    setNewTokenId(updateTokenId)
  }

  const resetTokenForm = () => setNewTokenId('')

  const handleAddToken = async () => {
    setError('')
    const tokId = parseAddress(newTokenId)
    const exists = customTokenList.findIndex((ct) => ct.id === tokId) > -1

    if (exists) {
      setError(t`Token Already Added`)
      return
    }

    try {
      setAdding(true)

      const [meta, bal] = await Promise.all([
        reachAccount.tokenMetadata(tokId),
        reach.balanceOf(reachAccount, tokId),
      ])

      const newToken = formatTokenMetadata(tokId, meta)
      const decimals = reach.bigNumberToNumber(meta.decimals)
      newToken.decimals = decimals
      newToken.balance = formatCurrency(bal, decimals)
      newToken.custom = true
      cacheReducer.tokens.update(newToken)
      launchToast('success', { message: t`Token Added!` })
      resetTokenForm()
    } catch (error) {
      captureException(error, 'SearchToken.HandleAddToken')
      setError(t`Token not found`)
    } finally {
      setAdding(false)
    }
  }

  const getAddButtonText = () => {
    if (isAdding) return t`Adding...`
    if (!newTokenId) return t`Please enter a valid token id`
    return t`Add Token`
  }

  return (
    <FormWrapper>
      <TokenInput
        value={newTokenId}
        required
        name='id'
        placeholder={t`Token ID`}
        onChange={handleIdChange}
      />

      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      <WideButton disabled={isAdding || !newTokenId} onClick={handleAddToken}>
        {getAddButtonText()}
      </WideButton>
    </FormWrapper>
  )
}

export default SearchToken
