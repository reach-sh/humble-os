import { initHumbleSDK } from '@reach-sh/humble-sdk'
import { NETWORK_TOKEN_DEFAULT_ID } from 'constants/reach_constants'
import getDelta from 'helpers/limitOrder'
import { Pool } from 'types/shared'

const pool: Pool = {
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
}

describe('Test getDelta', () => {
  initHumbleSDK()
  const formattedPool = {
    poolAddress: pool.poolAddr.toString(),
    poolTokenId: pool.poolTokenId.toString(),
    tokenAId: pool.tokAId.toString(),
    tokenBId: pool.tokBId.toString(),
    tokenADecimals: 6,
    tokenBDecimals: 6,
    tokenABalance: pool.tokABalance.toString(),
    tokenBBalance: pool.tokBBalance.toString(),
    n2nn: pool.tokAId.toString() === NETWORK_TOKEN_DEFAULT_ID,
  }

  it('returns delta value which is the difference between market rate and limit order rate', () => {
    const delta = getDelta('0.0004', pool.tokAId, pool.tokBId, formattedPool)
    expect(delta).toBeDefined()
    expect(typeof delta).toBe('number')
    expect(delta).toBeCloseTo(-53, -1)
  })

  it('returns close to -100 when limit order rate is almost 0', () => {
    // Expected market rate is 0.0008595161085725862
    const delta = getDelta('0', pool.tokAId, pool.tokBId, formattedPool)
    expect(delta).toBeCloseTo(-100, -1)
  })

  it('returns -50 when the limit order rate is half of the market rate', () => {
    const rate = (pool.tokABalance / pool.tokBBalance / 2).toString()
    const delta = getDelta(rate, pool.tokAId, pool.tokBId, formattedPool)
    expect(delta).toBeCloseTo(-50, -1)
  })

  it('returns 0 when the limit order rate is equal to the market rate', () => {
    const rate = (pool.tokABalance / pool.tokBBalance).toString()
    const delta = getDelta(rate, pool.tokAId, pool.tokBId, formattedPool)
    expect(delta).toBeCloseTo(0, -1)
  })

  it('returns undefined when we pass invalid params', () => {
    const deltaNoPool = getDelta('0', pool.tokAId, pool.tokBId)
    expect(deltaNoPool).toBe(undefined)

    const deltaNoTokA = getDelta('0', undefined, pool.tokBId, formattedPool)
    expect(deltaNoTokA).toBe(undefined)

    const deltaNoTokB = getDelta('0', pool.tokAId, undefined, formattedPool)
    expect(deltaNoTokB).toBe(undefined)
  })
})
