import createState from '@jackcom/raphsducks'

export enum MODAL {
  NONE = '0',
  APP_UPDATE = 'App Version updated',
  CLAIM_FARM = 'Claim Rewards',
  CONFIRM_CLEAR_DATA = 'Disconnect and clear data',
  CONFIRM_LQ_ADD = 'Confirm Add Liquidity',
  CONFIRM_LQ_WITHDRAW = 'Confirm Withdraw Liquidity',
  CONFIRM_MIGRATE = 'Confirm Migrate Liquidity',
  CONFIRM_SWAP = 'Confirm Swap',
  CONFIRM_XGOV = 'Confirm xGov Commitment',
  CONFIRM_WITHDRAW = 'Confirm Withdraw old Liquidity',
  CONNECT_WALLET = 'Connect Wallet',
  DOUBLE_CHECK = 'Double Check',
  FARM_SUCCESS = 'Farm Success',
  HIGH_SLIPPAGE = 'High Slippage',
  MOBILE_CONFIRM = 'Mobile Confirm',
  MOONPAY_MODAL = 'Moon pay Modal',
  NETWORK_PROVIDER = 'Network Provider',
  ORDER_DETAILS = 'Order Details',
  POPUP_BLOCKED = 'Popup Blocked',
  SELECT_PAYMENT_MODAL = 'Select Payment Modal',
  SELECT_TOKEN = ' Select Token',
  STAKE_FARM = 'Stake Farm',
  SUCCESS_CREATE_FARM = 'Create Farm Success',
  SUCCESS_LQ_ADD = 'Add Liquidity Success',
  SUCCESS_LQ_WITHDRAW = 'Remove Liquidity Success',
  UNSTAKE_FARM = 'Unstake Farm',
  WYRE_MODAL = 'Wyre Modal',
}

/** All modals shown in the app should be triggered here */
export const GlobalModal = createState({ active: MODAL.NONE })
export default GlobalModal

/** Modal state keys */
export type ModalInstance = ReturnType<typeof GlobalModal.getState>
export type ModalInstanceKey = keyof ModalInstance

/** Clear global modal (reset to state `NONE`) */
export function clearGlobalModal() {
  const { active } = GlobalModal.getState()
  if (active === MODAL.NONE) return
  GlobalModal.active(MODAL.NONE)
}
