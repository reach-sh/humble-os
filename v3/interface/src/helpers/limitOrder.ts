import { calculateTokenSwap, PoolDetails } from '@reach-sh/humble-sdk'

const getDelta = (
  limitRate: string,
  tokAId?: string | number,
  tokBId?: string | number,
  pool: PoolDetails | null = null,
) => {
  try {
    if (!pool || !tokAId || !tokBId) throw new Error('')
    const calcSwapDefault = calculateTokenSwap({
      swap: {
        tokenAId: String(tokAId),
        tokenBId: String(tokBId),
        amountA: 1,
        amountB: 0,
      },
      pool,
    })
    const marketRate = calcSwapDefault.amountA / calcSwapDefault.amountB
    return ((Number(limitRate) - marketRate) * 100) / marketRate
  } catch (err) {
    return undefined
  }
}
export default getDelta
