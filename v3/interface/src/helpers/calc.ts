import { getCurrentNetwork } from 'helpers/getReach'
import { NETWORKS } from 'constants/reach_constants'

const getBlocksPerDay = () => {
  const connector = getCurrentNetwork()
  const netw = NETWORKS[connector]

  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round(msPerDay / netw.blockDuration)
}

const calcFarmRewards = (
  numberOfDays: number,
  rewardPerBlock: string,
  stakedAmt: string,
  totalStaked: string | number,
) =>
  getBlocksPerDay() *
  numberOfDays *
  Number(rewardPerBlock) *
  (Number(stakedAmt) / (Number(totalStaked) + Number(stakedAmt)))

export const calcPoolRewards = (
  amount: string,
  numberOfDays: number,
  apr: number,
) => ((Number(amount) * apr) / 365) * numberOfDays

export default calcFarmRewards
