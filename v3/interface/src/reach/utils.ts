import { defaultDecimals, useReach } from 'helpers/getReach'
import {
  FormattedPoolData,
  Maybe,
  Pool,
  ReachAccount,
  SwapInfo,
  Token,
} from 'types/shared'
import { getExports as getUtilExports } from 'reach/build/util.default.mjs'
import { getPoolForTokens, getTokenById } from 'helpers/pool'
import {
  LOCAL_STORAGE_LIQUIDITY_POOLS,
  LOCAL_STORAGE_POOL_CACHE,
} from 'constants/local-storage'
import { lsGetJSON, lsSetJSON } from 'helpers/localStorage'
import { asMaybe, fromMaybe, trimByteString } from 'utils/reach'
import { getValueWithMaxDecimals } from 'utils/input'
import {
  DEFAULT_NETWORK,
  FEE_INFO,
  NETWORKS,
  NETWORK_TOKEN_DEFAULT_ID,
} from 'constants/reach_constants'
import cacheReducer from 'state/cacheReducer'
import { BigNumber } from 'ethers'
import {
  PoolDetails,
  fetchLiquidityPool,
  createReachAPI,
  getBlockchain,
  TokenVerificationTier,
  formatNumberShort,
  parseAddress as SDKParseAddress,
} from '@reach-sh/humble-sdk'
import { GlobalDex } from 'state/reducers/dex'
import { tokenMetadata } from 'cache/shared'
import { GlobalUser } from 'state/reducers/user'
import { listAPIPools, updateAPIPool } from 'utils/getServerResource'

export const formatCurrency = (
  amount: any,
  decimals?: number,
  abbr = false,
): string => {
  // eslint-disable-next-line no-param-reassign
  if (decimals === undefined) decimals = defaultDecimals()
  const reach = useReach()
  const reachFmt = reach.formatWithDecimals(amount, decimals)
  return abbr ? formatUnsafeInt(reachFmt) : reachFmt
}

type NumberFormatPart = Intl.NumberFormatPart
export const formatCurrencyShort = (val: number, decimalPlaces = 2) => {
  const parts = Intl.NumberFormat().formatToParts(val)
  const groups = parts.filter((p) => p.type === 'group').length
  const int = parts[0].value
  const decs = getDecimals(parts, decimalPlaces)
  return `${int}${decs}${abbrevNumber(groups)}`
}

export const truncateNum = (n: string, decimals = 2) => {
  const num = Number(n)
  const fmtd = formatCurrencyShort(num, decimals)
  return fmtd === '0' && num > 0 ? '< 0.001' : fmtd
}

/**
 * Previously, returned `NeX` format where `N` is an int, and `X` is
 * an exponent of `N`. Replaced with `< 0.0..1` string for readability.
 */
export const exponentialFormat = (val: string, exp = 2) => truncateNum(val, exp)

/**
 * Abbreviate really large(r than max-safe-int) numbers. Falls back to
 * `formatCurrencyShort` if the value is small enough.
 */
export function formatUnsafeInt(val: string, round = 2) {
  return formatNumberShort(val, round)
}

/**
 * Abbreviate really large(r than max-safe-int) numbers. Falls back to
 * `formatCurrencyShort` if the value is small enough.
 */
export function oldFormatUnsafeInt(val: string, round = 2) {
  const parts = val.split('.')
  const numInts = parts[0].length
  if (!numInts) return '0'
  if (numInts <= 3) return exponentialFormat(val, round)

  // Get number of vals before first 'comma'
  const leadingLength = numInts % 3 || 3
  const leading = parts[0].substring(0, leadingLength) || parts[0]
  const rest = parts[0].substring(leadingLength)
  const decimals = trimDecimals(rest.substring(0, round))
  const groups = []
  const grouper = new RegExp(/[0-9]{3}/g)
  const i = rest.matchAll(grouper)
  let n = i.next()

  do {
    groups.push(n.value[0])
    n = i.next()
  } while (!n.done)

  return `${leading}${decimals}${abbrevNumber(groups.length)}`
}

