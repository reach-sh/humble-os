import { enumType } from 'nexus'

export const HSBlockchain = enumType({
  name: 'HSBlockchain',
  description: 'Blockchain network',
  members: {
    ALGO: 'ALGO',
    ETH: 'ETH',
    SOLANA: 'SOL',
  },
})

export const HSBlockchainProvider = enumType({
  name: 'HSBlockchainProvider',
  description: 'Network provider (mainnet/testnet)',
  members: {
    mainnet: 'mainnet',
    testnet: 'testnet',
  },
})

export const HSSDKVersion = enumType({
  name: 'HSSDKVersion',
  description: 'SDK Version',
  members: {
    v2: 'v2',
    v3: 'v3',
  },
})

export const HSVerificationTier = enumType({
  name: 'HSVerificationTier',
  description: 'Pera Token Verification Tier (if available)',
  members: {
    suspicious: 'suspicious',
    trusted: 'trusted',
    unverified: 'unverified',
    verified: 'verified',
  },
})

export const HSLimitOrderStatus = enumType({
  name: 'HSLimitOrderStatus',
  description: 'Limit Order status (open/closed)',
  members: {
    open: 'open',
    closed: 'closed',
  },
})
