import { t } from '@lingui/macro'

export const ERRORS = {
  ANNOUNCE_FARM: t`Failed to publish Farm to HumbleSwap.`,
  ANNOUNCE_POOL: t`Failed to publish Pool to HumbleSwap.`,
  CRYPTO_CHECKOUT_CONNECT: t`Could not connect to %%. Please recheck your transaction details and try again`,
  UNKNOWN: t`Something went wrong, please try again`,
}

export const ASSURANCE = {
  FUNDS_SAFE: t`Your funds were not moved.`,
  SECURE_TXNS: t`All transactions are secure and encrypted.`,
}
export const BUY_TOKENS = {
  BY_PROVIDER: t`Buy %% via %PRV%`,
  DEFAULT: t`Buy %%`,
  AMOUNT: t`%% you want to get (min. %MIN%):`,
}
export const EVENTS = {
  DEPOSITING_FUNDS: t`Depositing funds`,
  LIQUIDITY_LOADING: t`Loading your liquidity`,
  UPDATING_TOKEN_BALANCES: t`Updating token balances`,
}
export const LABELS = {
  RECEIVED: t`You received`,
  RECEIVED_MIN: t`You received at least`,
  CANCEL: t`Cancel`,
  CANCEL_ORDER: t`Cancel Order`,
  CONNECT: t`Connect wallet`,
  COPY: t`Copy Order`,
  CREATE: {
    POOL: t`Create Pool`,
    FARM: t`Create Farm`,
    PARTNER_FARM: t`Create Partner Farm`,
  },
  FARM: t`Farm`,
  FILL_ORDER: t`Fill Order`,
  HUMBLE_PARTNER: t`HumbleSwap Partner`,
  LIMIT_ORDER: t`Limit Order`,
  POOL: t`Pool`,
  POOLS: t`Liquidity Pools`,
  REOPEN: t`Re-open`,
  SWAP: t`Swap`,
}
export const LIQUIDITY = {
  EMPTY: t`You have not added any liquidity`,
  MOVE: t`Withrdaw/transfer liquidity`,
  MOVE_DESC: t`Withdraw your HumbleSwap V2 liquidity, and optionally move it into a V3 pool.`,
  MIGRATE: t`Transfer V2 liquidity`,
  MIGRATE_PROGRESS: t`Migrating V2 liquidity`,
  WITHDRAW_OLD: t`Withdraw V2 liquidity`,
  WITHDRAW_OLD_PROGRESS: t`Withdrawing V2 liquidity`,
}
export const LIMIT_ORDER = {
  RATE_HIGH: t`Limit rate is %DIFF% higher than the market rate for %TOKN%!`,
  RATE_LOW: t`Limit rate is %DIFF% below market rate.`,
  FILLED: t`Limit Order filled!`,
}
export const PROMPTS = {
  BUY_CRYPTO_POPUP: t`Connecting: complete any actions in the %% checkout popup.`,
  SET_REWARD_PAYOUT: t`Please set the %% reward payout`,
  SET_ALT_REWARD_PAYER: t`Change %% reward funder`,
}
export const WARNINGS = {
  BALANCE_LOW: t`Insufficient balance`,
  BALANCE_REQUIRED: t`you need at least %AMT% %%.`,
  POPUP_BLOCKED: t`Your browser is blocking popups; please disable this blocker before retrying.`,
}
export const TRANSACTION = {
  CANCELLED: t`The transaction was cancelled.`,
  COMPLETE: t`Transaction complete!`,
  SKIP_CONFIRMATION: t`⚠️ Skip transaction previews`,
  SLIPPAGE_PROTECTION: t`Transaction prevented due to slippage.`,
  TOKEN_OPTIN: t`Opting in to %%`,
}