/** Generates a string with the decimal value of the parsed number in `parts` */
function getDecimals(parts: NumberFormatPart[], places = 2) {
  if (!places) return ''

  const ints: NumberFormatPart[] = []
  const fractions: NumberFormatPart[] = []
  parts.forEach((part) => {
    const { type } = part
    if (type === 'integer') ints.push(part)
    else if (type === 'fraction') fractions.push(part)
  })

  if (ints.length > 1) return trimDecimals(ints[1].value.substring(0, places))
  if (fractions.length) return trimDecimals(fractions[0].value)
  return ''
}

// Generate a number abbreviation
function abbrevNumber(numOfGroups: number) {
  if (Number.isNaN(numOfGroups) || !numOfGroups) return ''
  const ab = ['K', 'M', 'B', 'T', 'Qa', 'Qi', 'Si', 'Se', 'o', 'N', 'dec']
  if (numOfGroups > ab.length) return '!'
  return ab[numOfGroups - 1]
}

function trimDecimals(decs: string) {
  // If replacing all '0's doesn't return an empty string, drop the last 0
  return decs.replace(/0*/, '') === '' ? '' : `.${decs.replace(/0$/, '')}`
}

export const parseCurrency = (
  amount: any,
  decimals?: number | undefined,
): any => {
  try {
    const reach = useReach()
    const fmtAmt = Number(amount)
    return reach.parseCurrency(fmtAmt, decimals ?? defaultDecimals())
  } catch (err) {
    // @TODO | handle overflow error
    throw new Error('Parse will overflow')
  }
}

export const numberify = (value: any, decimals?: number) =>
  Number(formatCurrency(value, decimals ?? defaultDecimals()))

export function formatTokenMetadata(tokenId: any, data: any): Token {
  const id = parseAddress(tokenId)
  const fallbackName = `Asset #${id}`
  const fallbackSymbol = `#${id}`
  const reach = useReach()
  const decimals = reach.bigNumberToNumber(data.decimals)
  const shrink = (v: any) => {
    try {
      return reach.isBigNumber(v) ? formatCurrency(v, decimals) : v
    } catch (error) {
      return 0
    }
  }

  return {
    id: parseAddress(tokenId).toString(),
    name: trimByteString(data.name) || fallbackName,
    symbol: trimByteString((data.symbol || fallbackSymbol).toUpperCase()),
    supply: shrink(data.supply),
    decimals,
    verified: data.verified || false,
    verificationTier: data.verificationTier || 'unverified',
  }
}

/**
 * Parses a contract address for Algorand or other chains
 * @param {string|number} addr string|number contract address
 * @returns string|number contract address
 */
export function parseAddress(ctc: any) {
  return SDKParseAddress(ctc)
}

/** Create a Network `Token` representation for the current chain  */
export function makeNetworkToken() {
  const connector = getBlockchain()
  return {
    /** ID has to be a string here or db will treat it as value 'false' */
    id: NETWORK_TOKEN_DEFAULT_ID,
    balance: '0',
    decimals: NETWORKS[connector].decimals,
    name: connector === DEFAULT_NETWORK ? 'Algorand' : 'Ethereum',
    symbol: connector,
    supply: '0',
    verified: true,
    verificationTier: 'trusted' as TokenVerificationTier,
    url: '',
  }
}

/**
 * Given an output amount, calculate the expected `amount B` output.
 */
// eslint-disable-next-line consistent-return
export const swapTokenAToB = (amt: any, pool: Pool): any => {
  try {
    const fmtAmt = Number(amt)
    if (fmtAmt === 0) return ''
    const reach = useReach()
    // TODO this getAmtOutView function should be migrated to the SDK
    const { getAmtOutView } = getUtilExports(reach)
    const { tokAId, tokBId, tokABalance: balA, tokBBalance: balB } = pool
    const tokA = getTokenById(tokAId)
    const tokB = getTokenById(tokBId)

    if (tokA && tokB) {
      const inputCurrency = parseCurrency(fmtAmt, tokA.decimals)
      const poolABalance = parseCurrency(Number(balA) + fmtAmt, tokA.decimals)
      const poolBBalance = parseCurrency(balB, tokB.decimals)
      const amtOut = getAmtOutView(
        inputCurrency,
        poolABalance,
        poolBBalance,
        FEE_INFO,
      )
      return formatCurrency(amtOut, tokB.decimals)
    }

    return ''
  } catch (err) {
    // @TODO | handle overflow error
  }
}

