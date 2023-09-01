/* eslint-disable consistent-return */
import { useState, useEffect, useMemo, ChangeEvent } from 'react'
import _debounce from 'lodash.debounce'
import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'
import Toggle from 'components/Common/Toggle'
import Checkbox from 'components/Common/Checkbox'
import { BackToPoolButton } from 'components/Common/Button'
import RefreshButton from 'components/Common/RefreshButton'
import Card from 'components/Common/Card'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { useIsMobile } from 'hooks/useScreenSize'
import useGlobalUser from 'hooks/useGlobalUser'
import fetchFarm from 'helpers/farm'
import useToast from 'hooks/useToast'
import useIsMounted from 'hooks/useIsMounted'
import useGlobalDex from 'hooks/useGlobalDex'
import cacheReducer from 'state/cacheReducer'
import { farmToStaticFarm } from 'cache/farms'
import attachFarmListener from 'reach/listeners/farmListener'
import FarmTable from './FarmTable'

const Content = styled.div`
  width: 100%;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.body};
  padding: 1.5rem;
  p {
    color: ${({ theme }) => theme.colors.text};
  }
  @media (max-width: ${SIZE.md}) {
    width: 100%;
  }
  @media (max-width: ${SIZE.sm}) {
    padding: 1rem;
  }
`
const FarmListHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`
const TitleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  width: 100%;
`
const Title = styled.p`
  font-weight: bold;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 7px;
`
const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`
const NoConnection = styled.div`
  color: ${COLORS.midGray};
  font-size: 16px;
  margin-top: 28px;
  text-align: center;
`
const FilterContainer = styled.div`
  display: flex;
  width: 100%;
  @media (max-width: ${SIZE.sm}) {
    margin-top: 10px;
  }
