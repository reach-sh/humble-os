/* eslint-disable no-param-reassign */
import createState from '@jackcom/raphsducks'
import { Store } from '@jackcom/raphsducks/lib/types'

export type DataFlags = {
  farms: boolean
  limitOrders: boolean
  pools: boolean
  tokens: boolean
  fetchRequest: boolean
}

const dataFlags: DataFlags = Object.freeze({
  farms: false,
  limitOrders: false,
  pools: false,
  tokens: false,
  fetchRequest: false,
})

/**
 * `LoadingFlags` holds a list of loading states for various resources.
 * Every property of the `state` is a setter on the state instance. You
 * can use `LimitOrders.multiple({ ... })` to update multiple properties at once
 * to replace `dispatch` call sequences.
 */
export const LoadingFlags = createState(dataFlags)

/**
 * `StreamSubscriptions` tracks whether the UI has triggered a resource subscription
 * Every property of the `state` is a setter on the state instance. You
 * can use `LimitOrders.multiple({ ... })` to update multiple properties at once
 * to replace `dispatch` call sequences.
 */
export const StreamSubscriptions = createState(dataFlags)

/**
 * @internal Shared data getters/setters. This gets attached to `cacheReducer` as a
 * quick helper for reading/writing `LoadingFlags` state
 */
export function generateDataFlags(st: Store<DataFlags>) {
  return {
    // Farms
    get farms() {
      return st.getState().farms
    },
    set farms(loading: boolean) {
      if (st.getState().farms === loading) return
      st.farms(loading)
    },

    // Limit Orders
    get orders() {
      return st.getState().limitOrders
    },
    set orders(loading: boolean) {
      if (st.getState().limitOrders === loading) return
      st.limitOrders(loading)
    },

    // Pools
    get pools() {
      return st.getState().pools
    },
    set pools(loading: boolean) {
      if (st.getState().pools === loading) return
      st.pools(loading)
    },

    // Tokens
    get tokensLoading() {
      return st.getState().tokens
    },
    set tokensLoading(loading: boolean) {
      if (st.getState().tokens === loading) return
      st.tokens(loading)
    },

    // Generic REST request
    get fetchRequest() {
      return st.getState().fetchRequest
    },
    set fetchRequest(loading: boolean) {
      if (st.getState().fetchRequest === loading) return
      st.tokens(loading)
    },
  }
}