/**
 * Given an output amount, calculate the expected `amount A` output.
 */
// eslint-disable-next-line consistent-return
export const swapTokenBToA = (amtOut: any, pool: Pool): any => {
  try {
    const fmtAmt = Number(amtOut)
    if (fmtAmt === 0) return ''
    const reach = useReach()
    const { getAmtOutView } = getUtilExports(reach)
    const { tokAId, tokBId, tokABalance: balA, tokBBalance: balB } = pool
    const tokA = getTokenById(tokAId)
    const tokB = getTokenById(tokBId)
    if (tokA && tokB) {
      const inputCurrency = parseCurrency(amtOut, tokB.decimals)
      const poolABalance = parseCurrency(balA, tokA.decimals)
      const poolBBalance = parseCurrency(
        Number(balB) + Number(amtOut),
        tokB.decimals,
      )
      const amtOuts = getAmtOutView(
        inputCurrency,
        poolBBalance,
        poolABalance,
        FEE_INFO,
      )
      const fmtOut = formatCurrency(amtOuts, tokA.decimals)
      return fmtOut
    }
    return ''
  } catch (err) {
    // @TODO | handle overflow error
  }
}

/**
 * Given an output amount, calculate the expected input. This function
 * calls `swapTokenBToA` if a possible overflow is detected (i.e. `amtOut`
 * is greater than the balance of `amtOut` token in the pool)
 */
export const reverseTokenBToA = (
  amtOut: any,
  pool: Pool,
  inputsAligned = false,
) => {
  if (!amtOut || Number(amtOut) === 0) return 0

  const { gt, bigNumberify, sub, div } = useReach()
  const { tokAId, tokBId, tokABalance, tokBBalance } = pool
  const tokA = getTokenById(tokAId)
  const tokB = getTokenById(tokBId)

  if (!(tokA && tokB)) return 0

  // Assume inverted
  let reserveA = parseCurrency(tokBBalance, tokB.decimals)
  let reserveB = parseCurrency(tokABalance, tokA.decimals)
  let expected = parseCurrency(amtOut, tokA.decimals)

  // Align if not inverted
  if (inputsAligned) {
    reserveA = parseCurrency(tokABalance, tokA.decimals)
    reserveB = parseCurrency(tokBBalance, tokB.decimals)
    expected = parseCurrency(amtOut, tokB.decimals)
  }

  // Check overflow (low liquidity) and use alternate calc since
  // results don't matter (UI will prevent swap)
  if (gt(expected, reserveB)) return swapTokenBToA(amtOut, pool)

  const num = reserveA.mul(expected).mul(bigNumberify(10000))
  const den = sub(reserveB, expected).mul(bigNumberify(9975))
  const input = div(num, den).add(1)
  return formatCurrency(input, (inputsAligned ? tokA : tokB).decimals)
}

/** Helper: takes a `SwapInfo` object and orders token A/B to match pool */
export function alignSwapInfo(
  swap: SwapInfo,
  pool: Pool,
): [s: SwapInfo, aligned: boolean] {
  const { tokAId } = pool
  const tokA = getTokenById(tokAId)
  if (!swap.tokA || !tokA) return [swap, false]

  const isAligned = `${tokA.id}` === `${swap.tokA?.id}`
  if (isAligned) return [{ ...swap, tokenIn: swap.tokA.id }, isAligned]

  return [
    {
      tokA: swap.tokB,
      tokB: swap.tokA,
      amtA: swap.amtB,
      amtB: swap.amtA,
      tokenIn: swap.tokB?.id,
    },
    false,
  ]
}

export const minimumReceived = (amtIn: number) => {
  const { slippageTolerance: slippage } = GlobalUser.getState()
  const calculation = (Number(amtIn) * (100 - slippage)) / 100
  return calculation
}

