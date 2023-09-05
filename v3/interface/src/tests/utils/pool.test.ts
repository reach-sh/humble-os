import { Pool } from 'types/shared'
import { filterDupPoolsByAntiquity } from 'utils/pool'

const pools: Pool[] = [
  {
    lastUpdated: 1658241816418,
    liquidityAmount: 0,
    mintedLiquidityTokens: 2477995,
    poolAddr: '100196052',
    poolTokenId: '100196074',
    tokABalance: 72.084349,
    tokAId: '0',
    tokBBalance: 85282,
    tokBId: '100194580',
    tokenAFees: 0.001,
    tokenBFees: 0.001,
  },
  {
    lastUpdated: 1658241816268,
    liquidityAmount: 7107873,
    mintedLiquidityTokens: 492757659,
    poolAddr: '92391768',
    poolTokenId: '92391789',
    tokABalance: 633.448883,
    tokAId: '0',
    tokBBalance: 384.164206,
    tokBId: '44110986',
    tokenAFees: 0.001,
    tokenBFees: 0.001,
  },
  {
    // Newer dup tokens: This one should be removed
    lastUpdated: 1658241816839,
    liquidityAmount: 0,
    mintedLiquidityTokens: 100000,
    poolAddr: '94264909',
    poolTokenId: '94264946',
    tokABalance: 0.19995,
    tokAId: '0',
    tokBBalance: 0.050076,
    tokBId: '89599937',
    tokenAFees: 0.001,
    tokenBFees: 0.001,
  },
  {
    // Older dup tokens: This one should stay
    lastUpdated: 1658241816520,
    liquidityAmount: 0,
    mintedLiquidityTokens: 10,
    poolAddr: '92392079',
    poolTokenId: '92392097',
    tokABalance: 17.757914,
    tokAId: '0',
    tokBBalance: 0.000001,
    tokBId: '89599937',
    tokenAFees: 0.001,
    tokenBFees: 0.001,
  },
  {
    lastUpdated: 1658241816330,
    liquidityAmount: 0,
    mintedLiquidityTokens: 10001000000000,
    poolAddr: '93299926',
    poolTokenId: '93299960',
    tokABalance: 10002237.10223,
    tokAId: '93142139',
    tokBBalance: 10000260.520683,
    tokBId: '93142022',
    tokenAFees: 0.001,
    tokenBFees: 0.001,
  },
]

describe('Test filterPoolsByUniqueTokIdsAndAntiquity', () => {
  const sortedPools = filterDupPoolsByAntiquity(pools)

  test('Newer duplicate pool removed', () => {
    const poolIdToRemove = '94264909'
    expect(sortedPools.length).toEqual(pools.length - 1)
    expect(sortedPools.map((p) => p.poolTokenId).includes(poolIdToRemove)).toBe(
      false,
    )
  })

  test('Filtered pools in correct order', () => {
    const idsAscOrder = ['92391789', '92392097', '93299960', '100196074']
    const sortedPoolIds = sortedPools.map((p) => p.poolTokenId)

    for (const [idx, id] of idsAscOrder.entries()) {
      expect(id).toEqual(sortedPoolIds[idx])
    }
  })
})
