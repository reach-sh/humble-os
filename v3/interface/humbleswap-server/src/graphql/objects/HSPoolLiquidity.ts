import { objectType } from 'nexus'

// Pool Liquidity data
export const HSPoolLiquidity = objectType({
  name: 'HSPoolLiquidity',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('poolId')
    t.nonNull.string('tokenABalance')
    t.nonNull.string('tokenAFees')
    t.nonNull.string('tokenBBalance')
    t.nonNull.string('tokenBFees')
    t.nonNull.string('mintedLiquidityTokens')
    t.string('volume24h')
    t.string('volume7d')
    t.string('apr24h')
    t.string('apr7d')
    t.field('lastUpdated', { type: 'HSDateTime' })
  },
})
