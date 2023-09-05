import { LimitOrderStatus, Prisma } from '@prisma/client'
import { getAnnouncers } from '@reach-sh/humble-sdk'
import logger from '../../logger'
import { context } from '../context'
import { ChainIdentifiers, GetByIdOpts, GetListOpts } from '../utils'

export type ListLimitOrderOpts = GetListOpts & {
  creator?: string
  tokenA?: string
  tokenB?: string
  status?: LimitOrderStatus
}

export type UpsertLimitOrderOpts = ChainIdentifiers & {
  announcerId: string
  /** amount A specified or requested in contract */
  amtA: string
  /** amount B specified or requested in contract */
  amtB: string
  /** Order application ID (available from stream) */
  contractId?: string
  /** Order creator (available from stream) */
  creator?: string
  tokenA: string
  tokenB: string
  tokenADecimals: number
  tokenBDecimals: number
}

const { LimitOrders } = context

/** Change status of a `LimitOrder` to close/open */
export async function changeOrderStatus(id: string, status: LimitOrderStatus) {
  const where = { contractId: id }
  const order = await LimitOrders.findUnique({ where })
  return order ? LimitOrders.update({ where, data: { status } }) : null
}

/** Find a unique `LimitOrder` */
export async function getLimitOrderById(opts: GetByIdOpts) {
  return LimitOrders.findUnique({ where: { contractId: opts.id } })
}

/** List `LimitOrders` using provided filters */
export async function listLimitOrders(opts: ListLimitOrderOpts) {
  const defaultAnnouncer = getAnnouncers().limitOrderAnnouncer
  if (!defaultAnnouncer) {
    logger.error("Call to 'listLimitOrders' but no LimitOrder Announcer set")
    return []
  }

  const { announcerId: optsAnnouncer, limit = 500, offset = 0 } = opts
  const announcer = (optsAnnouncer || defaultAnnouncer).toString()
  const searchInput: Prisma.LimitOrderFindManyArgs = {
    where: { announcerId: announcer },
    take: limit,
    skip: offset,
    orderBy: { contractId: 'desc' }, // newest to oldest
  }
  if (opts.tokenA) searchInput.where!.tokenA = opts.tokenA
  if (opts.tokenB) searchInput.where!.tokenB = opts.tokenB
  if (opts.creator) searchInput.where!.creator = opts.creator
  if (opts.status) searchInput.where!.status = opts.status

  return LimitOrders.findMany(searchInput)
}

/** Add a `LimitOrder` to the db */
export async function upsertLimitOrder(opts: UpsertLimitOrderOpts) {
  if (!opts.contractId || !opts.creator) return

  const data: Prisma.LimitOrderCreateInput = {
    amtA: opts.amtA,
    amtB: opts.amtB,
    contractId: opts.contractId,
    creator: opts.creator,
    tokenA: opts.tokenA,
    tokenADecimals: opts.tokenADecimals,
    tokenB: opts.tokenB,
    tokenBDecimals: opts.tokenBDecimals,
    announcerId: opts.announcerId,
    chain: opts.chain,
    status: 'open',
    provider: opts.provider,
  }

  return LimitOrders.upsert({
    where: { contractId: opts.contractId },
    create: data,
    update: data,
  })
}
