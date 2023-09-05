import { NETWORK_PROVIDER_KEY } from 'constants/reach_constants'

export type ProviderConfigOverride = {
  ALGO_INDEXER_SERVER: string
  ALGO_INDEXER_TOKEN: string
  ALGO_SERVER: string
  ALGO_TOKEN: string
}
export type ProviderOpt = { title: string; key: string; description: string }

const NONE = 'Select a Provider'
const ALGONODE = 'Algonode'
const ALGOEXPLORER = 'AlgoExplorer'
const CUSTOM = 'Use your own node'
const HUMBLESWAP = 'HumbleSwap'
const PURESTAKE = 'PureStake'

export const Providers = {
  HUMBLESWAP,
  ALGONODE,
  ALGOEXPLORER,
  PURESTAKE,
  CUSTOM,
  NONE,
}
const makeOption = (
  title: string,
  key: string,
  description: string,
): ProviderOpt => ({
  title,
  key,
  description,
})
export const ProviderOpts = [
  makeOption(HUMBLESWAP, 'HUMBLESWAP', '(default)'),
  makeOption(ALGONODE, 'ALGONODE', 'Free. Speed issues may occur'),
  makeOption(ALGOEXPLORER, 'ALGOEXPLORER', 'Free. Speed issues may occur'),
  makeOption(PURESTAKE, 'PURESTAKE', 'Advanced'),
  makeOption(CUSTOM, 'CUSTOM', 'Advanced'),
]

/** Remove provider override from localStorage */
export function clearProviderOverride() {
  localStorage.removeItem(NETWORK_PROVIDER_KEY)
}

/** Parse provider override from `localStorage` if available  */
export function getProviderOverride() {
  const override = localStorage.getItem(NETWORK_PROVIDER_KEY)
  if (override) return JSON.parse(override)
  return {}
}

/** Parse provider override from `localStorage` if available  */
export function getStoredProviderOpt() {
  const override = getProviderOverride()
  const defaultOpt = ProviderOpts[0]
  const { provider } = override
  return provider
    ? ProviderOpts.find(({ key }) => key === provider) || defaultOpt
    : defaultOpt
}

export function storeProviderOverride(
  provider: string,
  provSettings?: ProviderConfigOverride,
) {
  const settings = provSettings || {}
  const data = JSON.stringify({ provider, settings })
  localStorage.setItem(NETWORK_PROVIDER_KEY, data)
}
