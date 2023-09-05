import {
  createReachAPI,
  formatAddress,
  initHumbleSDK,
  NetworkProvider,
  ReachAccount,
  SDKOpts,
} from '@reach-sh/humble-sdk'
import logger from '../../logger'

let acc: ReachAccount

/** Create single reusable `NetworkAccount` instance */
export async function initReachService() {
  initHumbleSDK(buildProviderEnv())

  // Create output directory
  acc = await createReachAPI().createAccount()
  return true
}

/** Access address from `NetworkAccount` instance */
export function globalReachAddress() {
  return formatAddress(globalReachAccount()?.getAddress())
}

/** Access reusable `NetworkAccount` instance */
export function globalReachAccount() {
  if (!acc) logger.warn('Accessed global account before init-reach-service')
  return acc
}

// Helpers
function buildProviderEnv() {
  const {
    AGN_TOKEN = '',
    LIMIT_ORDER_ANNOUNCER,
    PARTNER_FARM_ANNOUNCER,
    PUBLIC_FARM_ANNOUNCER,
    TRIUMVIRATE_ID,
    TRIUMVIRATE_ADDRESS,
  } = process.env
  const network = getNetwork()
  let baseUrl = network.toLowerCase()
  if (baseUrl === 'mainnet') baseUrl = 'humble'
  const algonode = (sub: string) => `https://${sub}.algonode.cloud`
  const providerEnv = {
    ALGO_INDEXER_SERVER: algonode(`${baseUrl}-idx`),
    ALGO_SERVER: algonode(`${baseUrl}-api`),
    ALGO_TOKEN: AGN_TOKEN,
    ALGO_INDEXER_TOKEN: AGN_TOKEN,
  }
  const opts: SDKOpts = { network, providerEnv }
  opts.contractOverrides = {
    protocolId: TRIUMVIRATE_ID,
    protocolAddress: TRIUMVIRATE_ADDRESS,
    partnerFarmAnnouncerId: PARTNER_FARM_ANNOUNCER,
    publicFarmAnnouncerId: PUBLIC_FARM_ANNOUNCER,
    limitOrderAnnouncerId: LIMIT_ORDER_ANNOUNCER,
  }
  if (TRIUMVIRATE_ID) logger.info(opts.contractOverrides)

  return opts
}

/** Determine current network with fallback */
function getNetwork() {
  const p = process.env.NETWORK_PROVIDER || 'TestNet'
  return p as NetworkProvider
}
