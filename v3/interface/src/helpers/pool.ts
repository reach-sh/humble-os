/* eslint-disable prefer-destructuring */
import sortBy from 'lodash.sortby'
import { useReach } from 'helpers/getReach'
import { Token, Pool, Maybe } from 'types/shared'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import { parseCurrency, reloadPool } from 'reach/utils'
import MIN_TOKEN_BALANCE from 'constants/min-token-balance'
import cacheReducer from 'state/cacheReducer'
import { GlobalDex } from 'state/reducers/dex'
import useToast from 'hooks/useToast'
import { t } from '@lingui/macro'
import { GlobalUser } from 'state/reducers/user'
import filterDupPoolsByAntiquity from '../utils/pool'

/** Find a pool that matches the supplied token pair */
export const getPoolForTokens = (
  tokAId: string,
  tokBId: string,
  pools: Pool[],
) => {
  for (let i = 0; i < pools.length; i += 1) {
    const { tokAId: tokAIdFromPool, tokBId: tokBIdFromPool } = pools[i]
    const tokA = getTokenById(tokAIdFromPool)
    const tokB = getTokenById(tokBIdFromPool)
    const poolTokAId = (tokA?.id || 0).toString()
    const poolTokBId = (tokB?.id || 0).toString()
    if (
      (poolTokAId === `${tokAId}` && poolTokBId === `${tokBId}`) ||
      (poolTokBId === `${tokAId}` && poolTokAId === `${tokBId}`)
    ) {
      return pools[i]
    }
  }
  return null
}

export const getTokenIdsForPool = (poolId: string, pools: Pool[]) => {
  const pool = pools.find((p) => p && p.poolAddr === poolId)
  return { tokAId: pool?.tokAId, tokBId: pool?.tokBId }
}

/** Checks if a pool is n2nn */
export const isN2NN = ([tokAId, tokBId]: [string, string]) =>
  [tokAId, tokBId].includes(NETWORK_TOKEN_DEFAULT_ID)

export const canonicalizeTokA = (
  tokId: string | null,
): Maybe<string | null> => {
  const reach = useReach()
  return tokId === NETWORK_TOKEN_DEFAULT_ID
    ? ['None', null]
    : ['Some', reach.T_Token.canonicalize(tokId)]
}

/** updates pool balance in state and cache  */
export const updatePoolBalance = async (poolAddr: string | number) => {
  // Ignore if user is gone
  const { reachAccount: acc } = GlobalUser.getState()
  if (!acc) return

  // Set state pool updating
  const poolId = poolAddr.toString()
  const { data: statePools } = await cacheReducer.pools.list()
  const index = statePools.findIndex((p: any) => p.poolAddr === poolId)
  if (index >= 0) {
    const old = statePools[index]
    await reloadPool(old)
  }
}

export const belowMinBalance = (token: Token, inputAmt: number) => {
  const fmtTokABalance = Number(token.balance)
  const inputValue = Math.round((fmtTokABalance - inputAmt) * 10) / 10
  const belowMin = inputValue < (token?.minBalance || 0)
  return token.id === NETWORK_TOKEN_DEFAULT_ID && belowMin
}

export const minBalMessageCap = (
  currentMessage: string,
  expectedMessage: string,
  minBalance: number | undefined,
) => (currentMessage === expectedMessage ? ` ≈${minBalance || 0} ALGO` : '')

/** updates pool balance in state and cache  */
export const updateLiquidity = async (
  poolAddr: string | number,
  newPoolLiquidity: string | number,
  addedOrRemovedLiquidityAmount: string | number,
  isRemoving?: boolean,
) => {
  const { reachAccount: acc } = GlobalUser.getState()
  if (!acc) return

  const { data: statePools } = await cacheReducer.pools.list()
  const index = statePools.findIndex((p: any) => p.poolAddr === poolAddr)
  if (index >= 0) {
    const updatedPool = { ...statePools[index] }
    updatedPool.mintedLiquidityTokens = Number(newPoolLiquidity)
    updatedPool.liquidityAmount = isRemoving
      ? updatedPool.liquidityAmount - Number(addedOrRemovedLiquidityAmount)
      : updatedPool.liquidityAmount + Number(addedOrRemovedLiquidityAmount)

    cacheReducer.lPools.update({ ...updatedPool })
    cacheReducer.pools.update({ ...updatedPool })
  }
}

// check if pool has enough liquidity
export const hasEnoughLiquidity = (pool: Pool) =>
  pool &&
  (pool.tokABalance > MIN_TOKEN_BALANCE || pool.tokBBalance > MIN_TOKEN_BALANCE)

export const findMatchingPairs = (tokenId: any, pools: Pool[]) => {
  const filteredPools: Pool[] = filterDupPoolsByAntiquity(pools)
  const matchingPools = filteredPools.filter((pool) => {
    const { tokAId, tokABalance, tokBId, tokBBalance } = pool
    if (tokABalance === 0 || tokBBalance === 0) return false
    const tokA = getTokenById(tokAId)
    const tokB = getTokenById(tokBId)
    return tokA?.id === tokenId || tokB?.id === tokenId
  })
  if (!matchingPools.length) return []
  // return a list of tokens paired to `tokenId`
  const list = matchingPools
    .map(({ tokAId, tokBId }) => {
      const tokA = getTokenById(tokAId)
      const tokB = getTokenById(tokBId)
      return tokA?.id === tokenId ? tokB : tokA
    })
    .filter((tok) => tok) as Token[] // NOTE: Safe cast because filter removes all undefined

  return sortByBigNumberBalance(list)
}

