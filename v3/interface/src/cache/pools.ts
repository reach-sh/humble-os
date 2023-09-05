import Dexie from 'dexie'
import { ADIDBInterface, ListQueryOpts, PaginatedDBResults } from 'types/shared'
import { useReach } from 'helpers/getReach'
import { getBlockchain } from '@reach-sh/humble-sdk'
import { paginate } from './shared'

class PoolsDB extends Dexie {
  public pools: Dexie.Table<DBPool, string>

  constructor() {
    super('PoolsDB')

    const poolColumns = [
      'addr',
      'tokenId',
      'connector',
      'liquidity',
      'mintedLPTokens',
      'lastUpdated',
      'tokABalance',
      'tokBBalance',
      'tokAId',
      'tokBId',
      'tokenAFees',
      'tokenBFees',
    ]

    const pools = poolColumns.toString()
    this.version(4).stores({ pools })
    this.pools = this.table('pools')
  }
}

const db = new PoolsDB()

const poolsDBAPI: ADIDBInterface<DBPool | any> = {
  getItem: getPoolById,
  listItems: listPools,
  putItem: addOrUpdatePool,
  removeItem: removePool,
}

export default poolsDBAPI

/** Add or update a Pool in the cache */
async function addOrUpdatePool(id: any, data: DBUIPool) {
  const connector = getBlockchain()
  const dbPool: any = {
    connector,
    addr: id || data.poolAddr,
    tokenId: data.poolTokenId,
    lastUpdated: data.lastUpdated,
    tokABalance: data.tokABalance,
    tokBBalance: data.tokBBalance,
    mintedLPTokens: data.mintedLiquidityTokens,
    liquidity: data.liquidityAmount,
    tokenAFees: data.tokenAFees,
    tokenBFees: data.tokenBFees,
  }

  if (data.tokAId) dbPool.tokAId = data.tokAId
  if (data.tokBId) dbPool.tokBId = data.tokBId

  return db.pools.put(dbPool, `${id || dbPool.addr}`).then(() => data)
}

/** Get a single pool by its contract address */
export async function getPoolById(id: string | number) {
  // cast IDs to string for maximum cross-chain compatibility
  const addr = id.toString()
  const pool = await db.pools.where({ addr }).first()
  if (!pool) return null

  return makeUIPool(pool, pool.tokAId, pool.tokBId)
}

/** List all pools (and fetch their tokens) */
export async function listPools(
  opts: ListQueryOpts,
): Promise<PaginatedDBResults<DBUIPool>> {
  // Pagination
  const done = (res: DBPool[]) =>
    paginate(
      res.map((p) => makeUIPool(p, p.tokAId, p.tokBId)),
      opts,
    )

  if (opts.where) {
    const res = await db.pools.where(opts.where).first()
    return res ? done([res]) : done([])
  }

  const dbPools = await db.pools.toArray()
  return done(dbPools.filter((pool) => pool !== undefined))
}

/** Remove a Pool from cache */
export async function removePool(poolId: string) {
  await db.pools.delete(poolId)
  return poolId
}

export async function clearPoolTable() {
  await db.pools.clear()
}

/** Create a UI-compatible object to return */
function makeUIPool(
  data: DBPool,
  tokAId: string | number | null,
  tokBId: string | number | null,
): DBUIPool {
  const { connector } = useReach()
  return {
    connector,
    poolAddr: data.addr,
    lastUpdated: data.lastUpdated,
    liquidityAmount: data.liquidity,
    mintedLiquidityTokens: data.mintedLPTokens,
    poolTokenId: data.tokenId,
    tokAId,
    tokABalance: data.tokABalance,
    tokBId,
    tokBBalance: data.tokBBalance,
    tokenAFees: data.tokenAFees,
    tokenBFees: data.tokenBFees,
  }
}

type DBPoolBase = {
  /** Currently-selected blockchain */
  connector: string
  /** Last update (unix timestamp in seconds) */
  lastUpdated: number
  /** Balance of Pool Token `A` */
  tokABalance: number
  /** Balance of Pool Token `B` */
  tokBBalance: number
}

type DBPool = {
  /** Pool contract address */
  addr: string
  /** Pool Liquidity token */
  tokenId: number
  /** Amount of Liquidity in pool */
  liquidity: number
  /** Minted liquidity tokens at last update */
  mintedLPTokens: number
  /** Pool Token `A` ID */
  tokAId: number | string | null
  /** Pool Token `B` ID */
  tokBId: number | string | null
  /** Total fees collected for token A */
  tokenAFees: number
  /** Total fees collected for token B */
  tokenBFees: number
} & DBPoolBase

export type DBUIPool = {
  /** Pool contract address */
  poolAddr: string
  /** Pool Liquidity token */
  poolTokenId: number
  /** Amount of Liquidity in pool */
  liquidityAmount: number
  /** Minted liquidity tokens at last update */
  mintedLiquidityTokens: number
  /** Pool Token `A` */
  tokAId: string | number | null
  /** Pool Token `B` */
  tokBId: string | number | null
  /** Total fees collected for token A */
  tokenAFees: number
  /** Total fees collected for token B */
  tokenBFees: number
} & DBPoolBase
