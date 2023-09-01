/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { GQLContext } from "./../context"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * UTC Date-time
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "HSDateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * UTC Date-time
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "HSDateTime";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  PaginationInput: { // input type
    descending: boolean; // Boolean!
    limit: number; // Int!
    orderBy: string; // String!
    page: number; // Int!
  }
}

export interface NexusGenEnums {
  HSBlockchain: "ALGO" | "ETH" | "SOL"
  HSBlockchainProvider: "mainnet" | "testnet"
  HSLimitOrderStatus: "closed" | "open"
  HSSDKVersion: "v2" | "v3"
  HSVerificationTier: "suspicious" | "trusted" | "unverified" | "verified"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  HSDateTime: any
}

export interface NexusGenObjects {
  HSFarm: { // root type
    FarmLiquidity?: Array<NexusGenRootTypes['HSFarmLiquidity'] | null> | null; // [HSFarmLiquidity]
    chain: NexusGenEnums['HSBlockchain']; // HSBlockchain!
    endBlock: string; // String!
    endDate?: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    id: string; // String!
    isPartnerFarm?: boolean | null; // Boolean
    networkRewardsPerBlock: string; // String!
    pairTokenADecimals?: string | null; // String
    pairTokenAId?: string | null; // String
    pairTokenASymbol?: string | null; // String
    pairTokenBDecimals?: string | null; // String
    pairTokenBId?: string | null; // String
    pairTokenBSymbol?: string | null; // String
    provider: NexusGenEnums['HSBlockchainProvider']; // HSBlockchainProvider!
    rewardTokenDecimals: number; // Int!
    rewardTokenId: string; // String!
    rewardTokenRewardsPerBlock: string; // String!
    rewardTokenSymbol: string; // String!
    stakedTokenDecimals: number; // Int!
    stakedTokenId: string; // String!
    stakedTokenPoolId?: string | null; // String
    stakedTokenSymbol: string; // String!
    stakedTokenTotalSupply: string; // String!
    startBlock: string; // String!
    startDate?: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    totalRewardA: string; // String!
    totalRewardB: string; // String!
  }
  HSFarmDuration: { // root type
    ends: string; // String!
    starts: string; // String!
  }
  HSFarmLiquidity: { // root type
    farmId: string; // String!
    id: number; // Int!
    lastUpdated: NexusGenScalars['HSDateTime']; // HSDateTime!
    primaryStakeTokenBalance: string; // String!
    remainingRewardA: string; // String!
    remainingRewardB: string; // String!
    totalStaked: string; // String!
  }
  HSFarmRewards: { // root type
    A: string; // String!
    B: string; // String!
  }
  HSFarmRewardsPerBlock: { // root type
    asDefaultNetworkToken: string; // String!
    asRewardToken: string; // String!
  }
  HSFarmTokens: { // root type
    rewardToken?: NexusGenRootTypes['HSToken'] | null; // HSToken
    stakeToken?: NexusGenRootTypes['HSToken'] | null; // HSToken
  }
  HSLimitOrder: { // root type
    amtA: string; // String!
    amtB: string; // String!
    announcerId: string; // String!
    contractId: string; // String!
    creator: string; // String!
    status?: NexusGenEnums['HSLimitOrderStatus'] | null; // HSLimitOrderStatus
    tokenA: string; // String!
    tokenADecimals: number; // Int!
    tokenB: string; // String!
    tokenBDecimals: number; // Int!
  }
  HSPool: { // root type
    PoolLiquidity?: Array<NexusGenRootTypes['HSPoolLiquidity'] | null> | null; // [HSPoolLiquidity]
    chain: string; // String!
    duplicate?: boolean | null; // Boolean
    id: string; // String!
    poolTokenId: string; // String!
    provider: string; // String!
    tokenADecimals: number; // Int!
    tokenAId: string; // String!
    tokenBDecimals: number; // Int!
    tokenBId: string; // String!
    tradeable?: boolean | null; // Boolean
  }
  HSPoolLiquidity: { // root type
    apr7d?: string | null; // String
    apr24h?: string | null; // String
    id: number; // Int!
    lastUpdated?: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    mintedLiquidityTokens: string; // String!
    poolId: string; // String!
    tokenABalance: string; // String!
    tokenAFees: string; // String!
    tokenBBalance: string; // String!
    tokenBFees: string; // String!
    volume7d?: string | null; // String
    volume24h?: string | null; // String
  }
  HSSDKSettings: { // root type
    environment: string; // String!
    partnerFarmAnnouncerId: string; // String!
    protocolAddress: string; // String!
    protocolId: string; // String!
    publicFarmAnnouncer: string; // String!
    version: NexusGenEnums['HSSDKVersion']; // HSSDKVersion!
  }
  HSToken: { // root type
    decimals: number; // Int!
    id: string; // String!
    name: string; // String!
    supply: string; // String!
    symbol: string; // String!
    url?: string | null; // String
    verificationTier?: NexusGenEnums['HSVerificationTier'] | null; // HSVerificationTier
    verified?: boolean | null; // Boolean
  }
  HSVersions: { // root type
    id: number; // Int!
    limitOrderAnnouncer: string; // String!
    partnerFarmAnnouncer: string; // String!
    protocolId: string; // String!
    publicFarmAnnouncer: string; // String!
    version: string; // String!
  }
  Mutation: {};
  Query: {};
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  HSFarm: { // field return type
    FarmLiquidity: Array<NexusGenRootTypes['HSFarmLiquidity'] | null> | null; // [HSFarmLiquidity]
    chain: NexusGenEnums['HSBlockchain']; // HSBlockchain!
    contractId: string; // String!
    duration: NexusGenRootTypes['HSFarmDuration'] | null; // HSFarmDuration
    endBlock: string; // String!
    endDate: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    id: string; // String!
    isEnded: boolean | null; // Boolean
    isPartnerFarm: boolean | null; // Boolean
    lastUpdated: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    networkRewardsPerBlock: string; // String!
    pairTokenADecimals: string | null; // String
    pairTokenAId: string | null; // String
    pairTokenASymbol: string | null; // String
    pairTokenBDecimals: string | null; // String
    pairTokenBId: string | null; // String
    pairTokenBSymbol: string | null; // String
    primaryStakeTokenBalance: string | null; // String
    provider: NexusGenEnums['HSBlockchainProvider']; // HSBlockchainProvider!
    remainingRewards: NexusGenRootTypes['HSFarmRewards'] | null; // HSFarmRewards
    rewardTokenDecimals: number; // Int!
    rewardTokenId: string; // String!
    rewardTokenRewardsPerBlock: string; // String!
    rewardTokenSymbol: string; // String!
    rewardsPerBlock: NexusGenRootTypes['HSFarmRewardsPerBlock'] | null; // HSFarmRewardsPerBlock
    stakeTokenPool: NexusGenRootTypes['HSPool'] | null; // HSPool
    stakedTokenAmt: number; // Int!
    stakedTokenDecimals: number; // Int!
    stakedTokenId: string; // String!
    stakedTokenPoolId: string | null; // String
    stakedTokenSymbol: string; // String!
    stakedTokenTotalSupply: string; // String!
    startBlock: string; // String!
    startDate: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    tokens: NexusGenRootTypes['HSFarmTokens'] | null; // HSFarmTokens
    totalReward: NexusGenRootTypes['HSFarmRewards'] | null; // HSFarmRewards
    totalRewardA: string; // String!
    totalRewardB: string; // String!
    totalStaked: string | null; // String
  }
  HSFarmDuration: { // field return type
    ends: string; // String!
    starts: string; // String!
  }
  HSFarmLiquidity: { // field return type
    farm: NexusGenRootTypes['HSFarm'] | null; // HSFarm
    farmId: string; // String!
    id: number; // Int!
    lastUpdated: NexusGenScalars['HSDateTime']; // HSDateTime!
    primaryStakeTokenBalance: string; // String!
    remainingRewardA: string; // String!
    remainingRewardB: string; // String!
    totalStaked: string; // String!
  }
  HSFarmRewards: { // field return type
    A: string; // String!
    B: string; // String!
  }
  HSFarmRewardsPerBlock: { // field return type
    asDefaultNetworkToken: string; // String!
    asRewardToken: string; // String!
  }
  HSFarmTokens: { // field return type
    rewardToken: NexusGenRootTypes['HSToken'] | null; // HSToken
    stakeToken: NexusGenRootTypes['HSToken'] | null; // HSToken
  }
  HSLimitOrder: { // field return type
    amtA: string; // String!
    amtB: string; // String!
    announcerId: string; // String!
    contractId: string; // String!
    creator: string; // String!
    status: NexusGenEnums['HSLimitOrderStatus'] | null; // HSLimitOrderStatus
    tokenA: string; // String!
    tokenADecimals: number; // Int!
    tokenB: string; // String!
    tokenBDecimals: number; // Int!
  }
  HSPool: { // field return type
    PoolLiquidity: Array<NexusGenRootTypes['HSPoolLiquidity'] | null> | null; // [HSPoolLiquidity]
    apr7d: string | null; // String
    apr24h: string | null; // String
    chain: string; // String!
    duplicate: boolean | null; // Boolean
    id: string; // String!
    lastUpdated: NexusGenScalars['HSDateTime']; // HSDateTime!
    mintedLiquidityTokens: string; // String!
    n2nn: boolean | null; // Boolean
    poolAddress: string | null; // String
    poolTokenId: string; // String!
    provider: string; // String!
    tokenABalance: string; // String!
    tokenADecimals: number; // Int!
    tokenAFees: string; // String!
    tokenAId: string; // String!
    tokenBBalance: string; // String!
    tokenBDecimals: number; // Int!
    tokenBFees: string; // String!
    tokenBId: string; // String!
    tokens: Array<NexusGenRootTypes['HSToken'] | null> | null; // [HSToken]
    tradeable: boolean | null; // Boolean
    volume7d: string | null; // String
    volume24h: string | null; // String
  }
  HSPoolLiquidity: { // field return type
    apr7d: string | null; // String
    apr24h: string | null; // String
    id: number; // Int!
    lastUpdated: NexusGenScalars['HSDateTime'] | null; // HSDateTime
    mintedLiquidityTokens: string; // String!
    poolId: string; // String!
    tokenABalance: string; // String!
    tokenAFees: string; // String!
    tokenBBalance: string; // String!
    tokenBFees: string; // String!
    volume7d: string | null; // String
    volume24h: string | null; // String
  }
  HSSDKSettings: { // field return type
    environment: string; // String!
    partnerFarmAnnouncerId: string; // String!
    protocolAddress: string; // String!
    protocolId: string; // String!
    publicFarmAnnouncer: string; // String!
    version: NexusGenEnums['HSSDKVersion']; // HSSDKVersion!
  }
  HSToken: { // field return type
    decimals: number; // Int!
    id: string; // String!
    name: string; // String!
    supply: string; // String!
    symbol: string; // String!
    url: string | null; // String
    verificationTier: NexusGenEnums['HSVerificationTier'] | null; // HSVerificationTier
    verified: boolean | null; // Boolean
  }
  HSVersions: { // field return type
    id: number; // Int!
    limitOrderAnnouncer: string; // String!
    partnerFarmAnnouncer: string; // String!
    protocolId: string; // String!
    publicFarmAnnouncer: string; // String!
    version: string; // String!
  }
  Mutation: { // field return type
    update: string | null; // String
    updateLimitOrderStatus: NexusGenRootTypes['HSLimitOrder'] | null; // HSLimitOrder
    updatePool: NexusGenRootTypes['HSPool'] | null; // HSPool
  }
  Query: { // field return type
    convertBlockToDate: string | null; // String
    getFarm: NexusGenRootTypes['HSFarm'] | null; // HSFarm
    getFarmLiquidity: NexusGenRootTypes['HSFarmLiquidity'] | null; // HSFarmLiquidity
    getHistoricalFarmLiquidity: Array<NexusGenRootTypes['HSFarmLiquidity'] | null> | null; // [HSFarmLiquidity]
    getHistoricalPoolLiquidity: Array<NexusGenRootTypes['HSPoolLiquidity'] | null> | null; // [HSPoolLiquidity]
    getLPTokenValue: Array<string | null> | null; // [String]
    getLimitOrderById: NexusGenRootTypes['HSLimitOrder'] | null; // HSLimitOrder
    getPool: NexusGenRootTypes['HSPool'] | null; // HSPool
    getPoolByLPToken: NexusGenRootTypes['HSPool'] | null; // HSPool
    getPoolLiquidity: NexusGenRootTypes['HSPoolLiquidity'] | null; // HSPoolLiquidity
    getSDKAddress: string | null; // String
    getToken: NexusGenRootTypes['HSToken'] | null; // HSToken
    getUserFarmStake: string | null; // String
    listActiveFarms: Array<NexusGenRootTypes['HSFarm'] | null> | null; // [HSFarm]
    listAnnouncers: NexusGenRootTypes['HSSDKSettings'] | null; // HSSDKSettings
    listEndedFarms: Array<NexusGenRootTypes['HSFarm'] | null> | null; // [HSFarm]
    listFarms: Array<NexusGenRootTypes['HSFarm'] | null> | null; // [HSFarm]
    listLimitOrders: Array<NexusGenRootTypes['HSLimitOrder'] | null> | null; // [HSLimitOrder]
    listNetworkTokenPools: Array<NexusGenRootTypes['HSPool'] | null> | null; // [HSPool]
    listNonNetworkTokenPools: Array<NexusGenRootTypes['HSPool'] | null> | null; // [HSPool]
    listPools: Array<NexusGenRootTypes['HSPool'] | null> | null; // [HSPool]
    listTokens: Array<NexusGenRootTypes['HSToken'] | null> | null; // [HSToken]
    listUpcomingFarms: Array<NexusGenRootTypes['HSFarm'] | null> | null; // [HSFarm]
    searchFarmByStakeToken: Array<NexusGenRootTypes['HSFarm'] | null> | null; // [HSFarm]
    searchPools: Array<NexusGenRootTypes['HSPool'] | null> | null; // [HSPool]
    searchTokens: Array<NexusGenRootTypes['HSToken'] | null> | null; // [HSToken]
    signMoonpayUrl: string | null; // String
  }
}

