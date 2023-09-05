import { createReachAPI, ReachAccount } from '@reach-sh/humble-sdk'

/**
 * @internal
 * Helper for generating analytics params. Exported for tests */
export function getGAParams(address = '', searchParams = '') {
  const params = new URLSearchParams(searchParams)
  return {
    utm_source: params.get('utm_source') || 'none',
    utm_campaign: params.get('utm_campaign') || 'none',
    utm_medium: params.get('utm_medium') || 'none',
    wallet_id: address,
  }
}

/** Send a google analytics eventc */
export function sendGoogleTagEvent(
  event: HSGTagEvent,
  acc: ReachAccount | null = null,
  urlSearchParams = '',
) {
  const walletAddress = acc ? createReachAPI().formatAddress(acc) : ''
  const eventParams = getGAParams(walletAddress, urlSearchParams)
  // @ts-ignore
  window.gtag('event', event, eventParams)
}

export type HSGTagEvent =
  | 'BUYALGO-Launch_Modal'
  | 'CONNECT_WALLET-From_Header'
  | 'CONNECT_WALLET-From_Liquidity'
  | 'CONNECT_WALLET-From_Swap'
  | 'SENDWYRE-Buy_Algo_1-9'
  | 'SENDWYRE-Buy_Algo_10-24'
  | 'SENDWYRE-Buy_Algo_25-49'
  | 'SENDWYRE-Buy_Algo_50_plus'
  | 'MOONPAY-Buy_Algo_1-9'
  | 'MOONPAY-Buy_Algo_10-24'
  | 'MOONPAY-Buy_Algo_25-49'
  | 'MOONPAY-Buy_Algo_50_plus'
  | 'SWAP-Begin_Swap'
  | 'SWAP-Cancel_Swap_Confirm'
  | 'SWAP-Complete_Swap'
  | 'SWAP-Launch_Swap_Confirm'
  | 'SWAP-Token_opt_in'
  | 'LIMIT-ORDER-Begin_Order'
  | 'LIMIT-ORDER-Cancel_LimitOrder_Confirm'
  | 'LIMIT-ORDER-Complete_LimitOrder'
  | 'LIMIT-ORDER-Launch_LimitOrder_Confirm'
  | 'LIQUIDITY-Launch_Add_More'
  | 'LIQUIDITY-Launch_Add_New'
  | 'LIQUIDITY-Launch_Create_Pool'
  | 'LIQUIDITY-Launch_Remove'
  | 'LIQUIDITY-Begin_Create_Pool'
  | 'LIQUIDITY-Complete_Create_Pool'
  | 'LIQUIDITY-ERROR_Create_Pool'
  | 'LIQUIDITY-Begin_Add'
  | 'LIQUIDITY-Cancel_Add-Confirm'
  | 'LIQUIDITY-Complete_Add'
  | 'LIQUIDITY-ERROR_Add_liquidity'
  | 'LIQUIDITY-Launch_Add-Confirm'
  | 'LIQUIDITY-Begin_Remove'
  | 'LIQUIDITY-Cancel_Remove_Confirm'
  | 'LIQUIDITY-Complete_Remove'
  | 'LIQUIDITY-ERROR_Remove_Lq'
  | 'LIQUIDITY-Launch_Remove_Confirm'
  | 'FARMS-Begin_Reward-Claim'
  | 'FARMS-Begin_Stake'
  | 'FARMS-Begin_Remove_Stake'
  | 'FARMS-Cancel_Reward-Claim'
  | 'FARMS-Cancel_Stake'
  | 'FARMS-Cancel_Remove_Stake'
  | 'FARMS-Complete_Reward-Claim'
  | 'FARMS-Complete_Stake'
  | 'FARMS-Complete_Remove_Stake'
  | 'FARMS-ERROR_Reward-Claim'
  | 'FARMS-ERROR_Add_Stake'
  | 'FARMS-ERROR_Remove_Stake'
  | 'FARMS-Launch_Reward-Claim'
  | 'FARMS-Launch_Stake-more'
  | 'FARMS-Launch_Stake-New'
  | 'FARMS-Launch_Stake-Remove'
  | 'FARMS-Reward_Token_opt-in'
  | 'USER_CONNECT'
  | 'USER_RECONNECT'
