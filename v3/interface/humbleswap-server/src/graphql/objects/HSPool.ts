import { objectType } from 'nexus'
import { getTokenById } from '../services/Tokens.service'
import { lastObjInArray } from '../utils'

/** `Pool` object (generates types and models) */
export const HSPool = objectType({
  name: 'HSPool',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('poolTokenId')
    t.nonNull.string('tokenAId')
    t.nonNull.int('tokenADecimals')
    t.nonNull.string('tokenBId')
    t.nonNull.int('tokenBDecimals')
    t.nonNull.string('chain')
    t.nonNull.string('provider')
    t.boolean('tradeable')
    t.boolean('duplicate')
    t.list.field('PoolLiquidity', { type: 'HSPoolLiquidity' })
    t.list.field('tokens', {
      type: 'HSToken',
      resolve({ tokenAId, tokenBId }) {
        return Promise.all([
          getTokenById({ id: tokenAId }),
          getTokenById({ id: tokenBId }),
        ])
      },
    })

    // External Fields (for API requests)
    t.string('poolAddress', { resolve: ({ id }) => id })
    t.boolean('n2nn', { resolve: ({ tokenAId }) => tokenAId === '0' })
    t.nonNull.field('lastUpdated', {
      type: 'HSDateTime',
      resolve({ PoolLiquidity }) {
        return lastObjInArray(PoolLiquidity).lastUpdated
      },
    })

    // PoolLiquidity linked fields
    t.nonNull.string('mintedLiquidityTokens', {
      resolve({ PoolLiquidity }) {
        return lastObjInArray(PoolLiquidity).mintedLiquidityTokens ?? '0'
      },
    })

    t.nonNull.string('tokenABalance', {
      resolve({ PoolLiquidity }) {
        return lastObjInArray(PoolLiquidity).tokenABalance ?? '0'
      },
    })

    t.nonNull.string('tokenAFees', {
      resolve({ PoolLiquidity }) {
        return lastObjInArray(PoolLiquidity).tokenAFees ?? '0'
      },
    })

    t.nonNull.string('tokenBBalance', {
      resolve({ PoolLiquidity }) {
        return lastObjInArray(PoolLiquidity).tokenBBalance ?? '0'
      },
    })

    t.nonNull.string('tokenBFees', {
      resolve({ PoolLiquidity }) {
        return lastObjInArray(PoolLiquidity).tokenBFees ?? '0'
      },
    })

    // Vestige fields
    t.string('apr24h', {
      resolve: ({ PoolLiquidity }) => {
        return lastObjInArray(PoolLiquidity).apr24h || null
      },
    })

    t.string('apr7d', {
      resolve: ({ PoolLiquidity }) => {
        return lastObjInArray(PoolLiquidity).apr7d || null
      },
    })

    t.string('volume24h', {
      resolve: ({ PoolLiquidity }) => {
        return lastObjInArray(PoolLiquidity).volume24h || null
      },
    })

    t.string('volume7d', {
      resolve: ({ PoolLiquidity }) => {
        return lastObjInArray(PoolLiquidity).volume7d || null
      },
    })
  },
})


