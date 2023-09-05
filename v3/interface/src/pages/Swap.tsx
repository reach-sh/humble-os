import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoadingScreen from 'LoadingScreen'
import PageContainer from 'components/PageContainer'
import SwapTokens from 'components/Swap'

/** Token Swap parent page (swap and all subroutes) */
function Swap(): JSX.Element {
  return (
    <PageContainer type='swap' hasTutorial>
      <Routes>
        <Route
          index
          element={
            <Suspense fallback={<LoadingScreen />}>
              <SwapTokens />
            </Suspense>
          }
        />
      </Routes>
    </PageContainer>
  )
}

export default Swap
