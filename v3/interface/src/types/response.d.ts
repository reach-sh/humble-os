import { SDKLimitOrderView } from '@reach-sh/humble-sdk'

export type HSPoolLiquidity = {
  id: number
  apr7d: string
  poolId: string
  tokenABalance: string
  tokenAFees: string
  tokenBBalance: string
  tokenBFees: string
  lastUpdated: string
  mintedLiquidityTokens?: string // TODO: Make non-null when deployed to main net
}

export type HSLimitOrder = SDKLimitOrderView & {
  status: LimitOrderStatus
  tokenADecimals: number
  tokenBDecimals: number
}
