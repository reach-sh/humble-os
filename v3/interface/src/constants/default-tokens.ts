import { getBlockchain } from '@reach-sh/humble-sdk'
import { AnyObject, Token } from 'types/shared'
import { CURRENT_PROVIDER } from './reach_constants'

const USDC_ETH = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const USDC_ALGO_TEST = '10458941'
const USDC_ALGO_MAIN = '31566704'
const DEFAULT_TOKENS: Record<string, Record<string, Token[]>> & AnyObject = {
  TestNet: {
    ALGO: [{ id: USDC_ALGO_TEST, symbol: 'USDC', decimals: 6, name: 'USDC' }],
    ETH: [{ id: USDC_ETH, symbol: 'USDC', decimals: 18, name: 'USDC' }],
    CFX: [],
  },
  MainNet: {
    ALGO: [{ id: USDC_ALGO_MAIN, symbol: 'USDC', decimals: 6, name: 'USDC' }],
    ETH: [{ id: USDC_ETH, symbol: 'USDC', decimals: 18, name: 'USDC' }],
    CFX: [],
  },
}

export const USDC = () => {
  if (CURRENT_PROVIDER === 'TestNet') {
    return getBlockchain() === 'ALGO' ? USDC_ALGO_TEST : USDC_ETH
  }

  return getBlockchain() === 'ALGO' ? USDC_ALGO_MAIN : USDC_ETH
}

// eslint-disable-next-line import/prefer-default-export
export { DEFAULT_TOKENS }
