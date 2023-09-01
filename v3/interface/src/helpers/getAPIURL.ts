import { NetworkProvider } from 'types/shared'
import { CURRENT_PROVIDER, PROVIDERS } from 'constants/reach_constants'
import { getNetworkProvider } from '@reach-sh/humble-sdk'

export type ResourceTarget = 'farms' | 'pools' | 'tokens' | 'general'
export const isPubTestNet = () =>
  window?.location?.hostname.includes('testnet.humbleswap')

const getAPIURL = (network: NetworkProvider) => {
  if (!network) return ''

  const API_URL = process.env.REACT_APP_API_URL
  if (API_URL?.includes('localhost')) return `${API_URL}/graphql`

  switch (network) {
    case PROVIDERS.MAINNET:
      return `${API_URL}/humble-mainnet`
    case PROVIDERS.TESTNET:
      return `${API_URL}/humble-${getAppEnvironment()}`
    default:
      return `${API_URL}/humble-dev`
  }
}

export default getAPIURL

export type AppEnv = 'mainnet' | 'testnet' | 'dev' | 'staging'

/**
 * Determine whether app is running in `mainnet`, `staging` (public
 * testnet) or `testnet` (dev). When `pure` is set to `true`, it will just
 * return the network provider (`testnet`/`mainnet` in lowercase)
 */
export function getAppEnvironment(pure = false): AppEnv {
  if (pure) return CURRENT_PROVIDER.toLowerCase() as AppEnv
  if (getNetworkProvider() === 'MainNet') return 'mainnet'
  return isPubTestNet() ? 'testnet' : 'dev'
}

/**
 * Get the legacy environment match for app's current environment.
 * Overrides `dev` with `staging`; otherwise, falls back to `getAppEnvironment`
 */
export function getLegacyAppEnvironment(pure = false): AppEnv {
  return getAppEnvironment() === 'dev' ? 'testnet' : getAppEnvironment(pure)
}

/**
 * Get the server URL for a legacy app environment
 * @param network `MainNet` | `TestNet`
 * @returns
 */
export function getLegacyAPIURL(network: NetworkProvider = 'TestNet') {
  if (!network) return ''

  const API_URL = process.env.REACT_APP_API_LEGACY
  if (API_URL?.includes('localhost')) return `${API_URL}/graphql`

  switch (network) {
    case PROVIDERS.MAINNET:
      return `${API_URL}/humble-mainnet`
    case PROVIDERS.TESTNET:
      return `${API_URL}/humble-${getLegacyAppEnvironment()}`
    default:
      return `${API_URL}/humble-dev`
  }
}
