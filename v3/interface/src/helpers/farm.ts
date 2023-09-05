import {
  CURRENT_PROVIDER,
  MAX_UINT,
  PROVIDERS,
} from 'constants/reach_constants'
import { getActiveUser } from 'reach/api/staker'
import { formatCurrency } from 'reach/utils'
import { Farm, Pool } from 'types/shared'
import {
  checkStakingBalance,
  createReachAPI,
  fetchFarmAndTokens,
  fetchStakingPool,
  ReachAccount,
  StaticFarmDataFormatted,
} from '@reach-sh/humble-sdk'
import { staticFarmToFarm } from 'cache/farms'
import { utils } from 'ethers'
import { GlobalDex } from 'state/reducers/dex'
import cacheReducer from 'state/cacheReducer'
import { getCurrentNetwork } from './getReach'
import { getTokenById } from './pool'

const getBalanceTokenLink = () => {
  if (CURRENT_PROVIDER === PROVIDERS.DEVNET)
    return 'http://localhost:8980/v2/accounts?limit=1&asset-id='
  return `https://indexer.${
    CURRENT_PROVIDER === PROVIDERS.TESTNET ? 'testnet.' : ''
  }algoexplorerapi.io/stats/v2/accounts/rich-list?limit=1&asset-id=`
}

const getBalanceTokenHeaders = () =>
  CURRENT_PROVIDER === PROVIDERS.DEVNET
    ? {
        headers: {
          'X-Indexer-API-Token': 'reach-devnet',
        },
      }
    : {}

const fetchPrimaryStakeTokenBalance = async (assetId: string) => {
  const asset = await fetch(
    `${getBalanceTokenLink()}${assetId}`,
    getBalanceTokenHeaders(),
  ).then((res) => res.json())
  return Array.isArray(asset.accounts) ? asset.accounts[0]?.balance || 0 : 0
}

const fetchFarm = async (
  farm: StaticFarmDataFormatted,
): Promise<Farm | undefined> => {
  try {
    const acc = getActiveUser()
    if (farm === undefined || !getActiveUser()) return undefined
    const opts = { poolAddress: farm.ctcInfo, formatResult: true }
    const { succeeded, contract, data } = await fetchStakingPool(acc, opts)

    const { succeeded: balSucceeded, data: balData } =
      await checkStakingBalance(acc, {
        poolAddress: farm.ctcInfo,
        stakeTokenDecimals: farm.stakedTokenDecimals,
        contract,
      })

    if (succeeded && balSucceeded) {
      const primaryStakeTokenBalance = await fetchPrimaryStakeTokenBalance(
        farm.stakedTokenId,
      )

      const updatedFarm = {
        ...staticFarmToFarm(farm),
        startBlock: data.start || '',
        endBlock: data.end || '',
        remainingRewardA: data.remainingRewards[0],
        remainingRewardB: data.remainingRewards[1],
        stakedTokenAmt: balData.balance,
        totalStaked: data.totalStaked,
        totalReward: {
          A: data.totalRewards.network,
          B: data.totalRewards.rewardToken,
        },
        rewardsPerBlock: {
          asDefaultNetworkToken: data.opts?.rewardsPerBlock?.[0] || '0',
          asRewardToken: data.opts?.rewardsPerBlock?.[1] || '0',
        },
        primaryStakeTokenBalance: formatCurrency(
          primaryStakeTokenBalance,
          farm.stakedTokenDecimals,
        ),
      }
      return updatedFarm
    }
  } catch (e) {
    // eslint-disable-next-line
    console.error('Fetch failed for farm with id:', farm.ctcInfo)
  }
  return staticFarmToFarm(farm)
}

export const getFarmPoolTokens = (farm?: Farm, pools?: Pool[]) => {
  const empty = Array(3)
  if (!farm || !pools) return empty

  const {
    pairTokenAId,
    pairTokenBId,
    stakedTokenId,
    stakedTokenPoolId,
    stakedTokenSymbol,
    rewardTokenId,
  } = farm || {}

  if (stakedTokenSymbol !== 'HMBL3LT') {
    const mainTokenId = pairTokenAId || stakedTokenId
    return [
      getTokenById(mainTokenId),
      getTokenById(pairTokenBId),
      getTokenById(rewardTokenId),
    ]
  }
  const findByLPToken = (id: string) => pools.find((p) => p.poolTokenId === id)

  const pool = stakedTokenPoolId
    ? pools.find((p) => `${p.poolAddr}` === stakedTokenPoolId)
    : findByLPToken(stakedTokenId)

  return pool
    ? [
        getTokenById(pool?.tokAId),
        getTokenById(pool?.tokBId),
        getTokenById(rewardTokenId),
      ]
    : empty
}

export const cacheAndLoadFarm = async (
  acc: ReachAccount,
  contractInfo: string,
) => {
  const reach = createReachAPI()
  const connector = getCurrentNetwork()

  const { succeeded, data } = await fetchFarmAndTokens(acc, {
    poolAddress: contractInfo,
    formatResult: true,
    includeTokens: true,
  })
  if (succeeded === false || !data) return false

  const { farmView: info, rewardToken, stakeToken } = data
  if (!stakeToken || !rewardToken || stakeToken.supply === undefined)
    return false

  let stakedTokenTotalSupply = utils.parseUnits(
    stakeToken.supply.toString().replace('.', ''),
    0,
  )
  const maxSupply = reach.bigNumberify(MAX_UINT[connector])
  if (stakedTokenTotalSupply.gt(maxSupply)) stakedTokenTotalSupply = maxSupply

  const { pools } = GlobalDex.getState()
  const stakedTokenPool = pools.find(
    (p: Pool) => p.poolTokenId === stakeToken?.id.toString(),
  )
  const safeToken = (id?: string) =>
    id && stakedTokenPool ? getTokenById(id) : undefined
  const pairTokenA = safeToken(stakedTokenPool?.tokAId)
  const pairTokenB = safeToken(stakedTokenPool?.tokBId)
  const farm = await fetchFarm({
    ctcInfo: contractInfo,
    startBlock: info.opts.start,
    endBlock: info.opts.end,
    rewardTokenId: info.opts.rewardToken1,
    rewardsPerBlock: {
      asDefaultNetworkToken: info.opts?.rewardsPerBlock?.[0] || '0',
      asRewardToken: info.opts?.rewardsPerBlock?.[1] || '0',
    },
    stakedTokenId: info.opts.stakeToken,
    pairTokenAId: pairTokenA?.id?.toString(),
    pairTokenASymbol: pairTokenA?.symbol || '',
    pairTokenBId: pairTokenB?.id?.toString() || 0,
    pairTokenBSymbol: pairTokenB?.symbol || '',
    rewardTokenDecimals: rewardToken.decimals,
    rewardTokenSymbol: rewardToken.symbol,
    stakedTokenDecimals: stakeToken.decimals,
    stakedTokenPoolId: stakedTokenPool?.poolAddr?.toString(),
    stakedTokenSymbol: stakeToken.symbol,
    stakedTokenTotalSupply: stakedTokenTotalSupply.toString(),
  })

  if (farm) cacheReducer.farms.update(farm)

  return farm
}

export default fetchFarm
