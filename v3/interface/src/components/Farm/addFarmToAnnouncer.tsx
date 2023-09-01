import {
  createReachAPI,
  ReachAccount,
  announceFarm,
  fetchStakingPool,
  BigNumber,
  Maybe,
  parseAddress,
  isNetworkToken,
} from '@reach-sh/humble-sdk'
import { MAX_UINT } from 'constants/reach_constants'
import { getTokenById } from 'helpers/pool'
import { getCurrentNetwork } from 'helpers/getReach'
import { utils } from 'ethers'
import { asMaybe } from 'utils/reach'
import { GlobalDex } from 'state/reducers/dex'

export async function addFarmToAnnouncer(
  acc: ReachAccount,
  contractInfo: string | undefined,
  stakedTokenId: string,
  rewardTokenId: string,
) {
  if (contractInfo === undefined) return false
  const { pools } = GlobalDex.getState()
  const stakedToken = getTokenById(stakedTokenId)
  const rewardToken = getTokenById(rewardTokenId)
  if (
    stakedToken === undefined ||
    rewardToken === undefined ||
    stakedToken.supply === undefined
  )
    return false
  const stakedTokenPool = pools.find(
    (pool) => pool.poolTokenId.toString() === stakedToken?.id.toString(),
  )
  const tokenFromPool = (id?: string) => (id ? getTokenById(id) : undefined)
  const poolTokenA = (id: any): Maybe<BigNumber> =>
    isNetworkToken(id) ? asMaybe(null) : asMaybe(parseAddress(id || 0))

  const pairTokenA = tokenFromPool(stakedTokenPool?.tokAId)
  const pairTokenAId = poolTokenA(pairTokenA?.id)
  const pairTokenB = tokenFromPool(stakedTokenPool?.tokBId)
  const opts = { poolAddress: contractInfo, formatResult: false }
  const { succeeded, data: info } = await fetchStakingPool(acc, opts)
  if (succeeded === false) return false
  const reach = createReachAPI()
  let stakedTokenTotalSupply = utils.parseUnits(
    stakedToken.supply.replace('.', ''),
    0,
  )
  const maxSupply = reach.bigNumberify(MAX_UINT[getCurrentNetwork()])
  if (stakedTokenTotalSupply.gt(maxSupply)) stakedTokenTotalSupply = maxSupply

  const result = await announceFarm(acc, {
    staticFarmData: {
      ctcInfo: parseAddress(contractInfo),
      startBlock: info.opts.start,
      endBlock: info.opts.end,
      rewardTokenId: parseAddress(info.opts.rewardToken1),
      stakedTokenId: parseAddress(info.opts.stakeToken),
      pairTokenAId,
      pairTokenASymbol: pairTokenA?.symbol || '',
      pairTokenBId: parseAddress(pairTokenB?.id || 0),
      pairTokenBSymbol: pairTokenB?.symbol || '',
      rewardTokenDecimals: rewardToken.decimals,
      rewardTokenSymbol: rewardToken.symbol,
      stakedTokenDecimals: stakedToken.decimals,
      stakedTokenPoolId: parseAddress(stakedTokenPool?.poolAddr || 0),
      stakedTokenSymbol: stakedToken.symbol,
      stakedTokenTotalSupply,
    },
  })
  return result.succeeded
}

export default addFarmToAnnouncer
