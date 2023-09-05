import Dexie from 'dexie'
import { ListQueryOpts } from 'types/shared'
import { getCurrentNetwork } from 'helpers/getReach'
import { getPoolById } from './pools'
import { paginate } from './shared'

export type DBLiquidityPool = {
  poolAddr: string | number
  connector: string
}

class LiquidityPoolsDB extends Dexie {
  public liquidityPools: Dexie.Table<DBLiquidityPool, string>

  constructor() {
    super('LiquidityPoolsDB')

    const liquidityPools = 'poolAddr,connector'
    this.version(1).stores({ liquidityPools })
    this.liquidityPools = this.table('liquidityPools')
  }
}

const db = new LiquidityPoolsDB()

const liquidityPoolsDBAPI = {
  getItem: getLiquidityPool,
  putItem: putLiquidityPool,
  removeItem: removeLiquidityPool,
  listItems,
}

export default liquidityPoolsDBAPI

export async function getLiquidityPool(poolAddr: string | number) {
  const exists = await db.liquidityPools.where({ poolAddr }).first()
  if (exists) return getPoolById(poolAddr)
  return null
}

async function putLiquidityPool(_: any, addr: string) {
  const poolAddr = `${addr}`
  const pool = {
    poolAddr: addr,
    connector: getCurrentNetwork(),
  }
  await db.liquidityPools.put(pool, poolAddr)
  return poolAddr
}

async function removeLiquidityPool(poolAddr: string) {
  await db.liquidityPools.delete(`${poolAddr}`)
  return poolAddr
}

export async function clearLPPoolTable() {
  await db.liquidityPools.clear()
}

export async function listItems(opts: ListQueryOpts) {
  const items = await db.liquidityPools.toArray()
  return paginate(items, opts)
}
