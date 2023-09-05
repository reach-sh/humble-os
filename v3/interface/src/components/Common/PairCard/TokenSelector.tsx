import { useState, useEffect } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'
import { Token } from 'types/shared'
import { filterTokensByQuery } from 'helpers/pool'
import { tokenMetadata } from 'cache/shared'
import { GlobalUser } from 'state/reducers/user'
import ManageTokens from './ManageTokens'
import AssetItem from '../AssetItem'
import ModalComponent from '../../Modals/ModalComponent'
import { Form, Input } from '../Form'
import FlexContainer from '../FlexContainer'
import AssetItemList from './AssetItemList'
import Button from '../Button'

const AssetListContainer = styled.div`
  border-top: none;
  padding-bottom: ${({ theme }) => theme.sizes.sm};
  height: 55vh;
  margin: 0 -${({ theme }) => theme.sizes.sm};
  z-index: 999;
`

const AssetItemListWrapper = styled.div`
  overflow-y: auto;

  &::-webkit-scrollbar-track {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.colors.slideBackground};
  }
  &::-webkit-scrollbar {
    width: 7.54px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: ${({ theme }) => theme.colors.slideColor};
  }
`

const CustomAssetItem = styled(AssetItem)`
  padding: 0 1.7rem;
`

const ClearSearchButton = styled(Button).attrs({
  icon: 'close',
  iconOnly: true,
  variant: 'link',
  type: 'button',
})`
  border: 1px solid;
  color: ${({ theme }) => theme.colors.accent};
  height: 1.2rem;
  min-width: initial;
  place-content: center;
  position: absolute;
  right: ${({ theme }) => `calc(1rem + ${theme.sizes.md})`};
  top: ${({ theme }) => `calc(0.5rem + ${theme.sizes.sm})`};
  width: 1.2rem;

  @media screen and (max-width: 600px) {
    right: ${({ theme }) => `calc(0.5rem + ${theme.sizes.sm})`};
  }

  .material-icons {
    margin: 0;
  }
`
const TokenSearchInput = styled(Input)`
  border-radius: ${({ theme }) => theme.sizes.xs};
  flex-grow: 1;
  height: ${({ theme }) => theme.sizes.xxlg};
  line-height: ${({ theme }) => theme.sizes.xxlg};
`
const TokenSearchForm = styled(Form)`
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  margin: 0 0 ${({ theme }) => theme.sizes.sm};
  max-width: 100%;
  padding: ${({ theme: tm }) => `${tm.sizes.sm} ${tm.sizes.sm} ${tm.sizes.md}`};
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 9;

  @media screen and (max-width: 600px) {
    padding-left: 0;
    padding-right: 0;
  }
`
const SearchNotification = styled(FlexContainer).attrs({
  className: 'spinner--before',
})`
  grid-column: 2;
  padding: ${({ theme }) => `${theme.sizes.md} 0`};
  padding-top: ${({ theme }) => theme.sizes.lg};
`

type TokenSelectorProps = {
  isSelecting: boolean
  selected?: Token
  tokenList: Token[]
  onTokenSelected?: (asset: Token) => void
  setSelecting: (selecting: boolean) => void
}

enum VIEWSTATE {
  IDLE = '0',
  MANAGE_TOKENS = 'Add a Token',
  SELECT_TOKEN = 'Select a Token',
}
enum SEARCHSTATE {
  IDLE = '0',
  SEARCHING = 'Searching for "%%" ...',
  SHOWING_RESULTS = 'Select a Token',
}

