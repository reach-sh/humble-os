/**
 * @file Tokens.Service
 * Helpers for fetching token data from db
 */
import { Blockchain, BlockchainProvider, Prisma } from '@prisma/client'
import { ChainSymbol, getNetworkProvider } from '@reach-sh/humble-sdk'
import {
  NETWORKS,
  peraTokenMetadata,
  ReachToken,
  TokenVerificationTier,
} from '@reach-sh/humble-sdk/lib/reach-helpers'
import axios from 'axios'
import logger from '../../logger'
import { context } from '../context'
import {
  chainIdentifiers,
  ChainIdentifiers,
  GetByIdOpts,
  GetListOpts,
} from '../utils'
import { globalReachAccount } from './Reach.service'

const { Tokens: db } = context
export type TokenSearchOpts = Partial<ChainIdentifiers> & {
  id?: string | null
  symbol?: string | null
  name?: string | null
}

/** Generate URL for fetching account with largest balance of `asset` */
const getBalanceTokenLink = (id: string) => {
  const { provider } = chainIdentifiers()
  const prefix = provider === 'mainnet' ? '' : `${provider}.`
  const baseURL = `https://indexer.${prefix}algoexplorerapi.io/stats/v2`
  return `${baseURL}/accounts/rich-list?limit=1&asset-id=${id}`
}

export async function fetchPrimaryTokenBalance(assetId?: string) {
  if (!assetId) return '0'
  const asset = await axios
    .get(getBalanceTokenLink(assetId))
    .then((res) => res.data)
    .catch(() => {
      logger.error(`Failed to fetch primary balance for ${assetId}`)
      return { accounts: [{ balance: 0 }] }
    })
  const { accounts = [] } = asset || {}
  const balance = Array.isArray(accounts) ? accounts[0]?.balance || 0 : 0
  return balance.toString()
}

export async function getTokenById(opts: GetByIdOpts) {
  const { id, chain = 'ALGO' } = opts
  if (id === '0') return makeNetworkToken(chain)
  const dbToken = await db.findFirst({ where: { id, chain } })
  if (dbToken) return dbToken

  const peraToken = await peraTokenMetadata(id, globalReachAccount(), false)
  return peraToken
    ? upsertToken({ ...peraToken, ...chainIdentifiers(opts) })
    : null
}

/** List Tokens */
export async function getTokensList(opts: GetListOpts) {
  const {
    limit: take = 2500,
    offset: skip = 0,
    chain = 'ALGO',
    provider = 'testnet',
    ids = [],
  } = opts
  const where: Prisma.TokenWhereInput = { chain, provider }
  if (ids.length) where.id = { in: ids }
  return db.findMany({ where, take, skip })
}

/** Search for Tokens by one or more criteria */
export async function searchTokensByCriteria(opts: TokenSearchOpts) {
  const cid = chainIdentifiers()
  const { chain = cid.chain, provider = cid.provider, id, name, symbol } = opts
  if (!id && !name && !symbol) return []
  if (id === '0') return [makeNetworkToken(chain)]

  const where: Prisma.TokenWhereInput = { chain, provider }
  if (id && id.length > 2) where.id = { startsWith: id }
  if (name && name.length > 2) where.name = { startsWith: name }
  if (symbol && symbol.length > 2) where.symbol = { startsWith: symbol }
  if (Object.keys(where).length === 2) return []

  return db.findMany({ where, take: 100 })
}

/**
 * @internal
 * Create a Network `Token` representation for the current chain  */
export function makeNetworkToken(chain: string) {
  return {
    id: '0',
    name: chain,
    symbol: chain,
    url: '',
    decimals: NETWORKS[chain as ChainSymbol].decimals || 18,
    supply: '0',
    verified: true,
    verificationTier: 'trusted' as TokenVerificationTier,
    chain: chain as Blockchain,
    provider: getNetworkProvider() as BlockchainProvider,
  }
}

//= =======================================================
// Mutations
//= =======================================================
type UpsertTokenOpts = ReachToken & ChainIdentifiers

export async function upsertToken(opts: UpsertTokenOpts) {
  const data: Prisma.TokenCreateInput = {
    id: opts.id.toString(),
    decimals: opts.decimals,
    name: opts.name,
    supply: opts.supply.toString(),
    symbol: opts.symbol,
    url: opts.url || '',
    verificationTier: opts.verificationTier,
    verified: opts.verified,
    chain: opts.chain,
    provider: opts.provider,
  }

  return db.upsert({
    where: { id: data.id },
    create: data,
    update: data,
  })
}
