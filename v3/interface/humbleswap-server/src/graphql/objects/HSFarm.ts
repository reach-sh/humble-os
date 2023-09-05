import { DateTime } from 'luxon'
import { objectType, stringArg } from 'nexus'
import { getPoolById } from '../services/Pools.service'
import { getTokenById } from '../services/Tokens.service'
import { lastObjInArray } from '../utils'

export const HSFarmRewardsPerBlock = objectType({
  name: 'HSFarmRewardsPerBlock',
  description: 'Rewards paid out per block',
  definition(t) {
    t.nonNull.string('asDefaultNetworkToken')
    t.nonNull.string('asRewardToken')
  },
})

export const HSFarmRewards = objectType({
  name: 'HSFarmRewards',
  description: 'Initial or remaining rewards in farm',
  definition(t) {
    t.nonNull.string('A')
    t.nonNull.string('B')
  },
})

export const HSFarmDuration = objectType({
  name: 'HSFarmDuration',
  description: 'Farm duration (start/end dates)',
  definition(t) {
    t.nonNull.string('starts')
    t.nonNull.string('ends')
  },
})

export const HSFarmTokens = objectType({
  name: 'HSFarmTokens',
  description: "Farm's reward and staking tokens",
  definition(t) {
    t.field('stakeToken', { type: 'HSToken' })
    t.field('rewardToken', { type: 'HSToken' })
  },
})

export const HSFarm = objectType({
  name: 'HSFarm',
  description: 'A staking farm',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('contractId', { resolve: ({ id }) => id })
    t.nonNull.string('stakedTokenId')
    t.nonNull.string('rewardTokenId')
    t.nonNull.string('startBlock')
    t.nonNull.string('endBlock')
    t.nonNull.string('networkRewardsPerBlock')
    t.nonNull.string('rewardTokenRewardsPerBlock')
    t.nonNull.string('totalRewardA')
    t.nonNull.string('totalRewardB')
    t.nonNull.string('stakedTokenSymbol')
    t.nonNull.int('stakedTokenDecimals')
    t.nonNull.string('rewardTokenSymbol')
    t.nonNull.int('rewardTokenDecimals')
    t.nonNull.field('chain', { type: 'HSBlockchain' })
    t.nonNull.field('provider', { type: 'HSBlockchainProvider' })
    t.nonNull.string('stakedTokenTotalSupply')
    t.nonNull.field('stakedTokenAmt', {
      type: 'Int',
      description: 'How much current user has staked. Always 0 in DB',
      resolve: () => 0,
    })

    // Nullable properties
    t.date('startDate')
    t.date('endDate')
    t.boolean('isPartnerFarm')
    t.string('stakedTokenPoolId')
    t.string('pairTokenAId')
    t.string('pairTokenASymbol')
    t.string('pairTokenADecimals')
    t.string('pairTokenBId')
    t.string('pairTokenBSymbol')
    t.string('pairTokenBDecimals')

    // Historical Liquidity information
    t.list.field('FarmLiquidity', { type: 'HSFarmLiquidity' })

    // Computed fields
    t.field('duration', {
      type: 'HSFarmDuration',
      description: 'Farm start and end dates',
      args: { format: stringArg() },
      resolve({ startDate, endDate }, { format }) {
        const fmt = (d: any) => DateTime.fromJSDate(d).toFormat(format || 'ff')
        return { starts: fmt(startDate), ends: fmt(endDate) }
      },
    })

    t.field('isEnded', {
      type: 'Boolean',
      description: 'When true, Farm rewards payout has ended',
      resolve({ endDate }) {
        return DateTime.fromJSDate(endDate) < DateTime.now()
      },
    })

    t.field('rewardsPerBlock', {
      type: 'HSFarmRewardsPerBlock',
      description: 'Rewards paid out per block',
      resolve({ networkRewardsPerBlock, rewardTokenRewardsPerBlock }) {
        return {
          asDefaultNetworkToken: networkRewardsPerBlock,
          asRewardToken: rewardTokenRewardsPerBlock,
        }
      },
    })

    t.field('totalReward', {
      type: 'HSFarmRewards',
      description: 'Total Rewards allocated for Farm duration',
      resolve({ totalRewardA, totalRewardB }) {
        return { A: totalRewardA, B: totalRewardB }
      },
    })

    t.field('lastUpdated', {
      type: 'HSDateTime',
      resolve({ FarmLiquidity }) {
        if (!Array.isArray(FarmLiquidity) || !FarmLiquidity.length)
          return new Date()
        const l = FarmLiquidity.length - 1
        return FarmLiquidity[l]?.lastUpdated
      },
    })

    t.field('remainingRewards', {
      type: 'HSFarmRewards',
      resolve({ FarmLiquidity }) {
        const lq = lastObjInArray(FarmLiquidity)
        return {
          A: lq?.remainingRewardA || '0',
          B: lq?.remainingRewardB || '0',
        }
      },
    })

    t.field('totalStaked', {
      type: 'String',
      resolve({ FarmLiquidity }) {
        return lastObjInArray(FarmLiquidity).totalStaked ?? '0'
      },
    })

    t.string('primaryStakeTokenBalance', {
      description: "How much of 'stake token' has been minted",
      resolve({ FarmLiquidity }) {
        return lastObjInArray(FarmLiquidity).primaryStakeTokenBalance ?? '0'
      },
    })

    t.field('stakeTokenPool', {
      type: 'HSPool',
      description: "Liquidity Pool for farm's staking token",
      resolve({ stakedTokenPoolId }) {
        return stakedTokenPoolId ? getPoolById({ id: stakedTokenPoolId }) : null
      },
    })

    t.field('tokens', {
      type: 'HSFarmTokens',
      description: 'Stake and reward token',
      async resolve({ stakedTokenId, rewardTokenId }) {
        const [stakeToken, rewardToken] = await Promise.all([
          getTokenById({ id: stakedTokenId }),
          getTokenById({ id: rewardTokenId }),
        ])

        return { stakeToken, rewardToken }
      },
    })
  },
})

