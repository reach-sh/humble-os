import { NETWORKS } from 'constants/reach_constants'
import { CURRENCY_SYMBOLS } from 'constants/supported-currencies'
import {
  amountOfTokenDeposited,
  formatCurrency,
  formatCurrencyShort,
  formatUnsafeInt,
  parseCurrency,
} from 'reach/utils'
import { getTokenById } from 'helpers/pool'
import { Pool, PoolCore, Prices, Token } from 'types/shared'
import { getCurrentNetwork, useReach } from 'helpers/getReach'
import cacheReducer from 'state/cacheReducer'
import { getBlockchain } from '@reach-sh/humble-sdk'
import { GlobalDex } from 'state/reducers/dex'

const baseURL = 'https://api.coingecko.com/api/v3'
const path = 'simple/price'
const DISPLAY_CURRENCY = 'displayCurrency'
// Cache values to allow realtime computation (v.s. async)
let TIMEOUT: NodeJS.Timeout

/** Fetch price from coingecko API */
const fetchPriceRemote = async (connector: string) => {
  const displayUnit = currencyDisplayUnit()
  const chain = NETWORKS[connector].name.toLowerCase()
  const params = `ids=${chain}&vs_currencies=${displayUnit}`
  const url = `${baseURL}/${path}?${params}`
  const onPriceResponse = (res: any) => {
    const data: Prices = {
      lastRate: res[chain][displayUnit],
      lastUpdate: new Date().getTime(),
      displayUnit,
    }

    cacheReducer.prices.set(data)
  }

  // if currency is network token, return 1
  if (displayUnit === connector)
    return onPriceResponse({ [chain]: { [connector]: 1 } })

  return fetch(url)
    .then((res) => res.json())
    .then(onPriceResponse)
}

/** Initialize currency unit; fetch and update pricing every 3s */
export function initializePricing() {
  currencyDisplayUnit()
  cacheReducer.prices.setLastUpdate(30000)
  updatePricing()
}

/** Get the user's preferred currency display unit e.g. `$` for USD */
export function currencyDisplaySymbol<U extends keyof typeof CURRENCY_SYMBOLS>(
  unit: U,
) {
  const u = unit.toUpperCase()
  const network = getCurrentNetwork()
  if (unit === network) return network.toUpperCase()
  return CURRENCY_SYMBOLS[u] || u
}

/** Get the user's preferred currency display unit e.g. `usd` for US dollars */
export function currencyDisplayUnit() {
  const u = localStorage.getItem(DISPLAY_CURRENCY)
  // Default prices to network token
  return u || setCurrencyDisplayUnit(getCurrentNetwork())
}

const networkTokens = new Set(['0', 0])

/** Compute token value in either local currency or `network token` */
export function getPrice(
  tokenId: string | number,
  amt: string | number = 1,
  noCap = false,
) {
  const { prices, pools } = GlobalDex.getState()
  const { lastRate } = prices
  // This is to show the price of the rALGO reward token as equivalent to the ALGO
  // token (which it essentially is since we'll be paying users 1 ALGO for every 1 rALGO token they send us)
  const spoofedNetworkToken = '94106047'
  // If (network token), return '1' if unit is also 'network'
  if (
    networkTokens.has(tokenId) ||
    spoofedNetworkToken === tokenId.toString()
  ) {
    const displayAs = localStorage.getItem(DISPLAY_CURRENCY)
    const unit = displayAs === getCurrentNetwork() ? 'network' : 'local'
    const value = (unit === 'network' ? 1 : lastRate) * Number(amt)
    return noCap ? value : capDecimals(value)
  }

  // else, find a n2nn pool and calculate network-token value
  return getNetworkTokenValue(tokenId.toString(), amt, lastRate, pools)
}

/**
 * Compute total value locked in pool (displayed in user's preferred currency)
 */
export function getPoolTVL(data: PoolCore) {
  const { tokAId, tokBId, tokABalance, tokBBalance } = data
  if (!tokAId || !tokBId) return tokenBalancesShort(data)
  const [priceA, priceB] = [
    getPrice(tokAId, tokABalance, true),
    getPrice(tokBId, tokBBalance, true),
  ]
  if (!priceA || !priceB) return tokenBalancesShort(data)
  const sum = Number(priceA) + Number(priceB)
  if (!sum) return '-'
  const { connector } = useReach()
  const unit = currencyDisplaySymbol(currencyDisplayUnit())
  return connector === unit
    ? `${formatCurrencyShort(sum)} ${unit}`
    : `${unit} ${formatCurrencyShort(sum)}`
}

/** Convert number of LP tokens into `token A` and `token B` amounts */
export const getLPTokensAmount = (amt: string, pool: Pool) => {
  const amtA = amountOfTokenDeposited(amt, pool, true)
  const amtB = amountOfTokenDeposited(amt, pool, false)
  return [amtA, amtB]
}

/** Compute currency value of `amt` of LP tokens */
export const getLPTokensPrice = (amt: string, pool: Pool) => {
  const { tokAId, tokBId } = pool
  const [amtA, amtB] = getLPTokensAmount(amt, pool)
  const priceA = Number(getPrice(tokAId, amtA))
  const priceB = Number(getPrice(tokBId, amtB))
  // Prevent `NaN` display
  if (Number.isNaN(priceA) || Number.isNaN(priceB)) {
    const safeA = formatUnsafeInt(String(amtA), 4)
    const safeB = formatUnsafeInt(String(amtB), 4)
    const [A, B] = [getTokenById(tokAId), getTokenById(tokBId)]
    return `${safeA} ${A?.symbol}/${safeB} ${B?.symbol}`
  }
  const sum = priceA + priceB
  const unit = currencyDisplaySymbol(currencyDisplayUnit())
  return getBlockchain() === unit
    ? `${formatCurrencyShort(sum)} ${unit}`
    : `${unit} ${formatCurrencyShort(sum)}`
}

