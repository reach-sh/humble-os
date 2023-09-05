import { AppRouteDef } from 'types/shared'
import { lazy } from 'react'
import { t } from '@lingui/macro'

/**
 * Central point for defining actual routes. Simple way to globally
 * change application routes without updating components
 */
export const paths = {
  swap: {
    index: '/swap',
    confirm: '/swap/confirm',
    pool: (id: string) => `/swap?poolId=${id}`,
  },
  limitOrder: { index: '/limit-order' },
  pool: {
    index: '/pool',
    new: '/pool/new',
    swap: '/pool/swap',
    migrate: '/pool/migrate',
    add: (id = ':poolId') => `/pool/${id}/add`,
    remove: (id = ':poolId') => `/pool/${id}/remove`,
  },
  farm: {
    index: '/farm',
    partner: '/farm/new',
    create: '/farm/create',
  },
  xGovs: { index: '/xgovs' },
}

// List of routes for the Application
// Any new 'pages' or 'paths' need to be added here
const routes: AppRouteDef[] = [
  {
    path: paths.swap.index,
    text: t`Swap`,
    component: lazy(() => import('pages/Swap')),
  },
  {
    path: paths.limitOrder.index,
    text: t`Limit Order`,
    component: lazy(() => import('components/LimitOrder')),
  },
  {
    path: paths.pool.index,
    text: t`Pool`,
    component: lazy(() => import('pages/Pool')),
  },
  {
    path: paths.farm.index,
    text: t`Farm`,
    component: lazy(() => import('pages/Farm')),
  },
  {
    path: paths.farm.partner,
    text: t`Create Partner Farm`,
    component: lazy(() => import('pages/CreateFarm')),
  },
  {
    path: paths.farm.create,
    text: t`Create Farm`,
    component: lazy(() => import('pages/CreateFarm')),
  },
  {
    path: paths.pool.remove(),
    text: t`Remove`,
    protected: true,
    component: lazy(() => import('pages/RemoveFromPool')),
  },
  {
    path: paths.pool.add(),
    text: t`Add`,
    protected: true,
    component: lazy(() => import('pages/AddToPool')),
  },
]

export default routes

// export const Routes =
export const SwapPage = lazy(() => import('pages/Swap'))
export const LimitOrderPage = lazy(() => import('components/LimitOrder'))
export const PoolPage = lazy(() => import('pages/Pool'))
export const FarmPage = lazy(() => import('pages/Farm'))
export const Swap = lazy(() => import('components/Swap'))
export const XGovs = lazy(() => import('pages/ExpertGovs'))
