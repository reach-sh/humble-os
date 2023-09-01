import createState from '@jackcom/raphsducks'
import { HSLimitOrder } from 'types/response'

export type OrdersInstance = ReturnType<typeof LimitOrders.getState>
export type OrderKey = keyof OrdersInstance

/**
 * `LimitOrders` holds a list of limit orders (and related info) created by the
 * user. Every property of the `state` is a setter on the state instance. You
 * can use `LimitOrders.multiple({ ... })` to update multiple properties at once
 * to replace `dispatch` call sequences.
 */
export const LimitOrders = createState({ orders: [] as HSLimitOrder[] })

export default LimitOrders

/** Remove a `LimitOrder` from state */
export function removeLimitOrder(id: string) {
  const { orders } = LimitOrders.getState()
  const next = [...orders].filter(({ contractId }) => contractId !== id)
  LimitOrders.orders(next)
}

/** Update a `LimitOrder` in state */
export function updateLimitOrder(lo: HSLimitOrder) {
  const { orders } = LimitOrders.getState()
  const i = orders.findIndex((o) => o.contractId === lo.contractId)
  const next = [...orders]
  if (i < 0) next.push(lo)
  else next[i] = lo
  LimitOrders.orders(next)
}

/** Update multiple `LimitOrder` in state */
export function updateLimitOrders(orders: HSLimitOrder[]) {
  const { orders: current } = LimitOrders.getState()
  const next: HSLimitOrder[] = []
  if (current.length === 0) next.push(...orders)
  else {
    next.push(...current)
    orders.forEach((newO) => {
      const old = current.findIndex((o) => newO.contractId === o.contractId)
      if (old === -1) next.push(newO) // add new limit-order
      else next[old] = newO // replace old limit-order
    })
  }

  LimitOrders.orders(next)
}
