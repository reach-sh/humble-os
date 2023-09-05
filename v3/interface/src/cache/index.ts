import createDataCacheAPI from '@jackcom/adi-cacheducks'
import {
  formatCurrency,
  formatTokenMetadata,
  listUserAssets,
  updateNetworkTokenBalance,
} from 'reach/utils'
import { Farm, Pool, ReachAccount, Token } from 'types/shared'
import { LOCAL_STORAGE_VIEW_MESSAGE_COUNT } from 'constants/local-storage'
import useToast from 'hooks/useToast'
import { t } from '@lingui/macro'
import { tokenMetadata } from 'cache/shared'
import { parseAddress } from '@reach-sh/humble-sdk'
import cacheReducer from 'state/cacheReducer'
import { getTokenById } from 'helpers/pool'
import { GlobalDex } from 'state/reducers/dex'
import { GlobalUser } from 'state/reducers/user'

import {
  APP_UPDATED,
  NETWORK_PROVIDER_KEY,
  VERSION,
} from 'constants/reach_constants'
import { RUNNING_TESTS } from 'constants/node'
import farmsDBAPI, { clearFarmTable } from './farms'
import limitOrdersDBAPI, { clearOrdersTable } from './limit-order'
import liquidityPoolsDBAPI, { clearLPPoolTable } from './liquidity-pools'
import poolsDBAPI, { clearPoolTable } from './pools'
import tokensDBAPI, { clearTokenTable } from './tokens'
import testnetMetadataJson from './testnet-token-metadata.json'
import mainnetMedatadaJson from './mainnet-token-metadata.json'
import localMedatataJson from './local-token-metadata.json'
import packageInfo from '../../package.json'

type TokenMetadataType = {
  id: string
  name: string
  symbol: string
  supply: string
  decimals: number
  url?: string
  verified: boolean
  verificationTier:
    | 'trusted'
    | 'verified'
    | 'suspicious'
    | 'unverified'
    | undefined
}

enum ENVIRONMENT {
  PRODUCTION = 'production',
  DEV = 'deploy-dev',
  STAGING = 'staging',
}

const env = getEnvironment()
function getEnvironment() {
  if (!process) return ''
  const defaultEnv = process.env.NODE_ENV
  if (defaultEnv === ENVIRONMENT.PRODUCTION) {
    const url = window.location.href
    if (url.startsWith('https://dev.')) return ENVIRONMENT.DEV
    if (url.startsWith('https://staging.')) return ENVIRONMENT.STAGING
  }

  return defaultEnv
}

const tokenMetadataJson = env
  ? {
      development: localMedatataJson,
      'deploy-dev': localMedatataJson,
      test: localMedatataJson,
      staging: testnetMetadataJson,
      production: mainnetMedatadaJson,
    }[env]
  : localMedatataJson

/* key-value map of local database APIs */
const cacheMap = {
  pools: poolsDBAPI,
  tokens: tokensDBAPI,
  liquidityPools: liquidityPoolsDBAPI,
  farms: farmsDBAPI,
  limitOrders: limitOrdersDBAPI,
}

/** Caching interface */
const ADI = createDataCacheAPI(cacheMap)
export default ADI

const refreshCache = async (currentVersion: string) => {
  const changed =
    localStorage.getItem(APP_UPDATED) === 'true' ||
    localStorage.getItem(VERSION) !== currentVersion

  if (changed) {
    await clearLocalDB(currentVersion)
  }

  return changed
}

export const cacheExpired = async () => {
  if (!RUNNING_TESTS) return refreshCache(packageInfo.version)
  localStorage.setItem(VERSION, 'testing')
  return false
}

/** Enable `ADI` for interactions and caching */
export function initializeADI() {
  // Subscribe to ADI
  ADI.onApplicationStart()
}

export async function initPools() {
  const { data: pools } = await ADI.listItems({ cacheKey: 'pools' })
  cacheReducer.pools.set(pools)
  return pools as Pool[]
}

