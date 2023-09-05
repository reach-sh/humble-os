import { HUMBLE_LP_TOKEN_SYMBOL } from '@reach-sh/humble-sdk'
import { Farm } from 'types/shared'
import { condenseFarm } from 'utils/farm'

const farm: Farm = {
  contractId: '23423423',
  pairTokenAId: '76656656',
  pairTokenASymbol: 'TOKA',
  pairTokenBId: '56567876',
  pairTokenBSymbol: 'TOKB',
  stakedTokenPoolId: '124523354',
  stakedTokenAmt: '34',
  stakedTokenId: '345476745',
  stakedTokenSymbol: 'ADVKFR',
  rewardTokenId: '090934554',
  rewardTokenSymbol: 'REWARD',
  startBlock: '234343',
  endBlock: '546545',
  remainingRewardA: '5',
  remainingRewardB: '7',
  totalStaked: '10',
  totalReward: { A: '100', B: '100' },
  stakedTokenDecimals: 6,
  rewardTokenDecimals: 6,
  stakedTokenTotalSupply: '100',
  primaryStakeTokenBalance: '50',
  rewardsPerBlock: { asDefaultNetworkToken: '0.2', asRewardToken: '0.2' },
}

describe('Test condenseFarm', () => {
  test('with non-pool farm', () => {
    const condensedFarm = condenseFarm(farm)
    const stkTok = condensedFarm.stakeToken

    expect(condensedFarm.displayName).toEqual('ADVKFR')
    expect(condensedFarm.isPoolFarm).toEqual(false)
    expect(condensedFarm.poolTokens).toEqual(undefined)

    expect(stkTok.id).toEqual('345476745')
    expect(stkTok.symbol).toEqual('ADVKFR')
    expect(stkTok.decimals).toEqual(6)
  })

  test('with pool farm', () => {
    const condensedFarm = condenseFarm({
      ...farm,
      stakedTokenSymbol: HUMBLE_LP_TOKEN_SYMBOL,
    })
    const pairTokA = condensedFarm.poolTokens
      ? condensedFarm.poolTokens[0]
      : undefined
    const pairTokB = condensedFarm.poolTokens
      ? condensedFarm.poolTokens[1]
      : undefined

    expect(condensedFarm.isPoolFarm).toEqual(true)
    expect(pairTokA?.id).toEqual('76656656')
    expect(pairTokA?.symbol).toEqual('TOKA')
    expect(pairTokB?.id).toEqual('56567876')
    expect(pairTokB?.symbol).toEqual('TOKB')
  })
})
