import { arg, intArg, mutationField, nonNull, stringArg } from 'nexus'
import * as LimitOrdersService from '../services/LimitOrders.service'
import { chainIdentifierArgs } from '../utils'

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

export const updateLimitOrderStatus = mutationField('updateLimitOrderStatus', {
  type: 'HSLimitOrder',
  args: { ...getByIdArgs, status: getListArgs.status },
  async resolve(_, { id, status }) {
    return LimitOrdersService.changeOrderStatus(id, status || 'open')
  },
})
