/* eslint-disable no-param-reassign */
import createState from '@jackcom/raphsducks'
import {
  LOCAL_STORAGE_OPTED_INTO_HIGH_SLIPPAGE,
  LOCAL_STORAGE_SLIPPAGE_KEY,
} from 'constants/local-storage'
import { Pool } from 'types/shared'

export type UserInstance = ReturnType<typeof GlobalUser.getState>
export type UserKeys = keyof UserInstance
export type UserState = {
  walletAddress: string | null
  nfdWalletAddress: string | null
  walletClient: { disconnect(): any } | null
  reachAccount: any | null
  connecting: boolean
  slippageTolerance: number
  liquidityPools: Pool[]
  optedIntoHighSlippage: boolean
}

const slippageTolerance = Number(
  localStorage.getItem(LOCAL_STORAGE_SLIPPAGE_KEY) || 0.5,
)
const optedIntoHighSlippage = Boolean(
  localStorage.getItem(LOCAL_STORAGE_OPTED_INTO_HIGH_SLIPPAGE),
)

/**
 * GlobalUser holds the application user. Every key in the `initialState`
 * becomes a setter on the state instance. So e.g. use `GlobalModal.active( ... )`
 * to update the `modal` property. You can use `GlobalUser.multiple({ ... })` to
 * update multiple state properties at once, before notifying all subscribers. This
 * replaces sequences of `dispatch` calls.
 */
export const GlobalUser = createState<UserState>({
  connecting: false,
  liquidityPools: [],
  nfdWalletAddress: null,
  optedIntoHighSlippage,
  reachAccount: null,
  slippageTolerance,
  walletAddress: null,
  walletClient: null,
})

// Clear user state
export const clearUser = () => GlobalUser.reset()

// Update a liquidity pool in state
export const updateLiquidityPool = (incomingPool: Pool) => {
  const { liquidityPools: old } = GlobalUser.getState()
  const incomingPoolIndex = old.findIndex(
    (pool) => pool.poolAddr.toString() === incomingPool.poolAddr.toString(),
  )
  const updatedPools = [...old]
  if (incomingPoolIndex === -1) {
    updatedPools.push(incomingPool)
  } else updatedPools.splice(incomingPoolIndex, 1, incomingPool)

  GlobalUser.liquidityPools(updatedPools)
}

// Update multiple liquidity pools in state
export const updateLiquidityPools = (lps: Pool[]) => {
  const { liquidityPools: old } = GlobalUser.getState()
  const updatedPools = [...old]
  const ids = old.map(({ poolAddr }) => poolAddr.toString())
  lps.forEach((newP) => {
    const index = ids.findIndex((id) => id === newP.poolAddr.toString())
    if (index === -1) updatedPools.push(newP)
    else updatedPools[index] = newP
  })

  GlobalUser.liquidityPools(updatedPools)
}

// Remove a liquidity pool from state
export const removeLiquidityPool = (poolAddress: string | number) => {
  const id = poolAddress.toString()
  const { liquidityPools: old } = GlobalUser.getState()
  const removePoolIndex = old.findIndex((p) => p.poolAddr.toString() === id)
  if (removePoolIndex === -1) return

  const updatedPools = [...old]
  updatedPools.splice(removePoolIndex, 1)
  GlobalUser.liquidityPools(updatedPools)
}
