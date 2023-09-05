import Dexie from 'dexie'
import { getCurrentNetwork } from 'helpers/getReach'
import { HSLimitOrder } from 'types/response'
import { ListQueryOpts } from 'types/shared'
import { paginate } from './shared'

type DBLimitOrder = { connector: string } & HSLimitOrder

class LimitOrdersDB extends Dexie {
  public limitOrders: Dexie.Table<DBLimitOrder, string>

  constructor() {
    super('LimitOrdersDB')
    const limitOrderColumns = [
      'contractId',
      'creator',
      'connector',
      'tokenA',
      'tokenB',
      'amtA',
      'amtB',
      'status',
    ]

    const limitOrders = limitOrderColumns.toString()
    this.version(4).stores({ limitOrders })
    this.limitOrders = this.table('limitOrders')
  }
}

const db = new LimitOrdersDB()

const limitOrdersDBAPI = {
  getItem: getLimitOrderById,
  putItem: putLimitOrder,
  removeItem: removeLimitOrder,
  listItems,
}

export default limitOrdersDBAPI

async function putLimitOrder(id: string, data: HSLimitOrder) {
  if (!data.creator) return id
  const contractId = id || data.contractId?.toString()

  return db.limitOrders.put(
    {
      contractId,
      tokenA: data.tokenA || '0',
      tokenB: data.tokenB || '0',
      creator: data.creator,
      amtA: data.amtA,
      amtB: data.amtB,
      tokenADecimals: data.tokenADecimals,
      tokenBDecimals: data.tokenBDecimals,
      connector: getCurrentNetwork(),
      status: data.status,
    },
    contractId,
  )
}

async function removeLimitOrder(id: string) {
  const exists = await getLimitOrderById(id)
  if (exists) await db.limitOrders.delete(`${id}`)
  return id
}

export async function clearOrdersTable() {
  await db.limitOrders.clear()
}

export async function listItems(opts: ListQueryOpts) {
  const dbOrders = await db.limitOrders.toArray()
  return paginate(dbOrders, opts)
}

/** Get a single pool by its contract address */
export async function getLimitOrderById(id: string) {
  // cast IDs to string for maximum cross-chain compatibility
  const limitOrder = await db.limitOrders.where({ contractId: id }).first()
  return limitOrder || null
}
