import { arg, intArg, list, nonNull, queryField, stringArg } from 'nexus'
import * as LimitOrdersService from '../services/LimitOrders.service'
import {
  chainIdentifierArgs,
  ChainIdentifiers,
  chainIdentifiers,
} from '../utils'

const getByIdArgs = {
  ...chainIdentifierArgs(),
  id: nonNull(stringArg()),
}
const getListArgs = {
  ...chainIdentifierArgs(),
  limit: intArg(),
  offset: intArg({ default: 0 }),
  creator: stringArg(),
  status: arg({ type: 'HSLimitOrderStatus' }),
}

export const getLimitOrderById = queryField('getLimitOrderById', {
  type: 'HSLimitOrder',
  args: getByIdArgs,
  async resolve(_, args) {
    return LimitOrdersService.getLimitOrderById({
      ...args,
      ...chainIdentifiers(args as Partial<ChainIdentifiers>),
    })
  },
})

export const listLimitOrders = queryField('listLimitOrders', {
  type: list('HSLimitOrder'),
  args: getListArgs,
  async resolve(_, args) {
    return LimitOrdersService.listLimitOrders({
      creator: args.creator || undefined,
      limit: args.limit || undefined,
      offset: args.offset || undefined,
      status: args.status || undefined,
      ...chainIdentifiers(args as Partial<ChainIdentifiers>),
    })
  },
})
