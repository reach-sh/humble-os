import { t } from '@lingui/macro'
import { createStakingPool } from '@reach-sh/humble-sdk'
import {
  FarmDurationData,
  FarmRewardsData,
} from 'components/Farm/CreateFarmForm.Validate'
import { maybeOpenWallet } from 'helpers/user'
import {
  initProgressBar,
  moveProgressBar,
  resetProgressBar,
} from 'state/reducers/progress-bar'
import { stakeAmount } from 'reach/api/staker'
import { GlobalUser } from 'state/store'
import { cacheAndLoadFarm } from 'helpers/farm'

export type FarmTokenFormData = { stakeTokenId: string }

export type FarmFormData = FarmTokenFormData &
  FarmRewardsData &
  FarmDurationData & { isPublicFarm: boolean }

const createFarmSteps = [
  t({ message: 'Creating Farm Application ...' }),
  t({ message: 'Opt-in to Farm (for rewards payout) ...' }),
  t({ message: 'Configuring application ...' }),
  t({ message: 'Transferring rewards payout ...' }),
  t({ message: 'Wrapping up Farm Application ...' }),
  // Optional step for public farms
  t({ message: 'Depositing required minimum stake ...' }),
]

export async function createFarm(data: FarmFormData) {
  const { reachAccount: account } = GlobalUser.getState()
  maybeOpenWallet()

  // Additional steps (min. deposit; announce farm) triggered manually belopw
  initProgressBar(data.isPublicFarm ? 6 : createFarmSteps.length)

  const result = await deployFarm(account, data)
  const done = () => {
    resetProgressBar()
    return result
  }

  const farmId = result.poolAddress?.toString()

  // Skip min-stake for partner farms: new farm is not fully set up,
  // so SDk cannot fetch it to determine the stake token. But if you
  //  got here, the farm exists.
  if (!farmId || !data.isPublicFarm) return done()

  // Minimum stake (1 of stake token) -- public farms only
  moveProgressBar(createFarmSteps)
  await stakeAmount(farmId, 1, data.rewardTokenId, data.stakeTokenId)

  // cache new farm for user
  await cacheAndLoadFarm(account, farmId)
  return done()
}

/* Deploy farm contract */
async function deployFarm(account: any, data: FarmFormData) {
  try {
    const result = await createStakingPool(account, {
      opts: {
        rewardTokenId: data.rewardTokenId,
        stakeTokenId: data.stakeTokenId,
        totalRewardsPayout: [data.networkRewards || '0', data.totalReward],
        startBlock: data.startDateTime,
        endBlock: data.endDateTime,
        rewarder0: data.networkRewardsFunder,
      },
      onProgress(msg: string) {
        if (msg !== 'SIGNING_EVENT') return
        moveProgressBar(createFarmSteps)
        maybeOpenWallet()
      },
    })
    return result
  } catch (error: any) {
    return { succeeded: false, poolAddress: '', message: error.toString() }
  }
}
