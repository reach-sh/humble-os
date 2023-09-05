import { objectType } from 'nexus'

export const HSLimitOrder = objectType({
  name: 'HSLimitOrder',
  description: 'A decentralized limit order',
  definition(t) {
    t.nonNull.string('contractId', { description: 'Order application ID' })
    t.nonNull.string('creator', { description: 'Contract creator' })
    t.nonNull.string('amtA', { description: 'Amount to be sold by creator' })
    t.nonNull.string('amtB', { description: 'Amount to be bought by creator' })
    t.nonNull.string('tokenA', { description: 'Token offered by creator' })
    t.nonNull.string('tokenB', { description: 'Token requested by creator' })
    t.nonNull.int('tokenADecimals', { description: 'Sell-token decimals' })
    t.nonNull.int('tokenBDecimals', { description: 'Buy-token decimals' })
    t.nonNull.string('announcerId', { description: 'Announcer contract' })
    t.field('status', {
      type: 'HSLimitOrderStatus',
      description: 'Limit Order status',
    })
  },
})
