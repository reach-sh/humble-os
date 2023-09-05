import { PrismaClient } from '@prisma/client'

export interface GQLContext {
  db: PrismaClient
  Pools: PrismaClient['pool']
  PoolLiquidity: PrismaClient['poolLiquidity']
  Farms: PrismaClient['farm']
  FarmLiquidity: PrismaClient['farmLiquidity']
  Tokens: PrismaClient['token']
  LimitOrders: PrismaClient['limitOrder']
}

const db = new PrismaClient()

export const context: GQLContext = {
  db,
  Pools: db.pool,
  PoolLiquidity: db.poolLiquidity,
  Farms: db.farm,
  FarmLiquidity: db.farmLiquidity,
  Tokens: db.token,
  LimitOrders: db.limitOrder,
}