`
const FiltersWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (min-width: ${SIZE.md}) {
    &:first-of-type {
      padding-right: 20px;
    }

    label {
      font-size: 0.8rem;
    }
  }

  @media (max-width: ${SIZE.sm}) {
    [data-testid='toggle'] [class^='ToggleText'] {
      font-size: 0.7rem;
    }
  }

  @media (max-width: ${SIZE.xs}) {
    [data-testid='toggle'] [class^='ToggleText'] {
      padding: 0 0.3rem;
    }
  }
`
const SearchBoxWrapper = styled(FiltersWrapper)`
  flex: 0.8;
`
const SearchInput = styled.input`
  flex: 1;
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

enum TOGGLE_TYPE {
  LIVE = 'Live',
  ENDED = 'Ended',
}

const FarmList = ({ queryFarmId }: { queryFarmId: string }) => {
  const [toggle, setToggle] = useState<TOGGLE_TYPE>(TOGGLE_TYPE.LIVE)
  const [queryValue, setQueryValue] = useState('')
  const [isUpdatingFarms, setUpdatingFarms] = useState(false)
  const [filterBy, setQuery] = useState('')
  const [myFarmsOnly, setMyFarmsOnly] = useState(false)
  const [partnerFarmsOnly, setPartnerFarmsOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const { connected, connecting, reachAccount } = useGlobalUser([
    'connecting',
    'reachAccount',
  ])
  const { launchToast } = useToast()
  const isMounted = useIsMounted()
  const { farmsLoading, stakingPools } = useGlobalDex(['stakingPools'])
  const debounceSetQuery = useMemo(() => _debounce(setQuery, 750), [])
  const activateFarmListener = () => {
    const subscribedToFarms = cacheReducer.subscriptions.farms
    if (reachAccount && !subscribedToFarms) attachFarmListener(reachAccount)
  }

  useEffect(() => {
    debounceSetQuery.cancel()
    activateFarmListener()
  }, [])

  useEffect(() => {
    activateFarmListener()
  }, [reachAccount])

  const onSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (currentPage !== 0) setCurrentPage(0)
    const searchValue = e.target.value.trim()
    setQueryValue(searchValue)
    debounceSetQuery(searchValue)
  }
  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMyFarmsOnly(e.target.checked)
  }
  const handlePartnerCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPartnerFarmsOnly(e.target.checked)
  }

  const isMobile = useIsMobile()
  const refreshFarms = async () => {
    if (!isUpdatingFarms) {
      setUpdatingFarms(true)
      const msg = { message: t`Updating Farm info` }
      const close = { autoClose: false }
      const toastId = launchToast('progress', msg, undefined, close)

      for (let index = 0; index < stakingPools.length; index += 1) {
        // eslint-disable-next-line no-await-in-loop
        await fetchFarm(farmToStaticFarm(stakingPools[index])).then(
          (fetchedFarm) => {
            if (fetchedFarm !== undefined)
              cacheReducer.farms.update(fetchedFarm)
          },
        )
      }

      if (isMounted()) setUpdatingFarms(false)
      launchToast('success', { message: t`Farms updated!` }, toastId)
    }
  }

  return (
    <>
      {queryFarmId && <BackToPoolButton returnTo='farm' />}
      <Card style={{ marginTop: !queryFarmId ? '1.25rem' : '0' }}>
        <Content>
          <FarmListHeader>
            <TitleContainer>
              <Title>
                {queryFarmId
                  ? `${t`Farm ID`} ${queryFarmId}`
                  : t`Popular farms`}
              </Title>
            </TitleContainer>
            {isMobile && (
              <SearchContainer>
                <SearchInput
                  placeholder={
                    connected && farmsLoading
                      ? 'Farms Loading...'
                      : 'Search by token name or symbol'
                  }
                  onChange={onSearchInput}
                  disabled={!connected || farmsLoading}
                  value={queryValue}
                />
                <RefreshButton
                  testId='reload-farms'
                  onClick={refreshFarms}
                  updating={isUpdatingFarms}
                />
              </SearchContainer>
            )}
            {!queryFarmId && (
              <FilterContainer>
                <FiltersWrapper data-testid='farm-filter'>
                  <Checkbox
                    onChange={handleCheckboxChange}
                    disabled={!connected}
                  >
                    <Trans>My farms</Trans>
                  </Checkbox>
                  <Checkbox
                    onChange={handlePartnerCheckboxChange}
                    disabled={!connected}
                  >
                    <Trans>Verified</Trans>
                  </Checkbox>
                  <Toggle
                    active={toggle}
                    disabled={!connected}
                    posText={TOGGLE_TYPE.LIVE}
                    negText={TOGGLE_TYPE.ENDED}
                    onToggleClick={() => {
                      if (!connected) return
                      setToggle(
                        toggle === TOGGLE_TYPE.LIVE
                          ? TOGGLE_TYPE.ENDED
                          : TOGGLE_TYPE.LIVE,
                      )
                    }}
                  />
                </FiltersWrapper>
                {!isMobile && (
                  <SearchBoxWrapper>
                    <SearchInput
                      placeholder={
                        connected && farmsLoading
                          ? 'Farms Loading...'
                          : 'Search by token name or symbol'
                      }
                      onChange={onSearchInput}
                      value={queryValue}
                      disabled={!connected || farmsLoading}
                    />
                    <RefreshButton
                      testId='reload-farms'
                      onClick={refreshFarms}
                      updating={isUpdatingFarms}
                    />
                  </SearchBoxWrapper>
                )}
              </FilterContainer>
            )}
          </FarmListHeader>

          {connected || connecting ? (
            <FarmTable
              partnerFarmsOnly={partnerFarmsOnly}
              myFarmsOnly={myFarmsOnly}
              liveFarms={toggle === TOGGLE_TYPE.LIVE}
              query={filterBy}
              queryId={queryFarmId}
            />
          ) : (
            <NoConnection>
              <Trans>Connect wallet to see farms</Trans>
            </NoConnection>
          )}
        </Content>
      </Card>
    </>
  )
}

export default FarmList
