import styled from 'styled-components'
import { t } from '@lingui/macro'
import useGlobalUser from 'hooks/useGlobalUser'
import SIZE from 'constants/screenSizes'
import { COLORS } from 'theme'
import { Farm } from 'types/shared'
import Card from 'components/Common/Card'
import { LinkWithButtonProps } from 'components/Common/Button'
import Pagination from 'components/Common/Pagination'
import { useMemo, useState } from 'react'
import useGlobalDex from 'hooks/useGlobalDex'
import YourFarmItem from 'components/Farm/YourFarmItem'
import FlexContainer from 'components/Common/FlexContainer'

const Container = styled(Card).attrs({ className: 'slide-down-fade-in' })`
  width: 100%;
  margin-bottom: 10px;
`

const Content = styled.div`
  padding: 1.5rem;
  min-height: 188px;
  @media (max-width: ${SIZE.sm}) {
    padding: 0;
  }
`

const Heading = styled(FlexContainer)`
  justify-content: space-between;
  margin-bottom: 20px;
`

const Title = styled.h2`
  font-size: 24px;
  @media (max-width: ${SIZE.sm}) {
    font-size: 18px;
  }
`

const CreateFarmButton = styled(LinkWithButtonProps)`
  background: ${COLORS.yellow};
  max-width: 208px;
  font-weight: bold;
  @media (max-width: ${SIZE.sm}) {
    max-width: 150px;
  }
`

const NoFarmsMessage = styled.p`
  color: ${COLORS.midGray};
  font-size: 16px;
  text-align: center;
  margin-top: 28px;
`

const FarmsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const pageSize = process.env.REACT_APP_RUNNING_TESTS === 'true' ? 20 : 5

const YourFarms = () => {
  const onPageClick = (newPage: number) => setCurrentPage(newPage)
  const [currentPage, setCurrentPage] = useState(0)
  const { connected } = useGlobalUser()
  const { farmsLoading, stakingPools: farms } = useGlobalDex(['stakingPools'])
  const yourFarms: Farm[] = farms.filter((farm) => farm.stakedTokenAmt !== '0')
  const [displayFarms, noFarmsMessage] = useMemo(() => {
    const display = connected && yourFarms.length > 0
    let msg = t`Connect wallet to see your farm liquidity`
    if (connected) {
      msg = farmsLoading ? t`Farms Loading...` : t`No farm liquidity to display`
    }
    return [display, msg]
  }, [connected, farmsLoading])

  return (
    <Container>
      <Content>
        <Heading>
          <Title>{t`Farm liquidity`}</Title>
          <CreateFarmButton to='/farm/create'>{t`Create farm`}</CreateFarmButton>
        </Heading>
        <FarmsContainer>
          {displayFarms ? (
            yourFarms
              .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
              .map((farm) => (
                <YourFarmItem key={farm?.contractId} farm={farm} />
              ))
          ) : (
            <NoFarmsMessage>{noFarmsMessage}</NoFarmsMessage>
          )}
        </FarmsContainer>
        {displayFarms && (
          <Pagination
            pagesLength={yourFarms.length}
            pageSize={pageSize}
            onPageClick={onPageClick}
            currentPage={currentPage}
          />
        )}
      </Content>
    </Container>
  )
}

export default YourFarms