export async function initFarms() {
  cacheReducer.loadingFlags.farms = true
  const { data: cacheFarms } = await ADI.listItems({ cacheKey: 'farms' })
  cacheReducer.farms.set(cacheFarms as Farm[])
  cacheReducer.loadingFlags.farms = cacheFarms.length > 0
}

export async function clearLocalDB(newVersion: string) {
  await Promise.all([
    clearFarmTable(),
    clearOrdersTable(),
    clearLPPoolTable(),
    clearPoolTable(),
    clearTokenTable(),
  ])
  localStorage.removeItem(NETWORK_PROVIDER_KEY)
  localStorage.setItem(VERSION, newVersion)
  localStorage.setItem(APP_UPDATED, 'true')
}

export function initTokens() {
  const initialTokens = Object.values(tokenMetadataJson).map((ft) => {
    const formatted = ft as TokenMetadataType
    delete formatted.url
    return formatTokenMetadata(ft.id, formatted)
  }) as TokenMetadataType[]
  cacheReducer.tokens.updateMultiple(initialTokens)
}

export const updateCachedAssetBalances = async (assets: any[]) => {
  const updateTokens: Token[] = []
  const missingTokens: any[] = []
  const missingTokenRqs: any[] = []
  const { reachAccount: acc } = GlobalUser.getState()
  GlobalDex.tokenBalancesLoading(true)

  assets.forEach((asset) => {
    const tokenId = parseAddress(asset['asset-id']).toString()
    const match = getTokenById(tokenId)
    if (match) {
      const balance = formatCurrency(asset.amount, match.decimals)
      updateTokens.push({ ...match, balance })
    } else if (asset.amount > BigInt(0)) {
      missingTokens.push(asset)
      missingTokenRqs.push(tokenMetadata(tokenId, acc, false))
    }
  })

  if (missingTokens.length) {
    const ut: PromiseSettledResult<Token>[] = await Promise.allSettled(
      missingTokenRqs,
    )
    // remove rejected token requests
    ut.forEach((resp, i) => {
      const { status } = resp
      if (status === 'rejected') return
      const { value } = resp
      const balance = formatCurrency(missingTokens[i].amount, value.decimals)
      updateTokens.push({ ...value, balance })
    })
  }

  cacheReducer.tokens.updateMultiple(updateTokens)
  GlobalDex.tokenBalancesLoading(false)
  return updateTokens
}

let cachingAssets = false
export const cacheUsersAssets = async (
  acc: ReachAccount,
  onAccountConnect = false,
) => {
  const { launchToast } = useToast()
  if (!acc || cachingAssets) return
  cachingAssets = true
  GlobalDex.ltBalancesLoading(true)

  try {
    // Fetch network token balance
    updateNetworkTokenBalance()

    // Fetch user's tokens and warn if user has a lot of assets
    const assets = await listUserAssets(acc)
    if (assets.length >= 16) warnLargeAssetCount(onAccountConnect)

    await updateCachedAssetBalances(assets)
  } catch (err) {
    const message = 'Could not fetch assets at this time.'
    const autoClose30s = { autoClose: 30000 }
    launchToast('reject', { message }, undefined, autoClose30s)
  }

  cachingAssets = false
  GlobalDex.ltBalancesLoading(false)
}

/** Warn user they have over 20 assets */
function warnLargeAssetCount(onAccountConnect?: boolean) {
  if (process.env.REACT_APP_RUNNING_TESTS === 'true') return
  const { launchToast } = useToast()
  const viewCount = Number(
    localStorage.getItem(LOCAL_STORAGE_VIEW_MESSAGE_COUNT) || 0,
  )

  if (viewCount < 3) {
    localStorage.setItem(
      LOCAL_STORAGE_VIEW_MESSAGE_COUNT,
      (viewCount + 1).toString(),
    )

    if (!onAccountConnect) return
    launchToast(
      'success',
      {
        message: t`You have a lot of assets in your account! 
        We have only fetched some of them to minimize strain on your bandwidth. 
        You can fetch additional assets when swapping or creating a pool.`,
      },
      undefined,
      { autoClose: 30000 },
    )
  }
}
