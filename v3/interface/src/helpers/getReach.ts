/* eslint-disable camelcase */
import MyAlgoConnect from '@randlabs/myalgo-connect'
import AlgoQRModal from 'algorand-walletconnect-qrcode-modal'
import { ALGO_MakeWalletConnect } from '@reach-sh/stdlib'
import { LOCAL_STORAGE_ACCOUNTS_DEFAULT } from 'constants/local-storage'
import { t } from '@lingui/macro'
import {
  ACCOUNT_STORAGE_KEY,
  CURRENT_PROVIDER,
  DEFAULT_DECIMALS,
  NETWORKS,
  NETWORK_STORAGE_KEY,
  NETWORK_PROVIDER_KEY,
  WALLETCONNECT_STORAGE_KEY,
} from 'constants/reach_constants'
import useToast from 'hooks/useToast'
import { GlobalUser } from 'state/reducers/user'
import { NetworkListItem, ReachAccount } from 'types/shared'
import { clearTokBals } from 'cache/tokens'
import {
  checkInitialized,
  createReachAPI,
  formatAddress,
  initHumbleSDK,
  NetworkProvider,
  WalletFallbackOpts,
} from '@reach-sh/humble-sdk'

import SignClient from '@walletconnect/sign-client'
import { WalletConnectModal } from '@walletconnect/modal'

import WalletConnect from './WalletConnect/AudioWalletConnect'
import { lsGetJSON, lsSetJSON } from './localStorage'
import { captureException } from './error'
import HSMakePeraConnect from './WalletConnect/PeraWCClient'
import HSMakeDeflyConnect from './WalletConnect/DeflyWCClient'
import ALGO_MakeWalletConnect2 from './WalletConnect/ALGO_MakeWalletConnect2'

/** Global default reach object */
export const useReach = () => createReachAPI()

/** Get a UI-friendly list of Networks */
export function getAllNetworks(): NetworkListItem[] {
  const activeNetwork = getCurrentNetwork()

  return Object.keys(NETWORKS).map((k) => ({
    active: NETWORKS[k].abbr === activeNetwork,
    ...NETWORKS[k],
  }))
}

/**
 * Get last user-saved (or default) network for App. Sets the default
 * to `Algorand` if this is the user's first time in the application.
 */
export function getCurrentNetwork(): string {
  const defaultNetwork = NETWORKS.ALGO.abbr
  const stored = localStorage.getItem(NETWORK_STORAGE_KEY)
  if (stored) return stored

  setCurrentNetwork(defaultNetwork)
  return defaultNetwork
}

/** Store user network selection for App */
export function setCurrentNetwork(network: string): void {
  return localStorage.setItem(NETWORK_STORAGE_KEY, network)
}

/** Set wallet provider and return persisted account if found */
export function getPersistedUserAccount() {
  const providerId = getWalletProviderId()

  //  Check for a pera session
  if (providerId === 'pera-wallet' || providerId === 'pera-wallet-web') {
    usePeraWallet()
    return { walletConnectSession: true }
  }

  //  Check for a walletconnect session
  if (providerId === 'walletconnect') {
    useWalletConnect({
      WalletConnect: ALGO_MakeWalletConnect2(SignClient, WalletConnectModal),
    })
    return { walletConnectSession: true }
  }

  const persistedCluster: Record<string, any> =
    lsGetJSON(ACCOUNT_STORAGE_KEY) || LOCAL_STORAGE_ACCOUNTS_DEFAULT
  const network = getCurrentNetwork()
  const persistedAccount = persistedCluster[network]
  if (persistedAccount && network === NETWORKS.ALGO.abbr) useMyAlgo()

  return persistedAccount
}

export function persistUserAccount(acc: ReachAccount) {
  // Don't store data if walletconnect was just used
  if (lsGetJSON(WALLETCONNECT_STORAGE_KEY)) return

  const network = getCurrentNetwork()
  const addr = formatAddress(acc)
  const accountCluster =
    lsGetJSON(ACCOUNT_STORAGE_KEY) || LOCAL_STORAGE_ACCOUNTS_DEFAULT

  switch (network) {
    case NETWORKS.ETH.abbr:
      accountCluster[network] = addr
      break
    default:
      accountCluster[network] = acc.networkAccount
  }

  lsSetJSON(ACCOUNT_STORAGE_KEY, accountCluster)
}

