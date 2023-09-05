import {
  fetchStakingPool,
  fetchToken,
  formatCurrency,
  isPartnerFarm,
  ReachAccount,
  ReachToken,
  SDKFarmView,
  StaticFarmDataFormatted,
  subscribeToFarmStream,
  TransactionResult,
} from '@reach-sh/humble-sdk'
import { getAnnouncers } from '@reach-sh/humble-sdk/lib/constants'
import { upsertFarm } from '../graphql/services/Farms.service'
import { chainIdentifiers } from '../graphql/utils'
import logger from '../logger'
import { fetchPrimaryTokenBalance } from '../graphql/services/Tokens.service'
import { globalReachAccount } from '../graphql/services/Reach.service'

type FarmCtcMap = Map<string, TransactionResult<SDKFarmView>['contract']>
let timeout: NodeJS.Timeout
let fetched = 0
const farmsMap = new Map<string, StaticFarmDataFormatted>()
const stakeTokensMap = new Map<string, ReachToken>()
const contractsMap: FarmCtcMap = new Map()
let acc: ReachAccount
const UPDATE_INTERVAL_MS = 2500

/** Subscribe to `Farms` stream and export all received data  */
export function initFarms() {
  acc = globalReachAccount()
  subscribeToFarmStream(acc, {
    format: true,
    includePublicFarms: true,
    async onFarmFetched({ data }: TransactionResult<StaticFarmDataFormatted>) {
      farmsMap.set(data.ctcInfo, data)
      refreshFarm(data.ctcInfo, data.stakedTokenId)
    },
  })
}

/** Fetch a farm */
export async function refreshFarm(poolAddress: string, stakeTokenId: string) {
  Promise.all([
    fetchStakingPool(acc, {
      poolAddress,
      formatResult: true,
      includeTokens: false,
      contract: contractsMap.get(poolAddress),
    }),
    stakeTokensMap.get(stakeTokenId) || fetchToken(acc, stakeTokenId),
  ])
    .then(([farm, token]) => {
      if (token) stakeTokensMap.set(String(token.id), token)
      onFarmReceived(farm)
    })
    .catch(() => logger.error(`Could not fetch farm ${poolAddress}`))
}

/** Write data to db */
export async function onFarmReceived(result: TransactionResult<SDKFarmView>) {
  if (!result.succeeded) return
  const { data, contract } = result
  const raw = farmsMap.get(data.poolAddress)
  if (!raw) return
  refreshTimeout()

  const isPartner = isPartnerFarm({ farmView: data })
  const { partnerFarmAnnouncer, publicFarmAnnouncer } = getAnnouncers()
  const announcer = isPartner ? partnerFarmAnnouncer : publicFarmAnnouncer
  const { poolAddress, totalStaked, totalRewards, remainingRewards } = data
  const stakeToken = stakeTokensMap.get(raw.stakedTokenId)
  const stakeTokenId = String(stakeToken?.id || '')
  const stakeTokenSupply = stakeToken?.supply || '0'
  const stReserve = await fetchPrimaryTokenBalance(stakeTokenId)
  fetched += 1

  upsertFarm({
    ...raw,
    ...chainIdentifiers(),
    announcerId: String(announcer!),
    isPartnerFarm: isPartner,
    primaryStakeTokenBalance: formatCurrency(stReserve, stakeToken?.decimals),
    remainingRewards,
    stakedTokenTotalSupply: String(stakeTokenSupply),
    totalRewards,
    totalStaked,
  }).then(() => {
    refreshTimeout()
    contractsMap.set(poolAddress, contract)
  })
}

/**
 * Export data to disk or aws remote
 * @returns Export function
 */
function logFarmsUpdated() {
  if (process.env.NODE_ENV !== 'development') return
  const now = new Date().toISOString()
  const action = fetched === 0 ? 'Init' : 'Upload'
  logger.warn(`${action}.Farms:: @ ${now}`)
  logger.info(`Last processed ${fetched} farms`)
  logger.error('============================')
  fetched = 0
}

/** Reset the "all-items refresh" timer */
function refreshTimeout() {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(logFarmsUpdated, UPDATE_INTERVAL_MS)
}
