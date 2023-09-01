import { checkForLPTokens, fetchAllTokenBalances } from 'reach/utils'
import { ReachAccount } from 'types/shared'
import { t } from '@lingui/macro'
import {
  FarmAndTokens,
  checkRewardsAvailableAt,
  checkStakingBalance,
  createReachAPI,
  fetchFarmAndTokens,
  harvestStakingRewards,
  stakeTokensToFarm,
  tokenBalance,
  unstakeTokensFromFarm,
} from '@reach-sh/humble-sdk'
import { getTokenById } from 'helpers/pool'
import { SDKStakeUpdate } from '@reach-sh/humble-sdk/lib/utils/utils.staker'
import { GlobalUser } from 'state/reducers/user'

type BigNumber = any
type FarmDeployerOpts = {
  duration: BigNumber
  rewardToken1: BigNumber
  rewardsPerBlock: [BigNumber, BigNumber]
  stakeToken: BigNumber
}
export type FarmView = {
  /** When farming pool ends */
  end: BigNumber
  /** Initial values submitted by contract creator */
  opts: FarmDeployerOpts
  /** Amount of rewards left in contract [`network`, `nonNetwork`] */
  remainingRewards: [BigNumber, BigNumber]
  /** Total amount staked in contract */
  totalStaked: BigNumber
}

type StakingRewards = [any, any]

/** Farming pool view */
export type StakingContractView = {
  Info(): Promise<FarmView>
  /** Amount staked */
  staked(addr: string): Promise<BigNumber>
  /** Round when rewards will be available for `addr` */
  rewardsAvailableAt(addr: string, round: BigNumber): Promise<StakingRewards>
}

export const getActiveUser = () => {
  const { reachAccount: acc } = GlobalUser.getState()
  return acc
}

/**
 * Get information about staking pool (token ids, amount staked, etc)
 * @param id Staking pool id
 * @returns General information about staking pool
 */
export const getStakingPoolInfo = async (
  id: string | number,
): Promise<FarmAndTokens> => {
  const opts = { poolAddress: id.toString(), formatResult: true }
  const acc = getActiveUser()
  const result = await fetchFarmAndTokens(acc, opts)
  if (!result.succeeded || !result.data) {
    const err = result.message || t`Could not fetch Farm`
    return Promise.reject(err)
  }

  return result.data
}

/**
 * Check user's staked amount in staking pool `farmId`
 * @param poolAddress App ID of staking pool
 * @returns Number or BigNumber of user's staking balance
 */
export const getStakingBalance = async (
  poolAddress: string | number,
): Promise<string> => {
  const address = { poolAddress: poolAddress.toString() }
  const result = await checkStakingBalance(getActiveUser(), address)

  if (!result.succeeded || !result.data) {
    const err = result.message || t`Could not fetch balance`
    return Promise.reject(err)
  }

  return result.data.balance
}

/**
 * Check rewards available to user at blocktime `time`
 * @param poolAddress App ID of staking pool
 * @returns `[networkRewards, rewardTokenRewards]` Array of rewards available to user at `time`
 */
export async function getFormattedRewards(
  poolAddress: number | string,
): Promise<[networkRewards: string, rewardTokenRewards: string]> {
  const acc = getActiveUser()
  const time = await createReachAPI().getNetworkTime()
  const result = await checkRewardsAvailableAt(acc, { poolAddress, time })
  if (!result.succeeded || !result.data) {
    const err = result.message || t`Could not fetch balance`
    return Promise.reject(err)
  }

  return result.data
}

export const getBalanceOfToken = async (id: string) => {
  const acc = getActiveUser()
  if (!acc) return '0'
  const token = getTokenById(id)
  return token
    ? tokenBalance(acc, { id, tokenDecimals: token.decimals })
    : tokenBalance(acc, { id })
}

/**
 * Claim rewards from staking pool
 * @param contractId ID of staking pool
 * @returns TODO
 */
export const claimRewards = async (
  contractId: string | number,
  rewardTokenId: string | number,
): Promise<{
  totalRemaining: [string, string]
  userReceived: [string, string]
}> => {
  const acc = getActiveUser()
  await acc.tokenAccept(rewardTokenId)
  const poolAddress = contractId.toString()
  const result = await harvestStakingRewards(acc, { poolAddress })

  if (!result.succeeded || !result.data) {
    throw new Error(result.message)
  }

  await fetchAllTokenBalances()
  return result.data
}

/**
 * Stake Amount
 * @param contractId ID of staking pool
 * @param amount Amount to stake
 * @returns TODO
 */
export const stakeAmount = async (
  contractId: string | number,
  amount: number,
  rewardTokenId: string | number,
  stakedTokenId: string | number,
): Promise<SDKStakeUpdate> => {
  const acc: ReachAccount = getActiveUser()
  await ensureTokensOptIn(acc, stakedTokenId, rewardTokenId)
  const result = await stakeTokensToFarm(acc, {
    poolAddress: contractId.toString(),
    amountToStake: amount,
  })

  if (!result.succeeded || !result.data) {
    throw new Error(result.message)
  }

  await fetchAllTokenBalances()
  await checkForLPTokens(stakedTokenId) // Update balance of LP tokens for pool list

  return result.data
}

/**
 * Untake Amount
 * @param contractId ID of staking pool
 * @param amount Amount to unstake
 * @returns TODO
 */
export const unstakeAmount = async (
  contractId: string | number,
  amount: number,
  stakedTokenId: string | number,
  rewardTokenId: string | number,
): Promise<SDKStakeUpdate> => {
  const acc: ReachAccount = getActiveUser()

  await ensureTokensOptIn(acc, stakedTokenId, rewardTokenId)

  const result = await unstakeTokensFromFarm(acc, {
    amount,
    poolAddress: contractId.toString(),
  })

  if (!result.succeeded || !result.data) {
    throw new Error(result.message)
  }
  await fetchAllTokenBalances()
  await checkForLPTokens(stakedTokenId) // Update balance of LP tokens for pool list

  return result.data
}

export const ensureTokensOptIn = async (
  acc: ReachAccount,
  stakedTokenId: string | number,
  rewardTokenId: string | number,
) => {
  await acc.tokenAccept(stakedTokenId)
  await acc.tokenAccept(rewardTokenId)
}
