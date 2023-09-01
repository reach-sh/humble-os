/** @file GraphQL Queries */

/** Pools graphql fragment */
export const HSPoolFragment = `
    poolAddress
    poolTokenId
    tokenAId
    tokenADecimals
    tokenBId
    tokenBDecimals
    n2nn
    lastUpdated
    mintedLiquidityTokens
    tokenABalance
    tokenAFees
    tokenBBalance
    tokenBFees
`

/** Limit Order graphql fragment */
export const HSLimitOrderFragment = `
    contractId
    creator
    status
    amtA
    amtB
    announcerId
    tokenA
    tokenADecimals
    tokenB
    tokenBDecimals
`

/** Token graphql fragment */
export const HSTokenFragment = `
    id
    name
    decimals
    supply
    symbol
    url
    verified
    verificationTier
`

/** Farm graphql fragment */
export const HSFarmFragment = `
    contractId
    endBlock
    isPartnerFarm
    pairTokenAId
    pairTokenASymbol
    pairTokenBId
    pairTokenBSymbol
    primaryStakeTokenBalance
    remainingRewards { A, B }
    rewardsPerBlock { asDefaultNetworkToken, asRewardToken }
    rewardTokenDecimals
    rewardTokenId
    rewardTokenSymbol
    stakedTokenAmt
    stakedTokenDecimals
    stakedTokenId
    stakedTokenPoolId
    stakedTokenSymbol
    stakedTokenTotalSupply
    startBlock
    startDate
    endDate
    totalReward { A, B }
    totalStaked
`
