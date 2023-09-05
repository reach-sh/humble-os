import { StaticFarmDataFormatted } from '@reach-sh/humble-sdk'
import Dexie from 'dexie'
import { Farm, ListQueryOpts } from 'types/shared'
import { useReach, getCurrentNetwork } from 'helpers/getReach'
import { paginate } from './shared'

export const staticFarmToFarm = (d: StaticFarmDataFormatted) =>
  ({
    contractId: d.ctcInfo,
    startBlock: d.startBlock.toString(),
    endBlock: d.endBlock.toString(),
    rewardTokenId: d.rewardTokenId,
    rewardsPerBlock: d.rewardsPerBlock,
    stakedTokenId: d.stakedTokenId,
    pairTokenAId: d.pairTokenAId,
    pairTokenASymbol: d.pairTokenASymbol,
    pairTokenBId: d.pairTokenBId,
    pairTokenBSymbol: d.pairTokenBSymbol,
    rewardTokenDecimals: d.rewardTokenDecimals,
    rewardTokenSymbol: d.rewardTokenSymbol,
    stakedTokenDecimals: d.stakedTokenDecimals,
    stakedTokenPoolId: d.stakedTokenPoolId,
    stakedTokenSymbol: d.stakedTokenSymbol,
    stakedTokenTotalSupply: d.stakedTokenTotalSupply,
    stakedTokenAmt: '',
    remainingRewardA: '',
    remainingRewardB: '',
    totalStaked: '',
    totalReward: { A: '', B: '' },
    primaryStakeTokenBalance: '0',
    isPartnerFarm: d.isPartnerFarm,
  } as Farm)

export const farmToStaticFarm = (f: Farm) =>
  ({
    ctcInfo: f.contractId,
    startBlock: Number(f.startBlock),
    endBlock: Number(f.endBlock),
    rewardTokenId: f.rewardTokenId.toString(),
    rewardsPerBlock: f.rewardsPerBlock,
    stakedTokenId: f.stakedTokenId.toString(),
    pairTokenAId: f.pairTokenAId.toString(),
    pairTokenASymbol: f.pairTokenASymbol,
    pairTokenBId: f.pairTokenBId.toString(),
    pairTokenBSymbol: f.pairTokenBSymbol,
    rewardTokenDecimals: f.rewardTokenDecimals,
    rewardTokenSymbol: f.rewardTokenSymbol,
    stakedTokenDecimals: f.stakedTokenDecimals,
    stakedTokenPoolId: f.stakedTokenPoolId
      ? f.stakedTokenPoolId.toString()
      : undefined,
    stakedTokenSymbol: f.stakedTokenSymbol,
    stakedTokenTotalSupply: f.stakedTokenTotalSupply.toString(),
  } as StaticFarmDataFormatted)

class FarmsDB extends Dexie {
  public farms: Dexie.Table<Farm, string>

  constructor() {
    super('FarmsDB')
    const farmColumns = [
      'contractId',
      'startBlock',
      'endBlock',
      'rewardTokenId',
      'rewardsPerBlock',
      'stakedTokenId',
      'pairTokenAId',
      'pairTokenASymbol',
      'pairTokenBId',
      'pairTokenBSymbol',
      'rewardTokenDecimals',
      'rewardTokenSymbol',
      'stakedTokenDecimals',
      'stakedTokenPoolId',
      'stakedTokenSymbol',
      'stakedTokenTotalSupply',
    ]

    const farms = farmColumns.toString()
    this.version(1).stores({ farms })
    this.farms = this.table('farms')
  }
}

const db = new FarmsDB()

const farmsDBAPI = {
  getItem: getFarmById,
  putItem: putFarm,
  removeItem: removeFarm,
  listItems,
}

export default farmsDBAPI

async function putFarm(id: string, data: DBUIFarm) {
  const farm = {
    ...data,
    connector: getCurrentNetwork(),
    contractId: id || data.contractId,
  }
  await db.farms.put(farm, farm.contractId.toString())
  return farm.contractId.toString()
}

async function removeFarm(id: string) {
  await db.farms.delete(`${id}`)
  return id
}

export async function clearFarmTable() {
  await db.farms.clear()
}

export async function listItems(opts: ListQueryOpts) {
  const items = await db.farms.toArray()
  return paginate(items, opts)
}

type DBFarmBase = {
  connector: string
}

export type DBUIFarm = Farm & DBFarmBase

/** Get a single pool by its contract address */
export async function getFarmById(id: string) {
  // cast IDs to string for maximum cross-chain compatibility
  const farm = await db.farms.where({ contractId: id }).first()
  if (!farm) return null

  return makeUIFarm(farm)
}

/** Create a UI-compatible object to return */
function makeUIFarm(data: Farm) {
  const { connector } = useReach()
  return {
    connector,
    contractId: data.contractId,
    startBlock: data.startBlock,
    endBlock: data.endBlock,
    rewardTokenId: data.rewardTokenId,
    rewardsPerBlock: data.rewardsPerBlock,
    stakedTokenId: data.stakedTokenId,
    pairTokenAId: data.pairTokenAId,
    pairTokenASymbol: data.pairTokenASymbol,
    pairTokenBId: data.pairTokenBId,
    pairTokenBSymbol: data.pairTokenBSymbol,
    rewardTokenDecimals: data.rewardTokenDecimals,
    rewardTokenSymbol: data.rewardTokenSymbol,
    stakedTokenDecimals: data.stakedTokenDecimals,
    stakedTokenPoolId: data.stakedTokenPoolId,
    stakedTokenSymbol: data.stakedTokenSymbol,
    stakedTokenTotalSupply: data.stakedTokenTotalSupply,
  } as DBUIFarm
}
