/** @file GraphQL Queries */

import {
  HSFarmFragment,
  HSLimitOrderFragment,
  HSPoolFragment,
  HSTokenFragment,
} from './fragments'

/** List Pools graphql query */
export const listPoolsQuery = (args: string) =>
  `query {
    listPools(${args}) {
      ${HSPoolFragment}
    } 
  }`

/** List Farms graphql query */
export const listFarmsQuery = (args: string) =>
  `query {
    listFarms(${args}) {
      ${HSFarmFragment}
    } 
  }`

/** Get individual farm graphql query */
export const getFarm = (args: string) => `
  query {
    getFarm(${args}) {
      contractId
      endDate
      startDate
    }
  }
`

/** List Pool Historical Liquidity graphql query */
export const listPoolHistoryQuery = (args: string) =>
  `query {
    getHistoricalPoolLiquidity(${args}) {
      id
      poolId
      tokenABalance
      tokenBBalance
      lastUpdated
      apr7d
    } 
  }`

/** List Tokens graphql query */
export const listTokensQuery = (args: string) =>
  `query {
    listTokens(${args}){
      ${HSTokenFragment}
    }
  }`

export const signMoonpayUrl = (args: string) =>
  `query {
    signMoonpayUrl(${args})
  }`

/** List Limit orders graphql query */
export const listLimitOrders = (args: string) =>
  `query {
    listLimitOrders(${args}) {
      ${HSLimitOrderFragment}
    }
  }`
