import { tokenBalance, peraTokenMetadata } from '@reach-sh/humble-sdk'
import {
  formatTokenMetadata,
  makeNetworkToken,
  parseAddress,
} from 'reach/utils'
import {
  ListQueryOpts,
  PaginatedDBResults,
  ReachAccount,
  Token,
} from 'types/shared'
import { getMinBalance } from 'helpers/user'
import { getCurrentNetwork } from 'helpers/getReach'
import cacheReducer from 'state/cacheReducer'

const isNetworkToken = (v: any) => [0, '0', null].includes(v)

export function paginate<T>(
  results: T[],
  opts: ListQueryOpts,
): PaginatedDBResults<T> {
  const totalResults = results.length
  if (!opts.resultsPerPage && !opts.page) return { data: results, totalResults }

  const { resultsPerPage = 20, page = 1 } = opts
  const start = page * resultsPerPage
  const data = results.slice(start - 1, resultsPerPage)
  const totalPages = Math.floor(results.length / resultsPerPage)

  return {
    data,
    page,
    resultsPerPage,
    totalPages,
    totalResults,
  }
}

/** Fetch token metadata from cache (or fetch and cache) */
export async function tokenMetadata(
  tokenId: any,
  acc: ReachAccount,
  cacheResponse?: boolean,
): Promise<Token> {
  const fallbackFetch = async () => fetchTokenForCache(acc, tokenId)
  const remoteFetch: () => Promise<Token> =
    cacheResponse === false
      ? fallbackFetch
      : cacheReducer.tokens.get(tokenId.toString(), fallbackFetch)
  const [metadata, bigBalance] = await Promise.all([
    remoteFetch(),
    cacheResponse === false
      ? Promise.resolve(0)
      : tokenBalance(acc, { id: tokenId }),
  ])

  if (metadata === null) {
    throw new Error('Token does not exist')
  }
  const token = { ...metadata }
  token.balance = bigBalance
  token.minBalance = await getMinBalance(token.id, acc)
  if (token.id) {
    cacheReducer.tokens.update(token)
    return token
  }
  const formattedToken = formatTokenMetadata(tokenId, token)
  cacheReducer.tokens.update(formattedToken)

  return formattedToken
}

export async function fetchTokenForCache(
  acc: ReachAccount,
  tokenId: string | number,
) {
  // Network Tokens
  if (isNetworkToken(tokenId)) return makeNetworkToken()
  const connector = getCurrentNetwork()
  const parsed = parseAddress(tokenId)

  return (connector === 'ALGO' && !Number.isNaN(parsed)) ||
    (connector !== 'ALGO' && parsed.startsWith('0x'))
    ? peraTokenMetadata(parsed, acc as any)
    : null
}
