import { t } from '@lingui/macro'
import { checkRewardsImbalance, getBlockchain } from '@reach-sh/humble-sdk'
import { PROMPTS, WARNINGS } from 'constants/messages'
import { getTokenById } from 'helpers/pool'
import { FarmFormData } from 'reach/bridge/FarmAdmin'
import { isIOS } from 'react-device-detect'
import { GlobalDex } from 'state/store'

const getTokenBalance = (tokenId: string) => {
  const { tokenList } = GlobalDex.getState()
  const match = tokenList.find(({ id }) => String(tokenId) === String(id))
  return Number(match?.balance || 0)
}

// Function to check at least one pool contains that token
export const checkPoolsContainingTokenId = (tokenId?: string) => {
  if (!tokenId) return true
  const { pools } = GlobalDex.getState()
  if (!pools.length) return false
  return (
    pools.findIndex(
      ({ tokAId, tokBId }) => tokAId === '0' && tokBId === tokenId,
    ) > -1
  )
}

export type FarmDurationData = {
  startDateTime: string
  endDateTime: string
}

export type FarmRewardsData = {
  networkRewards: string | undefined // undefined means user hasn't opted in to ALGO Rewards
  networkRewardsFunder: string
  rewardTokenId: string
  totalReward: string
}

export type ValidateOpts = {
  rewardsSelected?: boolean
  networkRewardsAmt?: boolean
  isPublicFarm?: boolean
  tokenRewardsAmt?: boolean
  requiredAcctMin?: number
}
const ln1 = t`Rewards cannot be evenly distributed across the duration of your farm.`
const ln2 = t`If possible, try either a shorter duration or increased rewards payout.`
const WARN_RWDS_IMBL = `${ln1} ${ln2}`

export async function validateFarmForm(data: FarmFormData, opts: ValidateOpts) {
  if (isIOS) return t`Connect on desktop to create farms`
  if (!data.stakeTokenId) return t`Please select a staking token.`

  const chain = getBlockchain()
  const rewardToken = getTokenById(data.rewardTokenId)
  const stakeToken = getTokenById(data.stakeTokenId)
  const rewardTokenDecimals = rewardToken?.decimals
  const rtSymbol = rewardToken?.symbol
  const { BALANCE_REQUIRED, BALANCE_LOW } = WARNINGS
  const minReq = BALANCE_REQUIRED.replace('%AMT%', '1').replace(
    '%%',
    stakeToken?.symbol || 'stake token',
  )

  switch (true) {
    case Number(getTokenBalance(data.stakeTokenId)) === 0: {
      return `${BALANCE_LOW}: ${minReq}`
    }

    case opts.rewardsSelected: {
      return t({ message: 'Please select at least one reward and an amount.' })
    }

    case opts.tokenRewardsAmt && Number(data.totalReward) === 0: {
      return rewardToken
        ? PROMPTS.SET_REWARD_PAYOUT.replace('%%', rewardToken.symbol)
        : t({ message: 'Please select a reward token.' })
    }

    case Number(data.networkRewards) > 0: {
      if (opts.isPublicFarm) {
        const bal = getTokenBalance('0')
        if (bal === 0) {
          return t({ message: `${BALANCE_LOW}: you have no ${chain}` })
        }

        if (bal < Number(data.networkRewards)) {
          return t({ message: `You don't have enough ${chain}` })
        }
      }
      break
    }

    case Number(data.totalReward) > 0: {
      const rtBal = getTokenBalance(data.rewardTokenId)
      if (rtBal === 0) {
        return t({
          message: `${BALANCE_LOW}: you have no ${rewardToken?.symbol}`,
        })
      }

      if (rtBal < Number(data.totalReward)) {
        const a = t({ message: `${BALANCE_LOW}.` })
        const b = t({
          message: `Your ${rtBal} ${rtSymbol} balance is less than your ${data.totalReward} ${rtSymbol} payout.`,
        })
        return `${a} ${b}`
      }
      break
    }

    default: {
      return ''
    }
  }

  const imbalanceOpts = { ...data, rewardTokenDecimals }
  const { imbalance } = await checkRewardsImbalance(imbalanceOpts)
  return imbalance ? WARN_RWDS_IMBL : ''
}
