import { Pool } from 'types/shared'

export const filterDupPoolsByAntiquity = (pools: Pool[]) => {
  const sortedPools = [...pools].sort((p1, p2) =>
    Number(p1.poolTokenId) > Number(p2.poolTokenId) ? 1 : -1,
  )

  const poolPresenceByTokIds: { [index: string]: boolean } = sortedPools.reduce(
    (acc, p) => ({
      ...acc,
      [`${p.tokAId}-${p.tokBId}`]: true,
      [`${p.tokBId}-${p.tokAId}`]: true,
    }),
    {},
  )

  const uniquePools: Pool[] = []

  sortedPools.forEach((p) => {
    const key1 = `${p.tokAId}-${p.tokBId}`
    const key2 = `${p.tokBId}-${p.tokAId}`

    if (poolPresenceByTokIds[key1] || poolPresenceByTokIds[key2]) {
      poolPresenceByTokIds[key1] = false
      poolPresenceByTokIds[key2] = false
      uniquePools.push(p)
    }
  })

  return uniquePools
}

export default filterDupPoolsByAntiquity
