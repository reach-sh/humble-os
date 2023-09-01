import { HUMBLE_LP_TOKEN_SYMBOL } from '@reach-sh/humble-sdk'
import { Farm } from 'types/shared'

type CondensedToken = { id: string; symbol: string; decimals?: number }
type FarmPoolInfo = {
  displayName: string
  stakeToken: CondensedToken
  rewardToken: CondensedToken
  isPoolFarm: boolean
  poolTokens?: [a: CondensedToken, b: CondensedToken]
}
export const condenseFarm = (f: Farm): FarmPoolInfo => {
  const info: any = {
    displayName: f.stakedTokenSymbol,
    isPoolFarm: f.stakedTokenSymbol === HUMBLE_LP_TOKEN_SYMBOL,
    stakeToken: {
      id: f.stakedTokenId,
      symbol: f.stakedTokenSymbol,
      decimals: f.stakedTokenDecimals,
    },
    rewardToken: {
      id: f.rewardTokenId,
      symbol: f.rewardTokenSymbol,
      decimals: f.rewardTokenDecimals,
    },
  }

  if (info.isPoolFarm) {
    info.displayName = `${f.pairTokenASymbol}/${f.pairTokenBSymbol}`
    info.poolTokens = [
      {
        id: f.pairTokenAId || 'A',
        symbol: f.pairTokenASymbol,
      },
      {
        id: f.pairTokenBId || 'B',
        symbol: f.pairTokenBSymbol,
      },
    ]
  }

  return info
}

export default { condenseFarm }