export interface NexusGenFieldTypeNames {
  HSFarm: { // field return type name
    FarmLiquidity: 'HSFarmLiquidity'
    chain: 'HSBlockchain'
    contractId: 'String'
    duration: 'HSFarmDuration'
    endBlock: 'String'
    endDate: 'HSDateTime'
    id: 'String'
    isEnded: 'Boolean'
    isPartnerFarm: 'Boolean'
    lastUpdated: 'HSDateTime'
    networkRewardsPerBlock: 'String'
    pairTokenADecimals: 'String'
    pairTokenAId: 'String'
    pairTokenASymbol: 'String'
    pairTokenBDecimals: 'String'
    pairTokenBId: 'String'
    pairTokenBSymbol: 'String'
    primaryStakeTokenBalance: 'String'
    provider: 'HSBlockchainProvider'
    remainingRewards: 'HSFarmRewards'
    rewardTokenDecimals: 'Int'
    rewardTokenId: 'String'
    rewardTokenRewardsPerBlock: 'String'
    rewardTokenSymbol: 'String'
    rewardsPerBlock: 'HSFarmRewardsPerBlock'
    stakeTokenPool: 'HSPool'
    stakedTokenAmt: 'Int'
    stakedTokenDecimals: 'Int'
    stakedTokenId: 'String'
    stakedTokenPoolId: 'String'
    stakedTokenSymbol: 'String'
    stakedTokenTotalSupply: 'String'
    startBlock: 'String'
    startDate: 'HSDateTime'
    tokens: 'HSFarmTokens'
    totalReward: 'HSFarmRewards'
    totalRewardA: 'String'
    totalRewardB: 'String'
    totalStaked: 'String'
  }
  HSFarmDuration: { // field return type name
    ends: 'String'
    starts: 'String'
  }
  HSFarmLiquidity: { // field return type name
    farm: 'HSFarm'
    farmId: 'String'
    id: 'Int'
    lastUpdated: 'HSDateTime'
    primaryStakeTokenBalance: 'String'
    remainingRewardA: 'String'
    remainingRewardB: 'String'
    totalStaked: 'String'
  }
  HSFarmRewards: { // field return type name
    A: 'String'
    B: 'String'
  }
  HSFarmRewardsPerBlock: { // field return type name
    asDefaultNetworkToken: 'String'
    asRewardToken: 'String'
  }
  HSFarmTokens: { // field return type name
    rewardToken: 'HSToken'
    stakeToken: 'HSToken'
  }
  HSLimitOrder: { // field return type name
    amtA: 'String'
    amtB: 'String'
    announcerId: 'String'
    contractId: 'String'
    creator: 'String'
    status: 'HSLimitOrderStatus'
    tokenA: 'String'
    tokenADecimals: 'Int'
    tokenB: 'String'
    tokenBDecimals: 'Int'
  }
  HSPool: { // field return type name
    PoolLiquidity: 'HSPoolLiquidity'
    apr7d: 'String'
    apr24h: 'String'
    chain: 'String'
    duplicate: 'Boolean'
    id: 'String'
    lastUpdated: 'HSDateTime'
    mintedLiquidityTokens: 'String'
    n2nn: 'Boolean'
    poolAddress: 'String'
    poolTokenId: 'String'
    provider: 'String'
    tokenABalance: 'String'
    tokenADecimals: 'Int'
    tokenAFees: 'String'
    tokenAId: 'String'
    tokenBBalance: 'String'
    tokenBDecimals: 'Int'
    tokenBFees: 'String'
    tokenBId: 'String'
    tokens: 'HSToken'
    tradeable: 'Boolean'
    volume7d: 'String'
    volume24h: 'String'
  }
  HSPoolLiquidity: { // field return type name
    apr7d: 'String'
    apr24h: 'String'
    id: 'Int'
    lastUpdated: 'HSDateTime'
    mintedLiquidityTokens: 'String'
    poolId: 'String'
    tokenABalance: 'String'
    tokenAFees: 'String'
    tokenBBalance: 'String'
    tokenBFees: 'String'
    volume7d: 'String'
    volume24h: 'String'
  }
  HSSDKSettings: { // field return type name
    environment: 'String'
    partnerFarmAnnouncerId: 'String'
    protocolAddress: 'String'
    protocolId: 'String'
    publicFarmAnnouncer: 'String'
    version: 'HSSDKVersion'
  }
  HSToken: { // field return type name
    decimals: 'Int'
    id: 'String'
    name: 'String'
    supply: 'String'
    symbol: 'String'
    url: 'String'
    verificationTier: 'HSVerificationTier'
    verified: 'Boolean'
  }
  HSVersions: { // field return type name
    id: 'Int'
    limitOrderAnnouncer: 'String'
    partnerFarmAnnouncer: 'String'
    protocolId: 'String'
    publicFarmAnnouncer: 'String'
    version: 'String'
  }
  Mutation: { // field return type name
    update: 'String'
    updateLimitOrderStatus: 'HSLimitOrder'
    updatePool: 'HSPool'
  }
  Query: { // field return type name
    convertBlockToDate: 'String'
    getFarm: 'HSFarm'
    getFarmLiquidity: 'HSFarmLiquidity'
    getHistoricalFarmLiquidity: 'HSFarmLiquidity'
    getHistoricalPoolLiquidity: 'HSPoolLiquidity'
    getLPTokenValue: 'String'
    getLimitOrderById: 'HSLimitOrder'
    getPool: 'HSPool'
    getPoolByLPToken: 'HSPool'
    getPoolLiquidity: 'HSPoolLiquidity'
    getSDKAddress: 'String'
    getToken: 'HSToken'
    getUserFarmStake: 'String'
    listActiveFarms: 'HSFarm'
    listAnnouncers: 'HSSDKSettings'
    listEndedFarms: 'HSFarm'
    listFarms: 'HSFarm'
    listLimitOrders: 'HSLimitOrder'
    listNetworkTokenPools: 'HSPool'
    listNonNetworkTokenPools: 'HSPool'
    listPools: 'HSPool'
    listTokens: 'HSToken'
    listUpcomingFarms: 'HSFarm'
    searchFarmByStakeToken: 'HSFarm'
    searchPools: 'HSPool'
    searchTokens: 'HSToken'
    signMoonpayUrl: 'String'
  }
}

