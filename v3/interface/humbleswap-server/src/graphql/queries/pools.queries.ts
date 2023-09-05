import { intArg, list, nonNull, queryField, stringArg, booleanArg } from 'nexus'
import * as Pools from '../services/Pools.service'
import { GetByIdOpts, GetByLPTokenIdOpts, chainIdentifierArgs } from '../utils'

const getByIdArgs = {
  id: nonNull(stringArg()),
  ...chainIdentifierArgs(),
}

const getByLPTokenArgs = {
  ...chainIdentifierArgs(),
  poolTokenId: nonNull(stringArg()),
}
const getListArgs = {
  ...chainIdentifierArgs(),
  limit: intArg(),
  offset: intArg({ default: 0 }),
  announcerId: stringArg(),
  tradeable: booleanArg(),
  duplicate: booleanArg(),
}

/** Fetch a single Pool */
export const getPool = queryField('getPool', {
  type: 'HSPool',
  args: getByIdArgs,
  async resolve(_, args) {
    const opts = { ...args, withLiquidity: true } as Pools.PoolByIdOpts
    return Pools.getPoolById(opts)
  },
})

export const getPoolByLPToken = queryField('getPoolByLPToken', {
  type: 'HSPool',
  args: getByLPTokenArgs,
  async resolve(_, args) {
    const opts = { ...args } as GetByLPTokenIdOpts
    return Pools.getPoolByLPTokenId(opts)
  },
})

/** Fetch liquidity for a single Pool */
export const getPoolLiquidity = queryField('getPoolLiquidity', {
  type: 'HSPoolLiquidity',
  args: getByIdArgs,
  async resolve(_, args) {
    return Pools.getPoolLiquidity(args as GetByIdOpts)
  },
})

/** Get user's staked amount in round at time */
export const getLPTokenValue = queryField('getLPTokenValue', {
  type: list('String'),
  args: {
    assetId: nonNull('String'),
    assetBalance: nonNull('String'),
  },
  async resolve(_, args, { Pools: PoolsDB }) {
    const { assetId, assetBalance } = args
    const pool = await PoolsDB.findFirst({
      where: { poolTokenId: assetId },
      select: {
        PoolLiquidity: {
          select: {
            mintedLiquidityTokens: true,
            tokenABalance: true,
            tokenBBalance: true,
            lastUpdated: true,
          },
          orderBy: { lastUpdated: 'desc' },
          take: 1,
        },
      },
    })

    return pool
      ? [
          Pools.convertLPToTokenValue(assetBalance, pool, true).toString(),
          Pools.convertLPToTokenValue(assetBalance, pool).toString(),
        ]
      : ['0', '0']
  },
})

/** Fetch a few days of liquidity for a single Pool */
export const getHistoricalPoolLq = queryField('getHistoricalPoolLiquidity', {
  type: list('HSPoolLiquidity'),
  args: { ...getByIdArgs, startFromDate: stringArg() },
  async resolve(_, { id, ...rest }) {
    const opts = { poolId: id, ...rest }
    return Pools.historicalPoolLiquidity(opts as Pools.ListPoolOpts)
  },
})

/** Fetch a list of Pools containing the network token (ALGO/ETH/SOL/etc) */
export const listNetworkTokenPools = queryField('listNetworkTokenPools', {
  type: list('HSPool'),
  args: { ...getListArgs },
  async resolve(_, args) {
    const offset = Math.max(args.offset || 0, 0)
    const opts = { ...args, offset, tokenAId: '0' }
    return Pools.getPoolsList(opts as Pools.ListPoolOpts)
  },
})

/** Fetch a list of Pools not containing the network token (ALGO/ETH/SOL/etc) */
export const listNonNetworkTokenPools = queryField('listNonNetworkTokenPools', {
  type: list('HSPool'),
  args: { ...getListArgs },
  async resolve(_, args) {
    const offset = Math.max(args.offset || 0, 0)
    const opts = { ...args, offset, filterNetworkToken: true }
    return Pools.getPoolsList(opts as Pools.ListPoolOpts)
  },
})

/** Fetch a list of Pools */
export const listPools = queryField('listPools', {
  type: list('HSPool'),
  args: {
    tokenAId: stringArg(),
    tokenBId: stringArg(),
    ...getListArgs,
  },
  async resolve(_, args) {
    const opts = {
      ...args,
      offset: Math.max(args.offset || 0, 0),
      tradeable: true,
    }
    return Pools.getPoolsList(opts as Pools.ListPoolOpts)
  },
})

/** Search for Pools containing one or two tokens */
export const searchPools = queryField('searchPools', {
  type: list('HSPool'),
  args: {
    token1: stringArg(),
    token2: stringArg(),
    ...getListArgs,
  },
  async resolve(_, { token1, token2, ...rest }) {
    return Pools.getPoolsList({
      ...rest,
      tokenAId: token1,
      tokenBId: token2,
      offset: Math.max(rest.offset || 0, 0),
      search: true,
    } as Pools.ListPoolOpts)
  },
})
