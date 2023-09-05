/* eslint-disable no-param-reassign */
import createState from '@jackcom/raphsducks'
import {
  Farm,
  LimitOrderAction,
  LimitOrderInfo,
  Pool,
  Prices,
  Token,
} from 'types/shared'

type DexState = {
  pools: Pool[]
  tokenList: Token[]
  selectedStakeContractId: string | number | undefined
  selectedLimitOrderInfo: LimitOrderInfo | undefined
  selectedLimitOrderAction: LimitOrderAction | undefined
  selectedFarmAmounts: { a?: string; b?: string }
  tokenAId: string
  tokenBId: string
  reopenOrder: boolean
  creatingPool: boolean
  addingLiquidity: boolean
  withdrawingLiquidity: boolean
  tokenBalancesLoading: boolean
  // poolViews: Record<string, any>
  stakingPools: Farm[]
  // TODO: create a reducer specifically for flags
  ltBalancesLoading: boolean
  prices: Prices
}

/**
 * `GlobalDex` holds a list of Dex data (and related info) created by the user
 * (e.g. selected tokens and amounts; selected pools). Every property of the
 * `state` is a setter on the state instance. You can use `LimitOrders.multiple({ ... })`
 * to update multiple properties at once to to replace `dispatch` call sequences.
 */
export const GlobalDex = createState<DexState>({
  pools: [],
  tokenList: [],
  selectedStakeContractId: undefined,
  selectedFarmAmounts: { a: undefined, b: undefined },
  selectedLimitOrderInfo: undefined,
  selectedLimitOrderAction: undefined,
  tokenAId: '',
  tokenBId: '',
  reopenOrder: false,
  creatingPool: false,
  addingLiquidity: false,
  withdrawingLiquidity: false,
  tokenBalancesLoading: true,
  stakingPools: [],
  ltBalancesLoading: true,
  prices: { lastRate: 0, lastUpdate: 0, displayUnit: 'ALGO' },
})

export type DexInstance = ReturnType<typeof GlobalDex.getState>
export type DexKeys = keyof DexInstance

/** Remove a single `Pool` item from state */
export const removePool = (id: string) => {
  if (['', undefined].includes(id)) return

  const { pools: old } = GlobalDex.getState()
  const idx = old.findIndex((p) => p.poolAddr.toString() === id.toString())
  if (idx === -1) return

  const updatePools = [...old]
  updatePools.slice(idx, 1)
  GlobalDex.pools(updatePools)
}

export const removeStakingPool = (id: string) => {
  const { stakingPools: old } = GlobalDex.getState()
  const removeFarmIndex = old.findIndex(
    (farm: Farm) => farm.contractId.toString() === id.toString(),
  )

  if (removeFarmIndex > -1 && id) {
    const updatedFarms = [...old]
    updatedFarms.splice(removeFarmIndex, 1)
    GlobalDex.stakingPools(updatedFarms)
  }
}

/** Update a single `Pool` item from state */
export const updatePool = (incomingPool: Pool) => {
  const { pools: old } = GlobalDex.getState()
  const updatedPools = [...old]
  const newIndex = updatedPools.findIndex(
    (p) => p.poolAddr.toString() === incomingPool.poolAddr.toString(),
  )
  if (newIndex > -1) updatedPools[newIndex] = incomingPool
  else updatedPools.push(incomingPool)

  GlobalDex.pools(updatedPools)
}

/** Update a list of `Pool` items in state */
export const updatePools = (newPools: Pool[]) => {
  const { pools: old } = GlobalDex.getState()
  let updates = [...newPools]
  if (old.length) {
    const ids = old.map(({ poolAddr }) => poolAddr.toString())
    const updatedPools = [...old]
    const toId = (s: string | number) => s.toString()

    newPools.forEach((p) => {
      const index = ids.indexOf(toId(p.poolAddr))
      if (index === -1) updatedPools.push(p)
      else updatedPools[index] = p
    })
    updates = updatedPools
  }

  GlobalDex.pools(updates)
}

/** Update a single `Farm` item in state */
export const updateStakingPool = (stakingPool: Farm) => {
  if (!stakingPool) return
  const { stakingPools: old } = GlobalDex.getState()
  const farmId = stakingPool.contractId?.toString()
  const idx = old.findIndex(({ contractId: c }) => c?.toString() === farmId)
  const updatedStakingPools = [...old]
  if (idx > -1) {
    updatedStakingPools[idx] = stakingPool
  } else updatedStakingPools.push(stakingPool)

  GlobalDex.stakingPools(updatedStakingPools)
}

/** Update a single `Token` item in state */
export const updateToken = (updatedToken: Token) => {
  if (!updatedToken) return

  const { tokenList: old } = GlobalDex.getState()
  const updates = [...old]
  const uid = updatedToken.id.toString()
  const indexOfToken = updates.findIndex(({ id }) => uid === id?.toString())
  if (indexOfToken > -1) updates[indexOfToken] = updatedToken
  else updates.push(updatedToken)

  GlobalDex.tokenList(updates)
}

/** Remove a `Token` from a list */
export const removeToken = (target: string) => {
  const { tokenList: old } = GlobalDex.getState()
  const updatedList = [...old].filter(({ id }) => id.toString() !== target)

  GlobalDex.tokenList(updatedList)
}

/** Update a list of `Token` items in state */
export const updateTokens = (updatedTokens: Token[]) => {
  const { tokenList } = GlobalDex.getState()
  const nextList = [...tokenList]
  updatedTokens.forEach((updatedToken) => {
    const idx = nextList.findIndex(
      ({ id }) => updatedToken?.id?.toString() === id?.toString(),
    )

    if (idx > -1) nextList[idx] = updatedToken
    else nextList.push(updatedToken)
  })

  GlobalDex.tokenList(nextList)
}
