import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import Loading from 'LoadingScreen'
import AlgoWalletNotFound from 'components/AlgoWalletNotFound'
import CreatePool from 'components/Pool/Create'
import useGlobalUser from 'hooks/useGlobalUser'
import PageContainer from 'components/PageContainer'
import PoolList from 'components/Pool/PoolList'
import YourLiquidity from 'components/Liquidity/YourLiquidity'
import LiquidityItem from 'components/Liquidity/YourLiquidity/LiquidityItem'

const MigrateLiquidity = lazy(() => import('./MigrateLiquidity'))
const RemoveFromPool = lazy(() => import('./RemoveFromPool'))
const AddToPool = lazy(() => import('./AddToPool'))

const Container = styled.div`
  width: 100%;
`

/** Component that renders content for the /pool client side route */
export default function PoolsRoute(): JSX.Element {
  const { walletAddress } = useGlobalUser()

  return (
    <PageContainer type='pool'>
      <Routes>
        <Route index element={<PoolsHome />} />

        {/* Create Pool */}
        <Route
          path='new'
          element={
            <Suspense fallback={<Loading />}>
              {walletAddress ? <CreatePool /> : <AlgoWalletNotFound />}
            </Suspense>
          }
        />

        {/* Remove Liquidity from Pool */}
        <Route
          path=':poolId/remove'
          element={
            <Suspense fallback={<Loading />}>
              {walletAddress ? <RemoveFromPool /> : <AlgoWalletNotFound />}
            </Suspense>
          }
        />

        {/* Add Liquidity to Pool */}
        <Route
          path=':poolId/add'
          element={
            <Suspense fallback={<Loading />}>
              {walletAddress ? <AddToPool /> : <AlgoWalletNotFound />}
            </Suspense>
          }
        />

        {/* Migrate Liquidity from old Pool */}
        <Route
          path='migrate'
          element={
            <Suspense fallback={<Loading />}>
              <MigrateLiquidity />
            </Suspense>
          }
        />
      </Routes>
    </PageContainer>
  )
}

/** User Liquidity List and Popular `Pools` list */
function PoolsHome() {
  const { liquidityPools } = useGlobalUser(['liquidityPools'])

  return (
    <Container>
      <YourLiquidity
        pools={liquidityPools}
        renderListItem={(p) => <LiquidityItem key={p.poolAddr} pool={p} />}
      />
      <PoolList />
    </Container>
  )
}
