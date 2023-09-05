import { trimByteString } from '@reach-sh/humble-sdk'
import axios from 'axios'
import { intArg, list, nonNull, queryField, stringArg } from 'nexus'
import * as Farms from '../services/Farms.service'
import { chainIdentifierArgs, chainIdentifiers, GetByIdOpts } from '../utils'

const getByIdArgs = {
  id: nonNull(stringArg()),
  ...chainIdentifierArgs(),
}

const getByIdsArgs = {
  ids: list(nonNull(stringArg())),
  ...chainIdentifierArgs(),
}

const getListArgs = {
  offset: intArg(),
  ...chainIdentifierArgs(),
}

/** Fetch a single Pool */
export const getFarm = queryField('getFarm', {
  type: 'HSFarm',
  args: getByIdArgs,
  async resolve(_, args) {
    const opts = { ...args, withLiquidity: true } as Farms.FarmByIdOpts
    return Farms.getFarmById(opts)
  },
})

/** Fetch a single Pool */
export const getFarmLiquidity = queryField('getFarmLiquidity', {
  type: 'HSFarmLiquidity',
  args: getByIdArgs,
  async resolve(_, args) {
    return Farms.getFarmLiquidity(args as GetByIdOpts)
  },
})

/** Fetch a single Farm's historical liquidity */
export const getHistoricalFarmLq = queryField('getHistoricalFarmLiquidity', {
  type: list('HSFarmLiquidity'),
  args: {
    ...getByIdArgs,
    startFromDate: stringArg(),
  },
  async resolve(_, args) {
    const { chain, provider } = chainIdentifiers()
    return Farms.historicalFarmLiquidity({
      chain: args.chain || chain,
      provider: args.provider || provider,
      farmId: args.id,
      startFromDate: args.startFromDate || undefined,
    })
  },
})

/** Search for Farms that stake one or more specified tokens */
export const searchFarmByStakeToken = queryField('searchFarmByStakeToken', {
  type: list('HSFarm'),
  args: getByIdsArgs,
  async resolve(_, args) {
    const { chain, provider } = chainIdentifiers()
    return Farms.searchFarmByStakeToken({
      chain: args.chain || chain,
      provider: args.provider || provider,
      stakedTokenIds: args.ids || [],
    })
  },
})

/** Get user's staked amount in round at time */
export const getUserFarmStake = queryField('getUserFarmStake', {
  type: 'String',
  args: {
    assetId: nonNull('String'),
    address: nonNull('String'),
    block: 'String',
    ...chainIdentifierArgs(),
  },
  async resolve(_, args, { Farms: FarmsDB }) {
    const { assetId, address, block } = args
    const farms = await FarmsDB.findMany({
      where: {
        stakedTokenId: assetId,
        endDate: { gte: new Date() },
      },
      select: { id: true },
    })
    if (!farms.length) return '0'

    const baseURL = `https://mainnet-idx.algonode.cloud/x2/applications`
    let url = `${baseURL}/${farms[0].id}/localstate`
    const params: any = { address, path: '0,AA==,bs' }
    if (block) params.block = block

    return axios
      .get(url, { params })
      .then((res) => res.data)
      .then((result) => {
        if (!result?.accounts?.length) return '0'

        const [user]: [{ ls: string; bs: string }] = result.accounts
        let hexBalance = Buffer.from(user.ls, 'base64')
        hexBalance = trimByteString(hexBalance.slice(17).toString('hex'))

        return BigInt(`0x${hexBalance}`).toString()
      })
  },
})

/** Fetch a list of Farms */
export const listFarms = queryField('listFarms', {
  type: list('HSFarm'),
  args: getListArgs,
  async resolve(_, args) {
    const { offset } = args
    const opts = { ...args, offset: Math.max(offset || 0, 0) }
    return Farms.getFarmsList(opts as Farms.ListFarmOpts)
  },
})

/** Fetch a list of active Farms */
export const listActiveFarms = queryField('listActiveFarms', {
  type: list('HSFarm'),
  args: getListArgs,
  async resolve(_, args) {
    const { offset } = args
    const opts = { ...args, offset: Math.max(offset || 0, 0) }
    return Farms.getActiveFarmsList(opts as Farms.ListFarmOpts)
  },
})

/** Fetch a list of upcoming Farms */
export const listUpcomingFarms = queryField('listUpcomingFarms', {
  type: list('HSFarm'),
  args: getListArgs,
  async resolve(_, args) {
    const { offset } = args
    const opts = { ...args, offset: Math.max(offset || 0, 0) }
    return Farms.getUpcomingFarmsList(opts as Farms.ListFarmOpts)
  },
})

/** Fetch a list of active Farms */
export const listEndedFarms = queryField('listEndedFarms', {
  type: list('HSFarm'),
  args: getListArgs,
  async resolve(_, args) {
    const { offset } = args
    const opts = { ...args, offset: Math.max(offset || 0, 0) }
    return Farms.getEndedFarmsList(opts as Farms.ListFarmOpts)
  },
})
