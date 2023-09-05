/* eslint-disable consistent-return */
import { useState, useEffect, useMemo, ChangeEvent } from 'react'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import { TokenVerificationTier } from '@reach-sh/humble-sdk'
import sortBy from 'lodash.sortby'
import { COLORS } from 'theme'
import useGlobalDex from 'hooks/useGlobalDex'
import { Pool, Token } from 'types/shared'
import { filterPoolsByQuery } from 'helpers/pool'
import { arrayToObject } from 'utils/input'
import { getPoolTVLSort } from 'prices'
import { reloadPool } from 'reach/utils'
import useIsMounted from 'hooks/useIsMounted'
import useToast from 'hooks/useToast'
import useGlobalUser from 'hooks/useGlobalUser'
import { useIsMobile } from 'hooks/useScreenSize'
import Pagination from 'components/Common/Pagination'
import Card from 'components/Common/Card'
import RefreshButton from 'components/Common/RefreshButton'
import Tooltip from 'components/Common/Tooltip'
import SortIcon from 'components/Common/Icons/sort'
import QuestionIcon from 'assets/Icons/question-alt.svg'
import { VESTIGE_POOLS_VOLUME_APR } from 'constants/links'
import SIZE from 'constants/screenSizes'
import FlexContainer, { GridContainer } from 'components/Common/FlexContainer'
import Toggle from 'components/Common/Toggle'
import PoolGrid from './Components/PoolGrid'
import PoolListItem from './Components/PoolListItem'
import PoolListItemSkeleton from './Components/PoolListItemSkeleton'

const APR_ENABLED = process.env.REACT_APP_APR_FEATURE

const List = styled.div``

const ListHeadings = styled(PoolGrid)`
  padding: 1.2rem 0.5rem 0 0.5rem;
  grid-template-rows: 1fr;
  margin-bottom: 1rem;
  user-select: none;
  @media (max-width: ${SIZE.sm}) {
    display: none;
  }
`
const HeadingItem = styled(FlexContainer)<{ first?: boolean }>`
  align-self: center;
  color: ${COLORS.midGray};
  font-size: 12px;
  justify-self: flex-start;
  text-align: ${({ first }) => (first ? 'center' : 'left')};
`

const NoPoolsMessage = styled.p`
  color: ${COLORS.midGray};
  text-align: center;
  padding: 2rem 0;
`

const PoolSearch = styled(GridContainer).attrs({ columns: '90% auto' })`
  width: 100%;
`

const ContentContainer = styled.div`
  padding: 1rem;
  width: 100%;
  @media (max-width: ${SIZE.sm}) {
    padding: 1rem 0;
  }
`
const PoolFilter = styled.div`
  padding-top: 8px;

  [class^='ToggleText'] {
    font-size: 0.8rem;
    padding-left: 8px;
    padding-right: 8px;
  }
`
const PoolListHeader = styled(FlexContainer)`
  justify-content: space-between;
  width: 100%;

  @media (max-width: ${SIZE.sm}) {
    flex-direction: column;
    margin-bottom: 1rem;
  }
`
const Title = styled.p`
  font-weight: bold;
  font-size: 1.25rem;
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  @media (max-width: ${SIZE.sm}) {
    margin-bottom: 10px;
  }
`
const SearchInput = styled.input`
  background: transparent;
  padding: 5px 10px;
  border: 1px solid white;
  border-radius: 8px;
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
  &:focus {
    outline: 1px solid ${({ theme }) => theme.colors.main};
  }
  @media (max-width: ${SIZE.sm}) {
    width: 100%;
  }
`
const NoPoolMessage = styled.p`
  color: ${COLORS.midGray};
  font-size: 16px;
  text-align: center;
  margin-top: 28px;
`
const SortWrapper = styled.div`
  cursor: pointer;
  display: flex;
  margin-left: 4px;
  padding: 0 4px;
  &:hover {
    transform: scale(1.5);
    transition: all 0.2s ease-in-out;
  }
`

enum VIEWSTATE {
  IDLE = 0,
  FETCHING = 1,
  EMPTY = 2,
}

enum SORT_TYPE {
  NONE = '',
  NAME = 'name',
  TVL = 'tvl',
  APR = 'apr',
  VOLUME = 'vol',
}

export enum SORT_DIRECTION {
  NONE = '',
  ASCENDING = 'ascending',
  DESCENDING = 'descending',
}