export const organizeTrade = (swap: SwapInfo, pool: Pool) => {
  const { tokAId, tokBId } = pool
  const tokA = getTokenById(tokAId)
  const tokB = getTokenById(tokBId)
  if (!swap.tokA || !tokA) return [swap, false]

  const isAligned = `${tokA.id}` === `${swap.tokA?.id}`

  // re-arrange tokens to match pool if token order is reversed:
  // - If user is swapping B-in-pool for A, amtA must be 0
  // - else for pool-A-to-B, amtB must be 0.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tokenDecimals = [
    defaultDecimals(tokA?.decimals),
    defaultDecimals(tokB?.decimals),
  ]
  const [tokADecimals, tokBDecimals] = isAligned
    ? tokenDecimals
    : tokenDecimals.reverse()
  const expectedOut = parseCurrency(minimumReceived(swap.amtB), tokBDecimals)
  const amtIn = parseCurrency(swap.amtA, tokADecimals)

  return [amtIn, expectedOut, !isAligned]
}

/** Helper: update UI state when a token is selected */
export function convertSwapTokens(input: SwapInfo): SwapInfo {
  // Exit if one token is missing
  const tokenMissing = (t?: Token) => t === undefined
  const { tokA, tokB } = input
  if (!input || tokenMissing(tokA) || tokenMissing(tokB)) return input

  // Find token pools for liquidity balance: Exit if a pool isn't found
  const { pools } = GlobalDex.getState()
  const pool = getPoolForTokens(tokA?.id, tokB?.id, pools)
  if (pool === null || !pool.tokABalance || !pool.tokBBalance) return input

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const inputIsAligned = alignSwapInfo(input, pool)[1]
  const swapped = { ...input }
  const { amtA, amtB } = input

  if (amtB && !amtA) {
    // Convert Token B to Token A | user typed into field "B"
    const expectedIn = reverseTokenBToA(amtB, pool, inputIsAligned)
    swapped.amtA = adjustForPriceImpact(expectedIn, tokA, tokB)
  } else {
    // Else convert Token A to Token B
    swapped.amtB = inputIsAligned
      ? swapTokenAToB(amtA, pool)
      : swapTokenBToA(amtA, pool)
  }

  swapped.amtB = getValueWithMaxDecimals(
    swapped.amtB,
    defaultDecimals(swapped.tokB?.decimals),
  )
  return swapped
}

export const updateLiquidityAmt = (pool: Pool, lpTokAmt: BigNumber) => {
  const { bigNumberToNumber } = useReach()

  const updatedPool: Pool = {
    ...pool,
    liquidityAmount: bigNumberToNumber(lpTokAmt),
  }
  cacheReducer.lPools.update(updatedPool)
  cacheReducer.pools.update(updatedPool)
}

// @TODO HOLY SHIT REFACTOR THIS
export const checkForLPTokens = async (tokId: number | string) => {
  if (tokId.toString() === NETWORK_TOKEN_DEFAULT_ID) return
  const { pools } = GlobalDex.getState()
  const tokPool = pools.find(
    (pool: Pool) => (pool?.poolTokenId || '').toString() === tokId.toString(),
  )
  if (!tokPool) return

  const { reachAccount: acc } = GlobalUser.getState()
  const { balanceOf } = useReach()
  const lpTokAmt = await balanceOf(acc, tokId)
  updateLiquidityAmt(tokPool, lpTokAmt)
}

/** Helper: calculate minimum amount received based on slippage settings */
export function minReceived(amt: number, slippage: number) {
  const slippagePct = slippage / 100
  return (amt * (1 - slippagePct)).toFixed(4)
}

/** Retuns list of active pools */
export const getCachedPools = (): Pool[] => {
  const reach = useReach()
  const poolCollection: Record<string, Pool[]> = lsGetJSON(
    LOCAL_STORAGE_POOL_CACHE,
    true,
  )
  const pools = poolCollection[reach.connector]
  return pools
}