export const sortByBalance = (list: Token[]) =>
  sortBy(list, 'balance').reverse()

export const sortByBigNumber = (
  A: Token,
  B: Token,
  order: 'desc' | 'asc' = 'asc',
) => {
  const a = parseCurrency(A.balance, A.decimals)
  const b = parseCurrency(B.balance, B.decimals)
  const sign = order === 'asc' ? 1 : -1
  return a.gt(b) ? sign * 1 : a.lt(b) ? sign * -1 : 0
}

export const sortByBigNumberBalance = (list: Token[]) => [
  ...list.sort((tokN, tokNPlus1) =>
    tokN?.balance && tokNPlus1?.balance
      ? sortByBigNumber(tokN, tokNPlus1, 'desc')
      : 0,
  ),
]
/** Calculates the ownership of pool using bignumbers to help prevent overflows and provide higher accuracy */
export const getOwnershipOfPool = (
  tokensOwned: number,
  mintedTokens: number,
) => {
  if (mintedTokens === 0) return mintedTokens.toFixed(2)
  return ((tokensOwned / mintedTokens) * 100).toFixed(2)
}

/** Check if user has enough funds */
export const notEnoughFunds = (
  amtA: number,
  amtB: number,
  tokABal: number | string | undefined,
  tokBBal: number | string | undefined,
) => {
  const fmtTokABal = Number(tokABal)
  const fmtTokBBal = Number(tokBBal)
  return amtA > (fmtTokABal || 0) || amtB > (fmtTokBBal || 0)
}

const toLowerCase = (s: string) => s.toLowerCase()

const startsWithToken = (input: string, token: Token) => {
  const query = toLowerCase(input)

  return {
    id: `${token.id}`.startsWith(query),
    name: toLowerCase(token.name).startsWith(query),
    symbol: toLowerCase(token.symbol).startsWith(query),
  }
}

const includesToken = (input: string, token: Token) => {
  const query = toLowerCase(input)

  return {
    id: `${token.id}`.includes(query),
    name: toLowerCase(token.name).includes(query),
    symbol: toLowerCase(token.symbol).includes(query),
  }
}

/** Find tokens that match `input` by name, or, symbol, or ID */
export const filterTokensByQuery = (input?: string, tokens: Token[] = []) => {
  if (!input) return tokens

  const startsWith = new Set<Token>()
  const includes = new Set<Token>()
  // Match by name, symbol, or ID
  tokens.forEach((tok) => {
    const msw = startsWithToken(input, tok)
    if (msw.name || msw.symbol || msw.id) {
      startsWith.add(tok)
      return
    }
    const mi = includesToken(input, tok)
    if (mi.name || mi.symbol || mi.id) {
      includes.add(tok)
    }
  })

  return [...startsWith, ...includes]
}

/** Find pools with Tokens that match `input` by name, or, symbol, or ID */
export const filterPoolsByQuery = (
  input?: string,
  pools: Pool[] = [],
): Pool[] => {
  if (!input) return pools

  let query = input
  const sideBResults: Pool[] = []
  if (query.includes('/')) {
    const parts = input.split('/')
    query = parts[0].trim()
    sideBResults.push(...filterPoolsByQuery(parts[1].trim(), pools))
    return query ? filterPoolsByQuery(query, sideBResults) : sideBResults
  }

  const all = new Set<Pool>()
  pools.forEach((pool) => {
    const { tokAId, tokBId } = pool
    const tokA = getTokenById(tokAId)
    const tokB = getTokenById(tokBId)
    const tokens = [tokA, tokB]
    // Match by name, symbol, or ID

    tokens.forEach((tok) => {
      const matches = tok && startsWithToken(toLowerCase(input), tok)
      if (matches?.name || matches?.symbol || matches?.id) all.add(pool)
    })
  })

  return [...all, ...sideBResults]
}

/** get token from state by token id */
export const getTokenById = (tokId: string) => {
  const { tokenList } = GlobalDex.getState()
  const tid = tokId?.toString()
  const foundToken = tokenList.find(({ id }) => id.toString() === tid)

  return foundToken
}

/** check if the token has opted in or not  */
export const isTokenOptedIn = async (tokId: string | number) => {
  // Ignore if user is gone
  if (tokId.toString() === '0') return true
  const { reachAccount: acc } = GlobalUser.getState()
  if (!acc) return false
  const result = await acc.tokenAccepted(tokId)
  return result
}

/** Opt in to Token from token id */
export const optInToById = async (tokId: string | number) => {
  // Ignore if user is gone
  const { reachAccount: acc } = GlobalUser.getState()
  if (!acc) return false

  const msg = { message: t`Opting In` }
  const close = { autoClose: false }
  const { launchToast, removeToasts } = useToast()
  const toastId = launchToast('progress', msg, undefined, close)

  try {
    await acc.tokenAccept(tokId)
    removeToasts(toastId)
    return true
  } catch (e: any) {
    const message = 'Opt-in transaction failed'
    const err = { message, info: undefined, error: e }
    launchToast('reject', err, toastId, { autoClose: 30000 })
  }
  return false
}