/*
 * Clear account storage key and balances
 * May also reload
 */
export async function clearPersistedUserAccount(reload = true) {
  const accountCluster =
    lsGetJSON(ACCOUNT_STORAGE_KEY) || LOCAL_STORAGE_ACCOUNTS_DEFAULT
  accountCluster[getCurrentNetwork()] = null
  lsSetJSON(ACCOUNT_STORAGE_KEY, accountCluster)
  await clearTokBals()
  if (reload) window.location.reload()
}

const localhostProviderEnv = {
  ALGO_SERVER: 'http://localhost',
  ALGO_PORT: '4180',
  ALGO_TOKEN:
    'c87f5580d7a866317b4bfe9e8b8d1dda955636ccebfa88c12b414db208dd9705',
  ALGO_INDEXER_SERVER: 'http://localhost',
  ALGO_INDEXER_PORT: '8980',
  ALGO_INDEXER_TOKEN: 'reach-devnet',
  REACH_ISOLATED_NETWORK: 'yes',
  ALGO_NODE_WRITE_ONLY: 'no',
}

export function buildProviderEnv() {
  const emptyEnv = JSON.stringify({ settings: {} })
  const storedEnv = localStorage.getItem(NETWORK_PROVIDER_KEY) || emptyEnv
  const network = CURRENT_PROVIDER
  const humbleEnv =
    network === 'ALGO-devnet' ? localhostProviderEnv : humbleSwapPremiumEnv()
  const override = JSON.parse(storedEnv)
  const { settings } = override
  return { ...humbleEnv, ALGO_NODE_WRITE_ONLY: true, ...settings }
}

/** Generate provider override for `Algoexplorer` */
export function algoExplorerEnv() {
  const network = CURRENT_PROVIDER.toLowerCase()
  const ALGO_SERVER =
    network === 'mainnet'
      ? 'https://node.algoexplorerapi.io'
      : `https://node.${network}.algoexplorerapi.io`
  const ALGO_INDEXER_SERVER =
    network === 'mainnet'
      ? 'https://algoindexer.algoexplorerapi.io'
      : `https://algoindexer.${network}.algoexplorerapi.io`

  return {
    ALGO_INDEXER_SERVER,
    ALGO_INDEXER_PORT: '',
    ALGO_INDEXER_TOKEN: '',
    ALGO_SERVER,
    ALGO_PORT: '',
    ALGO_TOKEN: '',
  }
}

/** Generate provider override for `AlgoNode` */
export function algoNodeEnv() {
  const network = CURRENT_PROVIDER.toLowerCase()

  return {
    ALGO_INDEXER_SERVER: `https://${network}-idx.algonode.cloud`,
    ALGO_INDEXER_PORT: '',
    ALGO_INDEXER_TOKEN: '',
    ALGO_SERVER: `https://${network}-api.algonode.cloud`,
    ALGO_PORT: '',
    ALGO_TOKEN: '',
  }
}

/** Generate provider override for `HumbleSwap Premium` */
export function humbleSwapPremiumEnv() {
  const prov = CURRENT_PROVIDER === 'MainNet' ? 'humble' : CURRENT_PROVIDER
  const network = prov.toLowerCase()
  const TOKEN = process.env.REACT_APP_ALGONODE_TOKEN

  return {
    ALGO_INDEXER_SERVER: `https://${network}-idx.algonode.cloud`,
    ALGO_INDEXER_PORT: '',
    ALGO_INDEXER_TOKEN: TOKEN,
    ALGO_SERVER: `https://${network}-api.algonode.cloud`,
    ALGO_PORT: '',
    ALGO_TOKEN: TOKEN,
  }
}