export const updatePoolCache = (
  pools: Pool[],
  verifiedPool: Pool,
  isLiquidity?: boolean,
) => {
  const reach = useReach()
  const cachedKey = isLiquidity
    ? LOCAL_STORAGE_LIQUIDITY_POOLS
    : LOCAL_STORAGE_POOL_CACHE
  const poolIndex = pools.findIndex(
    (pool: Pool) =>
      pool &&
      verifiedPool &&
      pool.poolAddr.toString() === verifiedPool.poolAddr.toString(),
  )
  let updatedPools = pools
  if (poolIndex === -1) {
    updatedPools = [...pools, verifiedPool]
  } else {
    updatedPools[poolIndex] = verifiedPool
  }
  const currentPoolCache = lsGetJSON(cachedKey, true)
  currentPoolCache[reach.connector] = updatedPools
  lsSetJSON(cachedKey, currentPoolCache)
}

export function adjustForPriceImpact(amtA: any, tokA?: Token, tokB?: Token) {
  const impactPct = Number(calculatePriceImpact(amtA, tokA, tokB))
  const impact = ((pct) => {
    switch (true) {
      case pct > 10000:
        return pct / 100000
      case pct > 1000:
        return pct / 10000
      case pct > 100:
        return pct / 1000
      default:
        return pct / 100
    }
  })(impactPct)
  const formula = 1 / (1 - impact)
  if (Number.isNaN(amtA) || Number.isNaN(formula)) return ''
  const adjusted = Number(amtA) * formula
  return adjusted
}

export function calculatePriceImpact(amtA: any, tokA?: Token, tokB?: Token) {
  const { pools } = GlobalDex.getState()
  const pool = getPoolForTokens(tokA?.id, tokB?.id, pools)
  if (!pool) return 0

  let balA = pool.tokABalance
  let balB = pool.tokBBalance
  const aligned = alignSwapInfo({ amtA, tokA, tokB }, pool)[1]
  if (!aligned) {
    balA = pool.tokBBalance
    balB = pool.tokABalance
  }

  const fmtAmtA = Number(amtA)
  const idealAmtOut = (balB / balA) * fmtAmtA
  const amtOutWithPriceImpact = balB - (balA / (balA + fmtAmtA)) * balB
  const priceImpact = (idealAmtOut / amtOutWithPriceImpact - 1) * 100
  const fmtPriceImpact = priceImpact.toFixed(2)
  return fmtPriceImpact
}

/**
 * Restructure SDK pool data for UI and cache
 * @param pool Pool data from SDK fetch
 * @param liquidityAmount User's lp token balance from fetch
 * @param tokens Pool tokens (from SDK fetch)
 * @returns Formatted pool for UI and cache
 */
export function formatSDKPool(
  pool: PoolDetails,
  liquidityAmount: number,
  tokens: [Token, Token],
): Pool {
  return {
    poolAddr: pool.poolAddress.toString(),
    poolTokenId: pool.poolTokenId as string,
    liquidityAmount,
    mintedLiquidityTokens: Number(pool.mintedLiquidityTokens),
    lastUpdated: new Date().getTime(),
    tokABalance: Number(pool.tokenABalance),
    tokBBalance: Number(pool.tokenBBalance),
    tokAId: tokens[0].id,
    tokBId: tokens[1].id,
    tokenAFees: Number(pool.tokenAFees),
    tokenBFees: Number(pool.tokenBFees),
  }
}

/** Get a pool from the SDK and format it for the UI */
export async function loadFormattedPool(
  acc: ReachAccount,
  poolInfo: string | number,
  tokenA: Maybe<BigNumber | string | null>,
): Promise<FormattedPoolData> {
  // backend is determined on whether or not the pool uses the network token
  const n2nn = [null, '0', 0].includes(fromMaybe(tokenA))
  const poolAddr = parseAddress(poolInfo).toString()
  const { data, succeeded } = await fetchLiquidityPool(acc, {
    includeTokens: true,
    poolAddress: poolAddr,
    n2nn,
  })
  if (!succeeded || !data || !data.pool) {
    return { hasLiquidity: false, formattedPoolInfo: null }
  }

  const { pool, tokens } = data
  const { balanceOf, bigNumberToNumber } = createReachAPI()
  const hasLiquidity = data?.tradeable || false
  const lpTokenId = pool?.poolTokenId as string | number
  const userLiquidity = await balanceOf(acc, lpTokenId).then(bigNumberToNumber)

  const tTokens = tokens as [Token, Token]
  const formattedPoolInfo = formatSDKPool(pool, userLiquidity, tTokens)

  if (hasLiquidity && formattedPoolInfo) {
    cacheReducer.pools.update(formattedPoolInfo)
    if (userLiquidity > 0) cacheReducer.lPools.update(formattedPoolInfo)
  } else cacheReducer.pools.delete(formattedPoolInfo.poolAddr)

  return { hasLiquidity, formattedPoolInfo }
}