const HEADINGS = [
  {
    title: 'Pair name',
    key: SORT_TYPE.NAME,
    isSortable: false,
  },
  {
    title: 'TVL',
    key: SORT_TYPE.TVL,
    tooltipText: 'Total value locked',
    isSortable: true,
  },
  {
    title: 'Volume',
    key: SORT_TYPE.VOLUME,
    tooltipText: 'Pool volume 7d (USD)',
    isSortable: true,
  },
  {
    title: 'APR',
    key: SORT_TYPE.APR,
    tooltipText: 'Annual percentage return (7d)',
    isSortable: true,
  },
]

type PoolVolumeAPRData = {
  // eslint-disable-next-line camelcase
  application_id: number
  apr7d?: number
  apr24h?: number
  // eslint-disable-next-line camelcase
  asset_1_id: number | null
  // eslint-disable-next-line camelcase
  asset_2_id: number | null
  fee: number
  id: number
  liquidity: number
  provider: string
  volume7d?: number
  volume24h?: number
}

type PoolVolumeAPRDataByID = { [index: string]: PoolVolumeAPRData }
type TokenFilter = 'Verified Tokens' | 'All Pools'

const PoolList = () => {
  const isMobile = useIsMobile()
  const { IDLE, FETCHING } = VIEWSTATE
  const { NONE, TVL, APR, VOLUME } = SORT_TYPE
  const { NONE: NOSORTDIR, ASCENDING, DESCENDING } = SORT_DIRECTION
  // Update when 'tokenList' changes to show user pool in list items
  const { pools, tokenList } = useGlobalDex(['pools', 'tokenList'])
  const { connected, connecting } = useGlobalUser()
  const [tokenFilter, setTokenFilter] = useState<TokenFilter>('Verified Tokens')
  const [filteredPools, setFilteredPools] = useState<Pool[]>([])
  const [filterBy, setQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [sortType, setSortType] = useState<SORT_TYPE>(NONE)
  const [sortDirection, setSortDirection] = useState<SORT_DIRECTION>(NOSORTDIR)
  const [pageSize] = useState(20)
  const [apr, setApr] = useState<PoolVolumeAPRDataByID>({})
  const [isUpdatingPools, setUpdating] = useState(false)
  const [view, setView] = useState<VIEWSTATE>()
  const { launchToast } = useToast()
  const isMounted = useIsMounted()
  const tokenMap = new Map<string, Token>()
  if (tokenList.length) tokenList.forEach((tk) => tokenMap.set(tk.id, tk))

  const getPoolsVolumes = async () => {
    const res: Response = await fetch(VESTIGE_POOLS_VOLUME_APR).catch(
      (err) => err,
    )
    if (res.status !== 200) return
    const data = await res.json()
    const poolVolumeById: PoolVolumeAPRDataByID = arrayToObject(
      data,
      (p) => p.application_id,
    )
    setApr(poolVolumeById)
  }

  useEffect(() => {
    if (APR_ENABLED === 'true') getPoolsVolumes()
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSortType(NONE)
      setSortDirection(NOSORTDIR)
    }
  }, [isMobile])

  const sortPools = (poolsToSort: Pool[]) => {
    const isAscending = sortDirection === ASCENDING
    const sortedPools = sortBy(poolsToSort, (el) => {
      const getData = (pool: Pool) => apr[String(pool.poolAddr)]
      switch (sortType) {
        case TVL:
          return getPoolTVLSort(el)
        case APR:
          return getData(el)?.apr7d || 0
        case VOLUME:
          return getData(el)?.volume7d || 0
        default:
          return getPoolTVLSort(el)
      }
    })

    return isAscending ? sortedPools : sortedPools.reverse()
  }

  const trustedTiers: TokenVerificationTier[] = ['trusted', 'verified']
  const filterPools = (poolsToFilter: Pool[], query: string) => {
    const preQueryPools = poolsToFilter.filter((pool) => {
      const hasBalance = pool.tokABalance && pool.tokBBalance
      if (tokenFilter === 'All Pools' || !hasBalance) return hasBalance
      const [A, B] = [tokenMap.get(pool.tokAId), tokenMap.get(pool.tokBId)]
      return (
        hasBalance &&
        [A, B].every((tk) =>
          trustedTiers.includes(tk?.verificationTier || 'unverified'),
        )
      )
    })
    return query ? filterPoolsByQuery(query, preQueryPools) : preQueryPools
  }

  const onSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (currentPage !== 0) setCurrentPage(0)
    const searchValue = e.target.value?.toLowerCase()
    setQuery(searchValue)
  }

  const toggleTokenFilter = () => {
    setTokenFilter(
      tokenFilter === 'All Pools' ? 'Verified Tokens' : 'All Pools',
    )
  }

  const updatePools = async () => {
    if (isUpdatingPools) return
    const toastId = launchToast(
      'progress',
      {
        message: t`Updating pool info`,
      },
      undefined,
      { autoClose: false },
    )
    setUpdating(true)
    // eslint-disable-next-line no-restricted-syntax
    for (const pool of pools) {
      // eslint-disable-next-line no-await-in-loop
      await reloadPool(pool)
    }
    if (isMounted()) {
      setUpdating(false)
    }
    launchToast('success', { message: t`Pools updated!` }, toastId)
  }

  const changePage = (next: number) => setCurrentPage(next)

  const handleSort = (type: SORT_TYPE) => {
    const directions = [NOSORTDIR, DESCENDING, ASCENDING]
    if (sortType !== type) {
      setSortType(type)
      setSortDirection(DESCENDING)
      return
    }
    const currDirIndex = directions.indexOf(sortDirection)
    const nextDir = currDirIndex < 2 ? directions[currDirIndex + 1] : NOSORTDIR
    setSortDirection(nextDir)
    setSortType(nextDir !== NOSORTDIR ? type : NONE)
  }

  useEffect(() => {
    setFilteredPools(sortPools(filterPools(pools, filterBy)))
    setView(!pools?.length ? FETCHING : IDLE)
  }, [pools, filterBy, sortType, sortDirection, tokenFilter])

  const filteredPoolsApr: Pool[] = useMemo(
    () =>
      filteredPools.map((fp) => {
        const data = apr[String(fp.poolAddr)]
        return { ...fp, apr: data?.apr7d, volume: data?.volume7d } // 7D
      }),
    [filteredPools, apr],
  )

  return (
    <Card style={{ marginTop: '1.25rem' }}>
      <ContentContainer>
        <PoolListHeader>
          <Title>
            <Trans>Popular pools</Trans>
          </Title>
          <PoolSearch>
            <SearchInput
              placeholder={t`Search by token ID, name, or symbol`}
              onChange={onSearchInput}
              value={filterBy}
            />
            <RefreshButton
              testId='reload-pools'
              onClick={updatePools}
              updating={isUpdatingPools}
            />
          </PoolSearch>
        </PoolListHeader>

        <PoolFilter>
          <Toggle
            active={tokenFilter}
            disabled={connecting || !connected}
            posText='Verified Tokens'
            negText='All Pools'
            onToggleClick={toggleTokenFilter}
          />
        </PoolFilter>

        {!connected && !connecting ? (
          <NoPoolMessage>
            <Trans>Connect wallet to see popular pools</Trans>
          </NoPoolMessage>
        ) : view === VIEWSTATE.EMPTY ? (
          <NoPoolsMessage>
            <Trans>No Pools Available</Trans>
          </NoPoolsMessage>
        ) : (
          <>
            <ListHeadings>
              {HEADINGS.map((heading, index) => {
                const gridColumn = `${index + 2}/${index + 3}`
                const selectedDirection =
                  heading.key === sortType ? sortDirection : undefined
                return (
                  <HeadingItem
                    style={{ gridColumn }}
                    first={index === 0}
                    key={heading.title}
                  >
                    {heading.title}
                    {heading.tooltipText && (
                      <Tooltip
                        icon={QuestionIcon}
                        message={heading.tooltipText}
                      />
                    )}
                    {heading.isSortable && (
                      <SortWrapper onClick={() => handleSort(heading.key)}>
                        <SortIcon selectedDirection={selectedDirection} />
                      </SortWrapper>
                    )}
                  </HeadingItem>
                )
              })}
            </ListHeadings>
            {view === VIEWSTATE.FETCHING || connecting ? (
              ['0', '1', '2'].map((i) => <PoolListItemSkeleton key={i} />)
            ) : (
              <>
                <List data-testid='pools-list'>
                  {filteredPoolsApr
                    .slice(
                      currentPage * pageSize,
                      currentPage * pageSize + pageSize,
                    )
                    .map((pool) => (
                      <PoolListItem key={pool.poolAddr} {...pool} />
                    ))}
                </List>
                <Pagination
                  pagesLength={filteredPoolsApr.length}
                  onPageClick={changePage}
                  currentPage={currentPage}
                  pageSize={pageSize}
                />
              </>
            )}
          </>
        )}
      </ContentContainer>
    </Card>
  )
}

export default PoolList
