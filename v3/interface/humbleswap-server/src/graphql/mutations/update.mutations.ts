import { Farm, LimitOrder, Pool } from '@prisma/client'
import { getAnnouncers } from '@reach-sh/humble-sdk/lib/constants'
import { DateTime } from 'luxon'
import { mutationField, nonNull, stringArg } from 'nexus'
import logger from '../../logger'
import { refreshFarm } from '../../reach/listener.farms'
import {
  processLimitOrders,
  refreshLimitOrder,
} from '../../reach/listener.limit-orders'
import { refreshPool } from '../../reach/listener.pools'
import { context } from '../context'
import { chainIdentifiers } from '../utils'

/** Update everything */
export const update = mutationField('update', {
  type: 'String',
  args: { auth: nonNull(stringArg()) },
  async resolve(_, { auth }) {
    if (auth !== process.env.AGN_TOKEN) return 'UNAUTHORIZED'
    const [poolIds, farmIds, limitOrderIds] = await Promise.all([
      getPoolIds(),
      getFarmIds(),
      getLimitOrderIds(),
    ])

    Promise.all([
      updatePools(poolIds),
      updateFarms(farmIds),
      updateLimitOrders(limitOrderIds),
    ])
    return 'OK'
  },
})

async function getPoolIds() {
  const { poolAnnouncer } = getAnnouncers()
  if (!poolAnnouncer) return []

  const announcerId = poolAnnouncer.toString()
  return context.Pools.findMany({
    select: { id: true, tokenAId: true, tokenBId: true },
    where: { ...chainIdentifiers(), announcerId, tradeable: true },
  })
}

async function getLimitOrderIds() {
  const { limitOrderAnnouncer } = getAnnouncers()
  if (!limitOrderAnnouncer) return []

  const announcerId = limitOrderAnnouncer.toString()
  return context.LimitOrders.findMany({
    select: { contractId: true, tokenA: true, tokenB: true },
    where: { ...chainIdentifiers(), announcerId, status: 'open' },
  })
}

async function getFarmIds() {
  const { partnerFarmAnnouncer, publicFarmAnnouncer } = getAnnouncers()
  const farmAnnouncers = [
    partnerFarmAnnouncer?.toString(),
    publicFarmAnnouncer?.toString(),
  ].filter(Boolean) as string[]

  return context.Farms.findMany({
    select: { id: true, stakedTokenId: true },
    where: {
      ...chainIdentifiers(),
      announcerId: { in: farmAnnouncers },
      endDate: { gte: DateTime.now().toJSDate() },
    },
  })
}

async function updatePools(
  pools: Pick<Pool, 'id' | 'tokenAId' | 'tokenBId'>[],
) {
  const now = new Date().toISOString()
  logger.info(`Updating ${pools.length} pools at ${now} ...`)

  // SWAP-1289
  const updatedPools = pools.map(({ tokenAId, tokenBId, id }) =>
    refreshPool(id, tokenAId, tokenBId),
  )

  // Resolve all updates and attempt to fill limit orders with pools
  Promise.all(updatedPools).then(processLimitOrders)
}

/** Update Farms */
async function updateFarms(farms: Pick<Farm, 'id' | 'stakedTokenId'>[]) {
  const now = new Date().toISOString()
  logger.info(`Updating ${farms.length} farms at ${now} ...`)
  farms.forEach(({ id, stakedTokenId }) => refreshFarm(id, stakedTokenId))
}

/** Update Limit Orders */
async function updateLimitOrders(
  orders: Pick<LimitOrder, 'contractId' | 'tokenA' | 'tokenB'>[],
) {
  const now = new Date().toISOString()
  logger.info(`Updating ${orders.length} limit orders at ${now} ...`)
  orders.forEach((o) => refreshLimitOrder(o.contractId, o.tokenA, o.tokenB))
}