export interface NexusGenArgTypes {
  HSFarm: {
    duration: { // args
      format?: string | null; // String
    }
  }
  Mutation: {
    update: { // args
      auth: string; // String!
    }
    updateLimitOrderStatus: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      status?: NexusGenEnums['HSLimitOrderStatus'] | null; // HSLimitOrderStatus
    }
    updatePool: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      tokenAId: string; // String!
      tokenBId: string; // String!
    }
  }
  Query: {
    convertBlockToDate: { // args
      blockNumber: string; // String!
      format?: string | null; // String
    }
    getFarm: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getFarmLiquidity: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getHistoricalFarmLiquidity: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      startFromDate?: string | null; // String
    }
    getHistoricalPoolLiquidity: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      startFromDate?: string | null; // String
    }
    getLPTokenValue: { // args
      assetBalance: string; // String!
      assetId: string; // String!
    }
    getLimitOrderById: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getPool: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getPoolByLPToken: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      poolTokenId: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getPoolLiquidity: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getSDKAddress: { // args
      auth: string; // String!
    }
    getToken: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id: string; // String!
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    getUserFarmStake: { // args
      address: string; // String!
      announcerId?: string | null; // String
      assetId: string; // String!
      block?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    listActiveFarms: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    listAnnouncers: { // args
      env: string; // String!
      version: string; // String!
    }
    listEndedFarms: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    listFarms: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    listLimitOrders: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      creator?: string | null; // String
      limit?: number | null; // Int
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      status?: NexusGenEnums['HSLimitOrderStatus'] | null; // HSLimitOrderStatus
    }
    listNetworkTokenPools: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      duplicate?: boolean | null; // Boolean
      limit?: number | null; // Int
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      tradeable?: boolean | null; // Boolean
    }
    listNonNetworkTokenPools: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      duplicate?: boolean | null; // Boolean
      limit?: number | null; // Int
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      tradeable?: boolean | null; // Boolean
    }
    listPools: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      duplicate?: boolean | null; // Boolean
      limit?: number | null; // Int
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      tokenAId?: string | null; // String
      tokenBId?: string | null; // String
      tradeable?: boolean | null; // Boolean
    }
    listTokens: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      ids?: Array<string | null> | null; // [String]
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    listUpcomingFarms: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    searchFarmByStakeToken: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      ids?: string[] | null; // [String!]
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
    }
    searchPools: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      duplicate?: boolean | null; // Boolean
      limit?: number | null; // Int
      offset?: number | null; // Int
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      token1?: string | null; // String
      token2?: string | null; // String
      tradeable?: boolean | null; // Boolean
    }
    searchTokens: { // args
      announcerId?: string | null; // String
      chain: NexusGenEnums['HSBlockchain'] | null; // HSBlockchain
      id?: string | null; // String
      name?: string | null; // String
      provider: NexusGenEnums['HSBlockchainProvider'] | null; // HSBlockchainProvider
      symbol?: string | null; // String
    }
    signMoonpayUrl: { // args
      amount: string; // String!
      currency: string; // String!
      walletAddress: string; // String!
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: GQLContext;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}