function getContractOverrides() {
  return {
    contractOverrides: {
      protocolId: process.env.REACT_APP_TRIUMVIRATE_ID,
      protocolAddress: process.env.REACT_APP_TRIUMVIRATE_ADDRESS,
      partnerFarmAnnouncerId: process.env.REACT_APP_FARM_ANNOUNCER,
      publicFarmAnnouncerId: process.env.REACT_APP_PUBLIC_FARM_ANNOUNCER,
      limitOrderAnnouncerId: process.env.REACT_APP_LIMIT_ORDER_ANNOUNCER,
    },
  }
}

/**
 * Set `stdlib`'s wallet provider to `MyAlgo`.
 * Can only be performed once
 */
let usedMyAlgo = false
export function useMyAlgo() {
  if (usedMyAlgo) return // prevent double-init
  try {
    // @ts-ignore-next
    if (window.algorand) delete window.algorand // suppress AlgoSigner (SWAP-1267)
    initHumbleSDK({
      ...getContractOverrides(),
      network: CURRENT_PROVIDER as NetworkProvider,
      providerEnv: buildProviderEnv(),
      walletFallback: { MyAlgoConnect },
    })
    // @ts-ignore
    const disconnect = () => window.algorand.disconnect()
    GlobalUser.walletClient({ disconnect })
    usedMyAlgo = checkInitialized()
  } catch (e) {
    notifyErrorSettingProvider(e)
  }
}

export function getWalletProviderId() {
  const wallet = JSON.parse(localStorage.getItem('txnlab-use-wallet') || '{}')
  const baseProviderId = wallet?.state?.activeAccount?.providerId
  const providedId =
    baseProviderId === 'pera'
      ? JSON.parse(localStorage.getItem('PeraWallet.Wallet') || '{}')?.type
      : baseProviderId
  return providedId
}

/**
 * Set `stdlib`'s wallet provider to `WalletConnect`.
 * Can only be performed once
 */
export function useWalletConnect(fallback?: WalletFallbackOpts) {
  try {
    initHumbleSDK({
      ...getContractOverrides(),
      network: CURRENT_PROVIDER as NetworkProvider,
      providerEnv: buildProviderEnv(),
      walletFallback: fallback || {
        WalletConnect: ALGO_MakeWalletConnect(WalletConnect, AlgoQRModal),
      },
    })
    // @ts-ignore
    const disconnect = () => window.algorand.disconnect()
    GlobalUser.walletClient({ disconnect })
  } catch (e) {
    notifyErrorSettingProvider(e)
  }
}

/**
 * Set `stdlib`'s wallet provider to `WalletConnect`.
 * Can only be performed once
 */

export function use(providerId: string) {
  switch (providerId) {
    case 'myalgo':
      return useWalletConnect({
        MyAlgoConnect,
      })
    case 'defly':
      return useWalletConnect({
        WalletConnect: HSMakeDeflyConnect(),
      })
    case 'pera':
      return useWalletConnect({
        WalletConnect: HSMakePeraConnect(),
      })
    case 'walletconnect': {
      return useWalletConnect({
        WalletConnect: ALGO_MakeWalletConnect2(SignClient, WalletConnectModal),
      })
    }
    default:
      return useWalletConnect({
        WalletConnect: ALGO_MakeWalletConnect(WalletConnect, AlgoQRModal),
      })
  }
}

export function usePeraWallet() {
  return useWalletConnect({
    WalletConnect: HSMakePeraConnect(),
  })
}

export function useDeflyWallet() {
  return useWalletConnect({
    WalletConnect: HSMakeDeflyConnect,
  })
}

export function useWalletConnectV2() {
  return useWalletConnect({
    WalletConnect: ALGO_MakeWalletConnect2(SignClient, WalletConnectModal),
  })
}

function notifyErrorSettingProvider(e: any) {
  const { launchToast } = useToast()
  captureException(e, 'Config.SetReach')
  launchToast('reject', {
    message: t`Error setting provider: ${JSON.stringify(e, null, 2)}`,
  })
}

/*
 * Return default decimals of network
 */
export const defaultDecimals = (value?: number) => {
  if (value === undefined || value === null) {
    return DEFAULT_DECIMALS[getCurrentNetwork()]
  }
  return value
}
