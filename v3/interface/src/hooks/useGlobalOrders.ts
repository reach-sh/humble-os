import { ListenerFn } from '@jackcom/raphsducks/lib/types'
import { useEffect, useState } from 'react'
import {
  LimitOrders,
  OrderKey,
  OrdersInstance,
} from 'state/reducers/limit-orders'

export const defaultKeys: OrderKey[] = ['orders']

/** Global hook for subscribing to Limit Orders state */
export default function useGlobalOrders(keys = defaultKeys) {
  const { orders: initial } = LimitOrders.getState()
  const [limitOrders, setLimitOrders] = useState(initial)
  const onOrders: ListenerFn<Partial<OrdersInstance>> = ({ orders }) => {
    if (Array.isArray(orders)) setLimitOrders(orders)
  }

  useEffect(() => LimitOrders.subscribeToKeys(onOrders, keys), [])

  return { limitOrders }
}
