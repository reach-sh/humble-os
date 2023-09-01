import styled from 'styled-components'
import { useCallback, useMemo } from 'react'
import useToast from 'hooks/useToast'
import AssetItem from 'components/Common/AssetItem'
import { Token } from 'types/shared'
import useGlobalDex from 'hooks/useGlobalDex'
import { t, Trans } from '@lingui/macro'
import RotateIconButton from 'components/Common/RotateIconButton'
import closeIcon from 'assets/Icons/Close.svg'
import deleteIcon from 'assets/Icons/delete.svg'
import { useTheme } from 'contexts/theme'
import cacheReducer from 'state/cacheReducer'
import { GlobalUser } from 'state/reducers/user'
import AddToken from './AddToken'

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: ${({ theme }) => `1px solid ${theme.colors.border}`};
  border-top: none;
  z-index: 11;
  width: 100%;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: ${({ theme }) => `${theme.colors.shadow}`};
  padding: 1rem;
`
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const HeaderText = styled.p``

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const TokenListContainer = styled.div`
  margin-top: 1rem;
  max-height: 35rem;
  overflow: auto;
`

const CustomAssetContainer = styled.div`
  position: relative;
`
const DeleteContainer = styled.div`
  position: absolute;
  top: 1.2rem;
  right: 0;
`
const CenteredText = styled.p`
  text-align: center;
`

const ManageTokens = ({
  close,
  selectAsset,
}: {
  close: () => void
  selectAsset: (asset: Token) => void
}) => {
  const { theme } = useTheme()
  const { launchToast } = useToast()
  const { tokenList } = useGlobalDex(['tokenList'])
  const { reachAccount } = GlobalUser.getState()
  const customTokenList = useMemo(
    () => tokenList.filter((tok) => tok.custom),
    [tokenList],
  )

  const deleteToken = useCallback(
    (index: number) => {
      const targetToken = customTokenList[index]
      cacheReducer.tokens.delete(targetToken.id.toString())
      launchToast('success', { message: t`Token Deleted` })
    },
    [customTokenList],
  )

  const handleTokenSelect = (token: Token) => {
    selectAsset(token)
    close()
  }

  return (
    <Container>
      <HeaderContainer>
        <HeaderText>
          <Trans> Manage Tokens </Trans>{' '}
        </HeaderText>
        <RotateIconButton
          customIcon={closeIcon}
          onClick={close}
          filter={
            theme === 'Dark' ? 'dark-sage-svg-filter' : 'light-mode-svg-filter'
          }
        />
      </HeaderContainer>
      {reachAccount ? (
        <FormContainer>
          <AddToken customTokenList={customTokenList} />
          <TokenListContainer>
            {customTokenList.length === 0 ? (
              <CenteredText>
                <Trans> No Tokens Added</Trans>
              </CenteredText>
            ) : (
              customTokenList.map((token, index) => {
                const handleDelete = () => deleteToken(index)
                return (
                  <CustomAssetContainer key={token.symbol + index}>
                    <AssetItem
                      name={token.name}
                      symbol={token.symbol}
                      showBalance={false}
                      onClick={() => handleTokenSelect(token)}
                    />
                    <DeleteContainer>
                      <RotateIconButton
                        customIcon={deleteIcon}
                        onClick={handleDelete}
                      />
                    </DeleteContainer>
                  </CustomAssetContainer>
                )
              })
            )}
          </TokenListContainer>
        </FormContainer>
      ) : (
        <CenteredText>
          <Trans> Please Connect to Manage Tokens</Trans>
        </CenteredText>
      )}
    </Container>
  )
}

export default ManageTokens
