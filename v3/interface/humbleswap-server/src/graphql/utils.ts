import { Blockchain, BlockchainProvider, Prisma } from '@prisma/client'
import {
  blockConstants,
  createReachAPI,
  getBlockchain,
  getNetworkProvider,
} from '@reach-sh/humble-sdk'
import { DateTime } from 'luxon'
import { arg, stringArg } from 'nexus'
import { PaginationArgs } from './inputs'

/** Query options: limit results to a particular chain and network */
export type ChainIdentifiers = {
  announcerId?: string | null
  chain: Blockchain
  provider: BlockchainProvider
}

/** General options for fetching an item by ID */
export type GetByIdOpts = { id: string } & Partial<ChainIdentifiers>

export type GetByLPTokenIdOpts = {
  poolTokenId: string
} & Partial<ChainIdentifiers>

/** General options for fetching a list of items */
export type GetListOpts = {
  limit?: number
  offset?: number
  startFromDate?: string
  ids?: string[]
} & ChainIdentifiers

export async function blockTimeToISO(val: string) {
  const stdlib = createReachAPI()
  const currentBlock = await getCurrentBlock()
  if (Number(currentBlock) < Number(val)) {
    return futureBlockToDate(val, currentBlock)
  }
  const t = stdlib.bigNumberify(val)
  const createdSecs = await stdlib.getTimeSecs(t).then(Number)
  return new Date(createdSecs * 1000).toISOString()
}

export async function getCurrentBlock() {
  const stdlib = createReachAPI()
  return stdlib.getNetworkTime().then(stdlib.bigNumberToNumber)
}

export async function futureBlockToDate(
  val: string,
  currBlock?: string | number,
) {
  try {
    const baseBlock = currBlock || (await getCurrentBlock())
    const blocksDiff = Number(val) - Number(baseBlock)
    const blockLengthMS = blockConstants(getBlockchain()).BLOCK_LENGTH * 1000
    return DateTime.now()
      .plus({ milliseconds: blocksDiff * blockLengthMS })
      .toISO()
  } catch (error) {
    return 'invalid block number'
  }
}

export function chainIdentifiers(args?: Partial<ChainIdentifiers>) {
  return {
    chain: args?.chain || getBlockchain(),
    provider: args?.provider || getNetworkProvider().toLowerCase(),
    announcerId: args?.announcerId || undefined,
  } as ChainIdentifiers
}

export function chainIdentifierArgs() {
  return {
    chain: arg({ type: 'HSBlockchain', default: 'ALGO' }),
    provider: arg({ type: 'HSBlockchainProvider', default: 'testnet' }),
    announcerId: stringArg(),
  }
}

/** Limit query ordering to a few table keys */
export function paginate(
  pagination: PaginationArgs | null,
  fields: string[] = [],
) {
  const {
    page = 1,
    limit = 25,
    orderBy: o,
    descending = false,
  } = pagination || {}
  const sortOrder = (key: string): Prisma.SortOrder | undefined => {
    if (o !== key) return undefined
    return descending ? 'desc' : 'asc'
  }
  const orderBy = fields.reduce((agg, f) => {
    agg[f] = sortOrder(f)
    return agg
  }, {} as Record<string, Prisma.SortOrder | undefined>)

  return { take: Math.min(limit, 100), skip: limit - limit * page, orderBy }
}

/**
 * Convert a JS date to a Luxon DateTime object
 * @param input JS date
 * @returns UTC string
 */
export function dateToUTCString(input: Date) {
  return DateTime.fromJSDate(input).toUTC().toString()
}

/** Map `proces.env.NODE_ENV` to a blockchain provider environment */
export function getServerEnvironment(): 'dev' | 'staging' | 'mainnet' {
  const env = process.env.NODE_ENV
  const map = {
    staging: 'staging',
    development: 'dev',
    production: 'mainnet',
  }
  return map[env as string]
}

/** HELPER | Missing fields error */
export function requiredFieldsError(fields: string) {
  return {
    __typename: 'ResponseErrorMessage',
    message: `Missing required fields "${fields}"`,
  }
}

/** HELPER | Missing fields error */
export function dbTransactionError(message: string) {
  return { __typename: 'ResponseErrorMessage', message }
}

/** HELPER | Last object in an array of objects
 * If used to get Latest Liquidity (farm, pool) item from list,
 * it asumes that "arr" is sorted ascending on lastUpdate
 * */
export function lastObjInArray(arr?: any[] | null) {
  if (!Array.isArray(arr) || !arr.length) return {}

  return arr[arr.length - 1]
}
