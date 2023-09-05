import { AnyObject, NetworkData, NetworkProvider } from 'types/shared'
import { blockConstants } from '@reach-sh/humble-sdk'
import TOKEN_BLACKLIST from 'constants/tokenBlacklist'

export const ACCOUNT_STORAGE_KEY = 'acct'
export const APP_UPDATED = 'newHumbleVersion'
export const WALLETCONNECT_STORAGE_KEY = 'walletconnect'
export const PERACONNECT_STORAGE_KEY = 'PeraWallet.Wallet'
export const NETWORK_STORAGE_KEY = 'network'
export const NETWORK_PROVIDER_KEY = 'algoprovider'
export const NETWORK_TOKEN_DEFAULT_ID = '0'
export const VERSION = 'lastVersion'
export const DEFAULT_NETWORK = 'ALGO'
export const MIN_TRANSACTION_FEES = 0.004
export const LIQUIDITY_FEE_PH = 0.9975
export const SIZEABLE_SWAP_RISK_LIMIT = 5
export const SLIPPAGE_RISK_LIMIT = 1
export const INFLIGHT_MAX = 10
export const MAX_UINT: Record<string, string> = {
  ALGO: '18446744073709551615',
}

export const STAKE_TRANSACTION_FEE = 0.002

const PROVIDERS: { [x: string]: NetworkProvider } = {
  TESTNET: 'TestNet',
  MAINNET: 'MainNet',
  DEVNET: 'ALGO-devnet',
}
const CURRENT_PROVIDER: NetworkProvider = (process.env
  .REACT_APP_SELECTED_NETWORK || PROVIDERS.TESTNET) as NetworkProvider

const NETWORKS: Record<string, NetworkData & AnyObject> = {
  ALGO: {
    name: 'Algorand',
    abbr: 'ALGO',
    decimals: 6,
    blacklist: TOKEN_BLACKLIST.ALGO,
    blockDuration: blockConstants('ALGO').BLOCK_LENGTH * 1000,
  },
  ETH: {
    name: 'Ethereum',
    abbr: 'ETH',
    decimals: 18,
    blacklist: TOKEN_BLACKLIST.ETH,
  },
  CFX: { name: 'Conflux', abbr: 'CFX', blacklist: TOKEN_BLACKLIST.CFX },
}

const DEFAULT_DECIMALS: Record<string, number> = {
  ALGO: 6,
  ETH: 18,
  CFX: 18,
}

enum WALLET_PROVIDERS {
  MYALGO = 'MyAlgo',
  WALLETCONNECT = 'WalletConnect',
  PERA = 'Pera Wallet',
  DEFLY = 'Defly',
  FIREBLOCKS = 'Fireblocks',
  EXODUS = 'Exodus',
}

const HUMBLE_ADDR =
  CURRENT_PROVIDER === PROVIDERS.TESTNET
    ? 'RXMWRESHEXFOQOC7QTLKIX3IKIOC37U22KPJTZEVRFOTR5TCJEJAUUKM6M'
    : 'U57LB3YXAVYAER4BWQLNRQZHI2TJWXSDJGOUI5OYJWORUYEAL6SPZGOWZI'
const LIQUIDITY_PROVIDER_FEE = 25
const HUMBLE_DAO_FEE = 5
const TOTAL_FEE = 30
const TOTAL_FEE_FLOAT = TOTAL_FEE * 0.0001

const FEE_INFO = {
  fee: HUMBLE_DAO_FEE,
  lpFee: LIQUIDITY_PROVIDER_FEE,
  totFee: TOTAL_FEE,
  addr: HUMBLE_ADDR,
}

export {
  PROVIDERS,
  CURRENT_PROVIDER,
  NETWORKS,
  DEFAULT_DECIMALS,
  WALLET_PROVIDERS,
  FEE_INFO,
  HUMBLE_ADDR,
  TOTAL_FEE_FLOAT,
}