const TokenSelector = ({
  isSelecting,
  selected,
  tokenList,
  onTokenSelected = () => null,
  setSelecting,
}: TokenSelectorProps) => {
  const isSelected = ({ id }: Token) => id === selected?.id
  const [tokens, setTokens] = useState(tokenList)
  const [searchResults, setSearchResults] = useState<Token[]>([])
  const [view, setView] = useState<VIEWSTATE>(VIEWSTATE.IDLE)
  const [queryView, setQueryView] = useState<SEARCHSTATE>(SEARCHSTATE.IDLE)
  const [query, setQuery] = useState('')
  const removeSelected = (l: Token[]) => l.filter((tok) => !isSelected(tok))
  const exitToNextView = () => {
    const { SELECT_TOKEN, MANAGE_TOKENS, IDLE } = VIEWSTATE
    const next = view === MANAGE_TOKENS ? SELECT_TOKEN : IDLE
    setView(next)
    setSelecting(false)
    resetSearch()
  }
  const selectAsset = (asset: Token) => {
    exitToNextView()
    if (onTokenSelected) onTokenSelected(asset)
  }

  const resetSearch = (newTokenList?: Token[]) => {
    setQuery('')
    setSearchResults([])
    setQueryView(SEARCHSTATE.IDLE)
    setTokens(removeSelected(newTokenList || tokenList))
  }

  const searchForToken = async (tokId: string | number) => {
    // if no search term, or value is in tokens list, exit
    if (!tokId) return
    const localresults = filterTokensByQuery(`${tokId}`, tokenList)
    if (localresults.length > 0) {
      setQueryView(SEARCHSTATE.IDLE)
      setTokens(localresults)
      return
    }

    try {
      const { reachAccount } = GlobalUser.getState()
      const res = await Promise.all([tokenMetadata(tokId, reachAccount, false)])
      setQueryView(SEARCHSTATE.SHOWING_RESULTS)
      setSearchResults(res)
    } catch (error) {
      setQueryView(SEARCHSTATE.IDLE)
      setSearchResults([])
    }
  }

  const pasteAndSearch = async (e: any) => {
    // @ts-ignore
    const src = e.clipboardData || window.clipboardData
    const data = src.getData('text')
    resetSearch()
    setQueryView(SEARCHSTATE.SEARCHING)
    searchForToken(data)
  }

  const clearSearch = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    resetSearch()
  }

  const triggerSearch = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (!query) return
    setQueryView(SEARCHSTATE.SEARCHING)
    searchForToken(query)
  }

  const filterTokenList = (searchText: string) => {
    if (!searchText) resetSearch()
    else {
      setQuery(searchText)
      setTokens(filterTokensByQuery(searchText, tokenList))
    }
  }

  const emptyText = t`No token matches found`

  useEffect(() => {
    const { SELECT_TOKEN, IDLE } = VIEWSTATE
    if (isSelecting && view === IDLE) setView(SELECT_TOKEN)
    filterTokenList(query)
  }, [isSelecting, tokenList])

  return (
    <section>
      <ModalComponent
        open={view !== VIEWSTATE.IDLE}
        modalTitle={view}
        onClose={exitToNextView}
        width={Math.min(420, window.innerWidth)}
      >
        <>
          {view === VIEWSTATE.MANAGE_TOKENS && (
            <ManageTokens close={exitToNextView} selectAsset={selectAsset} />
          )}

          {view === VIEWSTATE.SELECT_TOKEN && (
            <AssetListContainer>
              {/* Search form */}
              <TokenSearchForm onSubmit={triggerSearch}>
                <TokenSearchInput
                  onPaste={pasteAndSearch}
                  onChange={({ target }) => filterTokenList(target.value)}
                  placeholder={t`Search by name, or paste address`}
                  value={query || ''}
                />
                {query && <ClearSearchButton onClick={clearSearch} />}
                <input hidden type='submit' />
              </TokenSearchForm>

              {queryView === SEARCHSTATE.SEARCHING && (
                <CustomAssetItem disabled>
                  <SearchNotification>
                    {queryView.valueOf().replaceAll('%%', query)}
                  </SearchNotification>
                </CustomAssetItem>
              )}

              {/* Tokens Search results */}
              <AssetItemList
                data={searchResults}
                onItemSelect={() => null}
                onAddCustom={(token) => {
                  const newTokenList = [...tokenList, token]
                  setTokens(newTokenList)
                  resetSearch(newTokenList)
                }}
                showBalance={false}
                selectedId={selected?.id}
              />

              {/* Tokens list */}
              <AssetItemListWrapper>
                <AssetItemList
                  data={tokens}
                  onItemSelect={selectAsset}
                  selectedId={selected?.id}
                />
              </AssetItemListWrapper>

              {/* Empty tokens view */}
              {!searchResults.length && !tokens.length && (
                <p style={{ textAlign: 'center' }}>{emptyText}</p>
              )}
            </AssetListContainer>
          )}
        </>
      </ModalComponent>
    </section>
  )
}

export default TokenSelector
