/** @file GraphQL Mutations */

import { HSLimitOrderFragment, HSPoolFragment } from './fragments'

/** Update Limit order status */
export const updateLimitOrderStatus = (args: string) => `
  mutation{
    updateLimitOrderStatus(${args}) {
      ${HSLimitOrderFragment}
    }
  }`

/** Cache a newly-created pool */
export const updateNewPool = (args: string) => `
  mutation{
    updatePool(${args}) {
      ${HSPoolFragment}
    }
  }`
