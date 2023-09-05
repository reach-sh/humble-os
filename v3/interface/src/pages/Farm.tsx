import { lazy, Suspense, useMemo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import LoadingScreen from 'LoadingScreen'
import styled from 'styled-components'
import PageContainer from 'components/PageContainer'
import FarmList from 'components/Farm'
import YourFarms from 'components/Farm/YourFarms'

const CreateFarmPage = lazy(() => import('./CreateFarm'))
const Container = styled.div`
  width: 100%;
`

const useQuery = () => {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

const FarmsHome = () => {
  const query = useQuery()
  const queryFarmId = query.get('id') || ''
  return (
    <Container>
      {!queryFarmId && <YourFarms />}
      <FarmList queryFarmId={queryFarmId} />
    </Container>
  )
}

/**
 * Component that renders content for the /farm client side route
 */
function Farm(): JSX.Element {
  return (
    <PageContainer type='farm'>
      <Routes>
        <Route
          index
          element={
            <Suspense fallback={<LoadingScreen />}>
              <FarmsHome />
            </Suspense>
          }
        />

        {/* Partner Farms */}
        <Route
          path='new'
          element={
            <Suspense fallback={<LoadingScreen />}>
              <CreateFarmPage />
            </Suspense>
          }
        />

        {/* Public (permissionless) Farms */}
        <Route
          path='create'
          element={
            <Suspense fallback={<LoadingScreen />}>
              <CreateFarmPage />
            </Suspense>
          }
        />
      </Routes>
    </PageContainer>
  )
}

export default Farm