/** Refresh and cache `Pool` data from chain */
type PartPool = Pick<Pool, 'poolAddr' | 'tokAId' | 'tokBId'>
export async function reloadPool(pool: PartPool) {
  const poolAddress = pool.poolAddr.toString()
  // Async update pool on server
  await updateAPIPool(poolAddress, pool.tokAId, pool.tokBId)
    .then(({ data: np }) => {
      if (!np) return
      cacheReducer.pools.update(np)
      cacheReducer.lPools.update(np)
    })
    .catch(() => {
      const { reachAccount: acc } = GlobalUser.getState()
      const tokenA = asMaybe(pool.tokAId)
      return loadFormattedPool(acc, poolAddress, tokenA)
    })
}

export async function reloadPools() {
  const { data: pools, error: poolsError } = await listAPIPools()
  if (!poolsError && pools.length) cacheReducer.pools.updateMultiple(pools)
}

export async function listUserAssets(
  acc: ReachAccount,
  limit = 2500,
): Promise<any[]> {
  const reach = createReachAPI()
  const { indexer } = await reach.getProvider()
  const results = await indexer
    .lookupAccountAssets(reach.formatAddress(acc))
    .limit(limit)
    .includeAll(false)
    .do()
    .catch(() => ({ assets: [] }))
  const assets = (results?.assets || []).map((a: any) => ({
    ...a,
    'asset-id': parseAddress(a['asset-id']).toString(),
  }))
  await updateCachedUserLPs(assets)
  return assets
}

/** Update the "Your Liquidity" List */
async function updateCachedUserLPs(assets: any[]) {
  const { data: pools } = await cacheReducer.pools.list()
  const lPools: Pool[] = []
  assets.forEach((a) => {
    if (a.amount === BigInt(0)) return
    const id = a['asset-id']
    const lp = pools.find(({ poolTokenId }) => poolTokenId.toString() === id)
    if (lp) lPools.push(lp)
  })

  if (lPools.length) cacheReducer.lPools.updateMultiple(lPools)
}

export const fetchAllTokenBalances = async () => {
  GlobalDex.multiple({ ltBalancesLoading: true, tokenBalancesLoading: true })
  const { reachAccount: acc } = GlobalUser.getState()
  updateNetworkTokenBalance()

  // Get token balances from indexer
  const userAssets = await listUserAssets(acc)
  if (userAssets.length > 0) {
    const updatedTokens = userAssets.map((d: any) => {
      const id = Number(d['asset-id']).toString()
      const match = getTokenById(id)
      const balance = formatCurrency(d.amount, match?.decimals)
      return { ...match, id, balance } as Token
    })
    cacheReducer.tokens.updateMultiple(updatedTokens)
  }

  GlobalDex.multiple({ ltBalancesLoading: false, tokenBalancesLoading: false })
}

export const updateNetworkTokenBalance = async () => {
  const { reachAccount: acc } = GlobalUser.getState()
  const networkToken = await tokenMetadata('0', acc)
  const mod = { ...networkToken, decimals: NETWORKS[getBlockchain()].decimals }
  cacheReducer.tokens.update(mod)
}

export const amountOfTokenDeposited = (
  amt: string,
  pool: Pool,
  isTokA: boolean,
) => {
  const userShareOfPool =
    Number(amt) / Number(formatCurrency(pool.mintedLiquidityTokens))
  const tokBalance = isTokA ? pool.tokABalance : pool.tokBBalance
  return tokBalance * userShareOfPool
}