/**
 * Compute total value locked in pool for sorting
 */
export function getPoolTVLSort(data: Partial<Pool>) {
  const { tokAId, tokBId, tokABalance, tokBBalance } = data
  if (!tokAId || !tokBId) return 0

  const [priceA, priceB] = [
    getPrice(tokAId, tokABalance, true),
    getPrice(tokBId, tokBBalance, true),
  ]
  if (!priceA || !priceB) return 0

  const sum = Number(priceA) + Number(priceB)
  if (!sum) return 0

  return sum
}

/**
 * Compute total value of fees collected in pool (displayed in user's preferred currency)
 */
export function getPoolFees(data: PoolCore) {
  const { tokAId, tokBId, tokenAFees, tokenBFees } = data
  const CAP_AMOUNT = 0.01
  if (!tokAId || !tokBId) return tokenBalancesShort(data, true)
  const [priceA, priceB] = [
    getPrice(tokAId, tokenAFees, true),
    getPrice(tokBId, tokenBFees, true),
  ]
  const sum = Number(priceA) + Number(priceB)
  const { connector } = useReach()
  const unit = currencyDisplaySymbol(currencyDisplayUnit())
  const isLowValue = sum > 0 && sum < CAP_AMOUNT
  if (isLowValue) return `< ${CAP_AMOUNT} ${unit}`
  return connector === unit
    ? `${formatCurrencyShort(sum)} ${unit}`
    : `${unit} ${formatCurrencyShort(sum)}`
}

function getNetworkTokenValue(
  tokenId: string,
  amt: string | number,
  currencyRate: number,
  pools: Pool[],
) {
  const tokenPools = pools.filter(({ tokAId, tokBId }: Pool) => {
    const isN2NN = networkTokens.has(tokAId) || networkTokens.has(tokBId)
    const isTokenPool =
      tokAId.toString() === tokenId || tokBId.toString() === tokenId
    return isN2NN && isTokenPool
  })

  if (!tokenPools.length) return 0

  // swap A to B to get network (e.g. "ALGOs") value of `tokenId`
  const [pool] = tokenPools
  const { tokAId, tokBId, tokABalance, tokBBalance } = pool

  let conversion = 0
  if (tokenId === tokAId.toString() && tokABalance > 0) {
    conversion = tokBBalance / tokABalance
  }

  if (tokenId === tokBId.toString() && tokBBalance > 0) {
    conversion = tokABalance / tokBBalance
  }

  const rate = conversion * currencyRate
  // multiply value by user-setting (1 for network token; else, API value)
  let prod: string | number = Number(amt) * rate
  if (prod % 1 > 0) prod = capDecimals(((prod * 10000) / 10000).toFixed(3))

  return Number.isNaN(prod) ? 0 : prod
}

/** Set the user's preferred currency display unit */
export function setCurrencyDisplayUnit(newUnit: string) {
  localStorage.setItem(DISPLAY_CURRENCY, newUnit)
  fetchPriceRemote(useReach().connector)
  return newUnit
}

const fmt = (tok?: Token, balance?: string | number) =>
  formatCurrency(parseCurrency(balance, tok?.decimals), tok?.decimals, true)

function tokenBalancesShort(pool: PoolCore, isFees = false) {
  const { tokAId, tokBId, tokABalance, tokBBalance, tokenAFees, tokenBFees } =
    pool
  const tokA = getTokenById(tokAId)
  const tokB = getTokenById(tokBId)
  const amtA = isFees ? tokenAFees : tokABalance
  const amtB = isFees ? tokenBFees : tokBBalance
  return `${fmt(tokA, amtA)} / ${fmt(tokB, amtB)}`
}

export function tokenBalancesFull(pool: PoolCore) {
  const { tokAId, tokBId } = pool
  const tokA = getTokenById(tokAId)
  const tokB = getTokenById(tokBId)
  const [balA, balB] = tokenBalancesShort(pool).split(' / ')
  return `${balA} ${tokA?.symbol} / ${balB} ${tokB?.symbol}`
}

/** Fetch and optionally update pricing at external interval */
export async function updatePricing() {
  const { prices } = GlobalDex.getState()
  if (new Date().getTime() - prices.lastUpdate < 30000) return
  if (TIMEOUT) window.clearTimeout(TIMEOUT)

  const { connector } = useReach()
  fetchPriceRemote(connector).then(() => {
    if (prices.lastUpdate === 0) return
    TIMEOUT = setTimeout(updatePricing, prices.lastUpdate)
  })
}

function capDecimals(val: string | number) {
  const s = Number(val).toString()
  if (!s.includes('.')) return formatCurrencyShort(Number(val))

  const parts = s.split('.')
  const fracts = parts[1].substring(0, 4)
  const capped = `${parts[0]}.${fracts}`
  return capped === '0.0000' ? '< 0.001' : capped
}

export const convertLPAmountToTokenAmounts = (amt: string, pool: Pool) => [
  parseFloat(amountOfTokenDeposited(amt, pool, true).toFixed(5)).toString(),
  parseFloat(amountOfTokenDeposited(amt, pool, false).toFixed(5)).toString(),
]
