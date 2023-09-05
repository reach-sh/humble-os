import {
  removeLiquidityPool,
  updateLiquidityPool,
  updateLiquidityPools,
} from 'state/reducers/user'

import ADI from 'cache'
import { Farm, Pool, Prices, Token } from 'types/shared'
import { HSLimitOrder } from 'types/response'
import {
  GlobalDex,
  removePool,
  removeStakingPool,
  removeToken,
  updatePool,
  updatePools,
  updateStakingPool,
  updateToken,
  updateTokens,
} from 'state/reducers/dex'
import LimitOrders, {
  removeLimitOrder,
  updateLimitOrder,
  updateLimitOrders,
} from 'state/reducers/limit-orders'
import {
  generateDataFlags,
  LoadingFlags,
  StreamSubscriptions,
} from 'state/reducers/loading-flags'

type CacheItemArgs<T> = { key: string; value: any; cacheKey?: keyof T }
type LPCacheItem = CacheItemArgs<{ liquidityPools: Pool }>
type PoolCacheItem = CacheItemArgs<{ pools: Pool }>
type TokenCacheItem = CacheItemArgs<{ tokens: any }>
type OrderCacheItem = CacheItemArgs<{ limitOrders: HSLimitOrder[] }>
const cacheParcel = (key: string, value: any, cacheKey: string) => ({
  key,
  value,
  cacheKey,
})

/**
 * Cache reducer orchestrates data-caching in local storage and global state instances
 */
const cacheReducer = {
  lPools: {
    delete: (poolAddress: string | number) => {
      removeLiquidityPool(poolAddress)
      ADI.removeItem(poolAddress.toString(), 'liquidityPools')
    },
    update: (pool: Pool) => {
      updateLiquidityPool(pool)
      cacheMultipleLqPools([pool])
    },
    updateMultiple: (pools: Pool[]) => {
      updateLiquidityPools(pools)
      cacheMultipleLqPools(pools)
    },
    set: (pools: Pool[]) => {
      updateLiquidityPools(pools)
      cacheMultipleLqPools(pools)
    },
    list: () => ADI.listItems({ cacheKey: 'liquidityPools' }),
  },
  pools: {
    delete: (poolAddress: string | number) => {
      removePool(poolAddress.toString())
      ADI.removeItem(poolAddress.toString(), 'pools')
    },
    update: (pool: Pool) => {
      updatePool(pool)
      cacheMultiplePools([pool])
    },
    updateMultiple: (pools: Pool[]) => {
      updatePools(pools)
      cacheMultiplePools(pools)
    },
    set: (pools: Pool[]) => {
      updatePools(pools)
      cacheMultiplePools(pools)
    },
    list: () => ADI.listItems({ cacheKey: 'pools' }),
  },
  farms: {
    delete: (id: string) => {
      removeStakingPool(id)
      ADI.removeItem(id, 'farms')
    },
    update: (farm: Farm) => {
      updateStakingPool(farm)
      ADI.cacheItem(farm.contractId.toString(), farm, 'farms')
    },
    set: (farms: Farm[]) => {
      GlobalDex.stakingPools(farms)
      const toCache = farms.map((f) =>
        cacheParcel(f.contractId.toString(), f, 'farms'),
      )
      ADI.cacheMultiple(toCache as any[]) // TODO: Fix type
    },
    list: () => ADI.listItems({ cacheKey: 'farms' }),
  },
  limitOrders: {
    delete: (id: string) => {
      removeLimitOrder(id)
      ADI.removeItem(id, 'limitOrders')
    },
    update: (lo: HSLimitOrder) => {
      if (!lo.contractId) return
      updateLimitOrder(lo)
      cacheMultipleOrders([lo])
    },
    set: (orders: HSLimitOrder[]) => {
      LimitOrders.orders(orders)
      cacheMultipleOrders(orders)
    },
    updateMultiple: (orders: HSLimitOrder[]) => {
      updateLimitOrders(orders)
      cacheMultipleOrders(orders)
    },
    list: () => ADI.listItems({ cacheKey: 'limitOrders' }),
  },
  tokens: {
    get: (id: string, fallback?: () => Promise<any>) => () =>
      ADI.getItem(id, 'tokens', fallback),
    delete: (id: string) => {
      removeToken(id)
      ADI.removeItem(id, 'tokens')
    },
    update: (token: Token) => {
      updateToken(token)
      ADI.cacheItem(token.id.toString(), token, 'tokens')
    },
    updateMultiple: (tokens: Token[]) => {
      // Updates only specified tokens
      updateTokens(tokens)
      cacheMultipleTokens(tokens)
    },
    set: (tokens: Token[]) => {
      GlobalDex.tokenList(tokens)
      cacheMultipleTokens(tokens)
    },
    list: () => ADI.listItems({ cacheKey: 'tokens' }),
  },
  prices: {
    get: () =>
      ({
        lastRate: Number(localStorage.getItem('lastRate')),
        lastUpdate: Number(localStorage.getItem('lastUpdate')),
        displayUnit: localStorage.getItem('displayCurrency'),
      } as Prices),
    set: (prices: Prices) => {
      GlobalDex.prices(prices)

      if (prices.lastRate !== undefined)
        localStorage.setItem('lastRate', prices.lastRate.toString())
      if (prices.lastUpdate !== undefined)
        localStorage.setItem('lastUpdate', prices.lastUpdate.toString())
      if (prices.displayUnit !== undefined)
        localStorage.setItem('displayCurrency', prices.displayUnit)
    },
    setLastUpdate: (lastUpdate: number) => {
      localStorage.setItem('lastUpdate', lastUpdate.toString())
    },
  },
  // Loading flags
  loadingFlags: generateDataFlags(LoadingFlags),
  // Subscription flags
  subscriptions: generateDataFlags(StreamSubscriptions),
}

export default cacheReducer

function cacheMultipleOrders(orders: HSLimitOrder[]) {
  const parcels: OrderCacheItem[] = []
  const parcel = (o: HSLimitOrder) =>
    cacheParcel(o.contractId || '', o, 'limitOrders') as OrderCacheItem
  orders.forEach((o) => o.contractId && parcels.push(parcel(o)))
  ADI.cacheMultiple(parcels)
}

function cacheMultiplePools(pools: Pool[]) {
  const cache = pools.map((p) => cacheParcel(p.poolAddr.toString(), p, 'pools'))
  ADI.cacheMultiple(cache as PoolCacheItem[])
}

function cacheMultipleLqPools(pools: Pool[]) {
  const cache = pools.map((p) => {
    const id = p.poolAddr.toString()
    return cacheParcel(id, id, 'liquidityPools')
  })

  ADI.cacheMultiple(cache as LPCacheItem[])
}

function cacheMultipleTokens(tokens: Token[]) {
  const cache = tokens.map((t) => cacheParcel(t.id.toString(), t, 'tokens'))
  ADI.cacheMultiple(cache as TokenCacheItem[])
}
