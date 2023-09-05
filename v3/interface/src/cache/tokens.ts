import Dexie from 'dexie'
import { ADIDBInterface, PaginatedDBResults } from 'types/shared'
import { getCurrentNetwork } from 'helpers/getReach'

export type DBUIToken = {
  id?: string | number
  balance?: string | number
  name: string
  symbol: string
  supply?: string
  custom?: boolean
  decimals: number
  minBalance?: number
  verified?: boolean
  verificationTier?: 'trusted' | 'verified' | 'suspicious' | 'unverified'
}

type DBToken = { connector: string } & DBUIToken

class TokensDB extends Dexie {
  public tokens: Dexie.Table<DBToken, string>

  constructor() {
    super('TokensDB')

    const tokens =
      'id,name,balance,symbol,supply,connector,custom,decimals,verified,verificationTier'
    this.version(3).stores({ tokens })
    this.tokens = this.table('tokens')
  }
}

const db = new TokensDB()

export const clearTokBals = () =>
  db.tokens.toCollection().modify((tok) => {
    // eslint-disable-next-line no-param-reassign
    tok.balance = '0'
  })

const tokensDBAPI: ADIDBInterface<DBUIToken> = {
  getItem: getToken,
  putItem: putToken,
  removeItem: removeToken,
  listItems,
}

export default tokensDBAPI

export async function getToken(tokenId: string | number) {
  const id = tokenId.toString()
  const token =
    id === '0'
      ? await db.tokens.where({ id: '0' }).first()
      : await db.tokens.where({ id }).first()
  return token || null
}

export async function putToken(tokenId: any, token: DBToken) {
  const id = (tokenId || token.id).toString()
  const existing = (await getToken(id)) || {}
  const data: DBToken = {
    ...existing,
    ...token,
    connector: getCurrentNetwork(),
    custom: token.custom || false,
  }

  await db.tokens.put(data, id || token.id)
  return token
}

export async function removeToken(tokenId: string) {
  await db.tokens.delete(tokenId)
  return tokenId
}

export async function clearTokenTable() {
  await db.tokens.clear()
}

export async function listItems(): Promise<PaginatedDBResults<DBUIToken>> {
  const connector = getCurrentNetwork()
  const res = await db.tokens.where({ connector }).sortBy('name')
  const tokens = res.map(makeUIToken)
  return {
    data: tokens,
    page: 1,
    totalResults: res.length,
  }
}

/** Create a UI-friendly `Token` representation  */
function makeUIToken(data: DBToken): DBUIToken {
  return {
    id: data.id,
    balance: data.balance,
    custom: data.custom || false,
    name: data.name,
    symbol: data.symbol,
    supply: data.supply,
    decimals: data?.decimals,
    minBalance: data?.minBalance || 0,
    verified: data?.verified || false,
    verificationTier: data?.verificationTier || 'unverified',
  }
}
