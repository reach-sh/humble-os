/**
 * @file Pools.Service
 * Helpers for fetching Pool data from db
 */
import { PoolLiquidity, Prisma } from '@prisma/client'
import { FetchPoolData, formatCurrency } from '@reach-sh/humble-sdk'
import { DateTime } from 'luxon'
import { context } from '../context'
import {
  chainIdentifiers,
  ChainIdentifiers,
  GetByIdOpts,
  GetByLPTokenIdOpts,
  GetListOpts,
} from '../utils'
import excludePools from '../json-excludes/pools.json'

export type PoolByIdOpts = GetByIdOpts & { withLiquidity?: boolean }

type FilterPoolOpts = {
  tradeable?: boolean
  duplicate?: boolean
}
export type ListPoolOpts = GetListOpts & {
  announcerId?: string | null
  poolId?: string | null
  tokenAId?: string | null
  tokenBId?: string | null
  search?: boolean
  filterNetworkToken?: boolean
} & FilterPoolOpts
export type UpsertPoolOpts = FetchPoolData['pool'] &
  ChainIdentifiers &
  FilterPoolOpts & {
    announcerId: string
    apr7d?: string
    apr24h?: string
    volume7d?: string
    volume24h?: string
  }

const { PoolLiquidity: Liquidity, Pools: db } = context

export type PoolWithLiquidity = { PoolLiquidity: Partial<PoolLiquidity>[] }

/**
 * Convert an amount of LP Tokens to equivalent Token (`A or B`) amount
 * @param amt Formatted amount of LP tokens in atomic units
 * @param d.PoolLiquidity Pool Liquidity data
 * @param isTokA When true, calculate for pool's `Token A` value
 */
export function convertLPToTokenValue(
  amt: string,
  { PoolLiquidity }: PoolWithLiquidity,
  isTokA = false,
) {
  const [
    { mintedLiquidityTokens: minted, tokenABalance: A, tokenBBalance: B },
  ] = PoolLiquidity
  const fmt = (v?: string) => Number(formatCurrency(v))
  const userShareOfPool = fmt(amt) / fmt(minted)
  const conversion = Number(isTokA ? A : B) * userShareOfPool
  return isNaN(conversion) ? 0 : conversion
}

// Queries

/** Get latest pool liquidity */
export function getPoolById(opts: PoolByIdOpts) {
  const { id = null, withLiquidity = false } = opts
  if (!id) return null

  return db.findUnique({
    where: { id },
    include: {
      PoolLiquidity: withLiquidity && {
        take: 1,
        orderBy: { lastUpdated: 'desc' },
      },
    },
  })
}

export function getPoolByLPTokenId(opts: GetByLPTokenIdOpts) {
  const { poolTokenId } = opts
  if (!poolTokenId) return null

  return db.findFirst({
    where: { poolTokenId },
  })
}

/** Get latest pool liquidity */
export function getPoolLiquidity(opts: Pick<GetByIdOpts, 'id'>) {
  const { id: poolId } = opts

  return Liquidity.findFirst({
    where: { poolId },
    orderBy: { lastUpdated: 'desc' },
  })
}

/** Search for a list of `limit` liquidity pools */
export async function getPoolsList(opts: ListPoolOpts) {
  const {
    limit = 500,
    offset = 0,
    tokenAId,
    tokenBId,
    announcerId,
    filterNetworkToken,
    tradeable,
    duplicate,
  } = opts
  const dbArgs: Prisma.PoolFindManyArgs = {
    skip: offset,
    take: limit,
    where: {
      ...chainIdentifiers(opts),
      announcerId: announcerId || undefined,
      tradeable,
      duplicate,
    },
    include: {
      PoolLiquidity: { orderBy: { lastUpdated: 'desc' }, take: 1 },
    },
    orderBy: { id: 'asc' },
  }

  // If searching by tokenID, flip the order of tokens
  if (tokenAId || tokenBId) {
    // Search for both combinations of token ids
    if (opts.search) {
      dbArgs.where!.OR = [
        {
          AND: [
            { tokenAId: tokenAId || undefined },
            { tokenBId: tokenBId || undefined },
          ],
        },
        {
          AND: [
            { tokenAId: tokenBId || undefined },
            { tokenBId: tokenAId || undefined },
          ],
        },
      ]
    } else {
      dbArgs.where!.tokenAId = tokenAId || undefined
      dbArgs.where!.tokenBId = tokenBId || undefined
    }
  }

  if (filterNetworkToken) {
    dbArgs.where!.NOT = {
      tokenAId: '0',
    }
  }

  const pools = await db.findMany(dbArgs)
  const exclude = new Set(excludePools as string[])
  return pools.filter(({ id }) => !exclude.has(id))
}

/** Get last `N` pool liquidity */
export async function historicalPoolLiquidity(listOpts: ListPoolOpts) {
  const { poolId, limit = 25, startFromDate } = listOpts
  if (!poolId) return []
  const opts: Prisma.PoolLiquidityFindManyArgs = {
    where: { poolId },
    take: limit,
    orderBy: { lastUpdated: 'desc' },
  }

  if (startFromDate) {
    const d = DateTime.fromISO(startFromDate)
    if (d.isValid) opts.where!.lastUpdated = { gte: d.toJSDate() }
  }

  const result = await Liquidity.findMany(opts)
  return result
}

// Mutations
export async function upsertPool(args: UpsertPoolOpts) {
  const newPool: Prisma.PoolCreateInput = {
    id: args.poolAddress.toString(),
    announcerId: args.announcerId,
    poolTokenId: args.poolTokenId!.toString(),
    tokenADecimals: args.tokenADecimals!,
    tokenBDecimals: args.tokenBDecimals!,
    tokenAId: args.tokenAId.toString(),
    tokenBId: args.tokenBId.toString(),
    chain: args.chain,
    provider: args.provider,
    tradeable: args.tradeable,
    duplicate: args.duplicate,
  }

  // Update pool
  await db.upsert({
    where: { id: newPool.id },
    create: newPool,
    update: newPool,
  })

  const lastEntry = await getPoolLiquidity({ id: newPool.id })
  if (lastEntry === null) return upsertPoolLiquidity(args)

  // Create new liquidity item if new entry, or last entry's date-day was yesterday
  const { added } = lastEntry
  const latest = DateTime.fromJSDate(added)
  const now = DateTime.now()

  return latest.day === now.day
    ? upsertPoolLiquidity(args, lastEntry.id)
    : upsertPoolLiquidity(args)
}

export async function upsertPoolLiquidity(args: UpsertPoolOpts, id?: number) {
  const data = LiquidityInput(args)
  // Create historical liquidity every hour, otherwise update last entry
  await (id
    ? Liquidity.update({ data, where: { id } })
    : Liquidity.create({ data }))
  return getPoolById({ id: args.poolAddress, withLiquidity: true })
}

function LiquidityInput(args: UpsertPoolOpts): Prisma.PoolLiquidityCreateInput {
  const id = args.poolAddress.toString()
  return {
    mintedLiquidityTokens: args.mintedLiquidityTokens.toString(),
    tokenABalance: args.tokenABalance!.toString(),
    tokenBBalance: args.tokenBBalance!.toString(),
    tokenAFees: args.tokenAFees!.toString(),
    tokenBFees: args.tokenBFees!.toString(),
    apr7d: args.apr7d || '0',
    apr24h: args.apr24h || '0',
    volume7d: args.volume7d || '0',
    volume24h: args.volume24h || '0',
    lastUpdated: new Date().toISOString(),
    Pool: { connect: { id } },
  }
}
