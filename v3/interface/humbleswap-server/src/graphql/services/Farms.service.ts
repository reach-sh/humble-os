/**
 * @file Farms.Service
 * Helpers for fetching Farm data from db
 */
import { Prisma } from '@prisma/client'
import { SDKFarmView, StaticFarmDataFormatted } from '@reach-sh/humble-sdk'
import { DateTime } from 'luxon'
import { context } from '../context'
import {
  ChainIdentifiers,
  GetByIdOpts,
  GetListOpts,
  blockTimeToISO,
} from '../utils'
import excludeFarms from '../json-excludes/farms.json'

export type FarmByIdOpts = GetByIdOpts & { withLiquidity?: boolean }
export type ListFarmOpts = GetListOpts & { farmId: string }
export type SearchFarmsByStakedTokensOpts = GetListOpts & {
  stakedTokenIds: string[]
}

export type UpsertFarmOpts = {
  announcerId: string
  isPartnerFarm: boolean
  primaryStakeTokenBalance: string
} & StaticFarmDataFormatted &
  ChainIdentifiers &
  Pick<SDKFarmView, 'totalRewards' | 'remainingRewards' | 'totalStaked'>

const UPDATE_INTERVAL_MIN = 60
const { FarmLiquidity: Liquidity, Farms: db } = context

/** Get farm */
export function getFarmById({ id, withLiquidity = false }: FarmByIdOpts) {
  return db.findUnique({
    where: { id },
    include: {
      FarmLiquidity: withLiquidity && {
        take: 1,
        orderBy: { lastUpdated: 'desc' },
      },
    },
  })
}

/** Get latest farm liquidity */
export async function getFarmLiquidity({ id }: GetByIdOpts) {
  return Liquidity.findFirst({
    where: { farmId: id },
    orderBy: { lastUpdated: 'desc' },
  })
}

/** List `limit` farms */
export async function getFarmsList({
  limit = 500,
  chain = 'ALGO',
  provider = 'testnet',
}: ListFarmOpts) {
  const opts: Prisma.FarmFindManyArgs = {
    take: limit,
    where: { chain, provider },
    include: { FarmLiquidity: true },
    orderBy: { id: 'desc' },
  }

  return db.findMany(opts)
}

/** List `limit` farms */
export async function getActiveFarmsList({
  limit = 500,
  chain = 'ALGO',
  provider = 'testnet',
}: ListFarmOpts) {
  const opts: Prisma.FarmFindManyArgs = {
    take: limit,
    where: {
      chain,
      AND: { provider, endDate: { gte: new Date() } },
    },
    include: { FarmLiquidity: true },
    orderBy: { id: 'desc' },
  }

  return db.findMany(opts)
}

/** List `limit` farms */
export async function getUpcomingFarmsList({
  limit = 500,
  chain = 'ALGO',
  provider = 'testnet',
}: ListFarmOpts) {
  const opts: Prisma.FarmFindManyArgs = {
    take: limit,
    where: {
      chain,
      AND: { provider, startDate: { gte: new Date() } },
    },
    include: { FarmLiquidity: true },
    orderBy: { id: 'desc' },
  }

  return db.findMany(opts)
}

/** List `limit` farms */
export async function getEndedFarmsList({
  limit = 500,
  chain = 'ALGO',
  provider = 'testnet',
}: ListFarmOpts) {
  const opts: Prisma.FarmFindManyArgs = {
    take: limit,
    where: { chain, provider, endDate: { lt: new Date() } },
    include: { FarmLiquidity: true },
    orderBy: { id: 'desc' },
  }

  return db.findMany(opts)
}

/** Get last `N` farm liquidity */
export async function historicalFarmLiquidity({
  farmId,
  limit = 25,
  startFromDate,
}: ListFarmOpts) {
  const opts: Prisma.FarmLiquidityFindManyArgs = {
    where: { farmId },
    take: limit,
    orderBy: { lastUpdated: 'desc' },
  }

  if (startFromDate) {
    const d = DateTime.fromISO(startFromDate)
    if (d.isValid) opts.where!.lastUpdated = { gte: d.toJSDate() }
  }

  return Liquidity.findMany(opts)
}

export async function searchFarmByStakeToken({
  stakedTokenIds,
}: SearchFarmsByStakedTokensOpts) {
  const opts: Prisma.FarmFindManyArgs = {
    where: {
      stakedTokenId: {
        in: stakedTokenIds,
      },
    },
    orderBy: { id: 'desc' },
  }

  return db.findMany(opts)
}

export async function upsertFarm(args: UpsertFarmOpts) {
  if (excludeFarms.includes(args.ctcInfo)) return
  const { asDefaultNetworkToken, asRewardToken } = args.rewardsPerBlock
  const startBlock = args.startBlock.toString()
  const endBlock = args.endBlock.toString()
  const [startDate, endDate] = await Promise.all([
    blockTimeToISO(startBlock),
    blockTimeToISO(endBlock),
  ])
  const newFarm: Prisma.FarmCreateInput = {
    id: args.ctcInfo,
    announcerId: args.announcerId,
    startBlock,
    endBlock,
    rewardTokenDecimals: args.rewardTokenDecimals,
    rewardTokenId: args.rewardTokenId,
    rewardTokenSymbol: args.rewardTokenSymbol,
    stakedTokenDecimals: args.stakedTokenDecimals,
    stakedTokenId: args.stakedTokenId,
    stakedTokenSymbol: args.stakedTokenSymbol,
    stakedTokenTotalSupply: args.stakedTokenTotalSupply,
    // computed
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    // rewards
    networkRewardsPerBlock: asDefaultNetworkToken,
    rewardTokenRewardsPerBlock: asRewardToken,
    // pool (optional)
    stakedTokenPoolId: args.stakedTokenPoolId,
    totalRewardA: args.totalRewards.network,
    totalRewardB: args.totalRewards.rewardToken,
    isPartnerFarm: args.isPartnerFarm,
    // housekeeping
    chain: args.chain,
    provider: args.provider,
  }

  // Update pool
  await db.upsert({
    where: { id: newFarm.id },
    create: newFarm,
    update: newFarm,
  })

  const lastEntry = await getFarmLiquidity({ id: newFarm.id })

  // Create new liquidity item if new entry
  if (lastEntry === null) return upsertPoolLiquidity(args)
  // Otherwise only create if it is over an hour
  const { added } = lastEntry
  const latest = DateTime.fromJSDate(added)
  const now = DateTime.now()
  const diff = now.diff(latest, 'minutes').minutes

  return diff <= UPDATE_INTERVAL_MIN
    ? upsertPoolLiquidity(args, lastEntry.id)
    : upsertPoolLiquidity(args)
}

export async function upsertPoolLiquidity(args: UpsertFarmOpts, id?: number) {
  const data = LiquidityInput(args)
  // Create historical liquidity every hour, otherwise update last entry
  return id
    ? Liquidity.update({ data, where: { id } })
    : Liquidity.create({ data })
}

function LiquidityInput(args: UpsertFarmOpts): Prisma.FarmLiquidityCreateInput {
  const id = args.ctcInfo
  return {
    primaryStakeTokenBalance: args.primaryStakeTokenBalance,
    remainingRewardA: args.remainingRewards[0],
    remainingRewardB: args.remainingRewards[1],
    totalStaked: args.totalStaked,
    lastUpdated: new Date().toISOString(),
    Farm: { connect: { id } },
  }
}
