import { objectType } from 'nexus'

export const HSToken = objectType({
  name: 'HSToken',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
    t.nonNull.int('decimals')
    t.nonNull.string('symbol')
    t.nonNull.string('supply')
    t.string('url')
    t.boolean('verified')
    t.field('verificationTier', { type: 'HSVerificationTier' })
  },
})
