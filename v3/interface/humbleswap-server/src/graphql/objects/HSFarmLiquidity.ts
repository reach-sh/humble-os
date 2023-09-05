import { objectType } from 'nexus'
import { getFarmById } from '../services/Farms.service'

// Pool Liquidity data
export const HSFarmLiquidity = objectType({
  name: 'HSFarmLiquidity',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('farmId')
    t.nonNull.string('remainingRewardA')
    t.nonNull.string('remainingRewardB')
    t.nonNull.string('totalStaked')
    t.nonNull.string('primaryStakeTokenBalance')
    t.field('farm', {
      type: 'HSFarm',
      async resolve({ farmId: id }) {
        return getFarmById({ id })
      },
    })
    t.nonNull.field('lastUpdated', { type: 'HSDateTime' })
  },
})
