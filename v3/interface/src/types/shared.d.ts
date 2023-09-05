// eslint-disable-next-line camelcase
import { Stdlib_User as StdLibUser } from '@reach-sh/stdlib/dist/types/interfaces'
import { DBUIToken } from 'cache/tokens'
import { DefaultTheme } from 'styled-components'
import { ReachAccount as reachAccount } from '@reach-sh/humble-sdk'
import { RouteObject } from 'react-router'

/** Account list item from AlgoSigner response */
export type AnyObject = { [x: string]: any }

export type ListQueryOpts = {
  cacheKey: string
  page?: number
  resultsPerPage?: number
  orderBy?: string
  where?: Record<string, any>
}

export type PaginatedDBResults<T> = {
  totalResults?: number
  totalPages?: number
  resultsPerPage?: number
  data: T[]
  page?: number
}

export type ADIDBInterface<T> = Record<string, (...a: any[]) => any> & {
  listItems(opts: ListQueryOpts): Promise<PaginatedDBResults<T>>
  getItem(id: any): Promise<T | null>
  putItem(id: any, val: any): Promise<any | null>
  removeItem(id: any): Promise<any>
}

/** Web route definition */
export type AppRouteDef = Pick<RouteObject, 'path' | 'element'> & {
  protected?: boolean
  path: string
  text: string
  component: (() => JSX.Element) | React.ComponentType
  render?:
    | ((d: unknown) => JSX.Element | React.ComponentType)
    | undefined
    | null
}

export type Token = DBUIToken & {
  address?: string
  balance?: number | string
  chainId?: number
  id?: any
  name: string
  supply?: string
  symbol: string
  unsupported?: boolean
  minBalance?: number
}

export type Pool = {
  liquidityAmount: number
  poolAddr: string
  poolTokenId: string
  isProvider?: boolean
  unsupported?: boolean
  lastUpdated?: number | undefined
  mintedLiquidityTokens: number
  apr?: number
  volume?: number
} & PoolCore

export type PoolCore = {
  tokAId: string
  tokBId: string
  tokABalance: number
  tokBBalance: number
  tokenAFees: number
  tokenBFees: number
}

export type ToastProps = {
  message: string
  info?: SwapInfo
  error?: any
  acct?: string
  className?: string
}

export type AssetSymbolProps = {
  symbol?: string
  selected?: boolean
  onClick?: () => void
  verifyStatus?: 'trusted' | 'verified' | 'suspicious' | 'unverified'
}

type StyledProps = {
  className: string
}

export type SwapInfo = {
  tokA?: Token
  amtA?: any
  tokB?: Token
  amtB?: any
  tokenIn?: string | number
}

export type LimitOrderCore = {
  delta?: string
  limitOrderRate?: string
  tokA?: Token
  amtA?: any
  tokB?: Token
  amtB?: any
  status?: LimitOrderStatus
}

export type LimitOrderInfo = LimitOrderCore & {
  contractId?: string
  creator?: string
}

export type LimitOrderStatus = 'open' | 'closed'
export type LimitOrderAction = 're-open' | 'copy' | 'fill' | 'close'

export type SwapStat = {
  name?: string
  tooltip?: string
  tooltipLink?: string
  link?: string
  value?: string
  symbol?: string
  warning?: boolean
  tvl?: string
}

/** `NetworkData` describes single network data-item (for e.g. Ethereum) */
export type NetworkData = {
  name: string
  abbr: string
  signStrategy?: string
}

/** UI-friendly representation of a Network data-item */
export type NetworkListItem = NetworkData & { active: boolean }

export type BackendModule = Record<string, any>

/** A reach-connected Network Account representation */
export type ReachAccount = reachAccount

export type Maybe<T> = ['Some', T] | ['None', null]

/** Reach contract View representation */
type CtcViewGroup<T extends BackendModule> = ReturnType<T['_getViews']>['infos']
export type ContractView<T extends BackendModule> = {
  [k in keyof CtcViewGroup<T>]: (
    ...a: any[]
  ) => Promise<
    Maybe<Unwrap<ReturnType<ReturnType<T['_getViews']>['infos'][k]['decode']>>>
  >
}

export type APIFn<T> = {
  [fn in keyof T]: UnwrapAPI<T[fn]>
}

/** Reach Contract Method (function) grouping */
export type CtcFnGroup<T> = {
  [k in keyof T]: CtcFn
}

/** Reach Contract Method (function) grouping */
export type CtcFnSupergroup<T> = {
  [k in keyof T]: CtcFnGroup<T[k]>
}

export type InteractFn<T extends BackendModule> = {
  [fn in keyof T]: (interact: any, ctcInfo?: string | number) => any
}

type Unwrap<T> = T extends Promise<infer A> ? A : T
type UnwrapAPI<T> = T extends (...a: any[]) => Promise<undefined>
  ? (...a: any[]) => Promise<any>
  : CtcFnGroup<T>

/** Reach contract representation */
export type ReachContract<T extends BackendModule> = {
  /** Get contract address */
  getInfo(): Promise<any>
  /** Get deployed contract address */
  getContractAddress(): Promise<string | number>
  /** Reach Contract `API` member */
  a: APIFn<T['_APIs']>
  /** Reach Contract `API` member */
  apis: APIFn<T['_APIs']>
  /** Reach Contract `Participant` member */
  p: InteractFn<T['_Participants']>
  /** Reach Contract `Participant` member */
  participants: InteractFn<T['_Participants']>
  /** Reach Contract `View` member */
  v: ContractView<T>
  /** Reach Contract `View` member */
  views: ContractView<T>
  /** Reach Contract `Events` member */
  e: ReachEventStream<ReturnType<T['_getEvents']>>
  /** Reach Contract `Events` member */
  events: ReachEventStream<ReturnType<T['_getEvents']>>
  /** @deprecated Get contract `Views`. Use `ctc.views` or `ctc.v` */
  getViews(): CtcLabeledFunc<any>
}

/** `ReachEvent` is an `Event` emitted from a contract `EventStream` */
export type ReachEvent<T extends any> = { when: any; what: T }

/** `ReachEvent` is an `Event` emitted from a contract `EventStream` */
export type ReachEventStream<T> = {
  [k in keyof T]: {
    next(): Promise<ReachEvent<any>>
    seek(t: BigNumber): void
    seekNow(): Promise<void>
    lastTime(): Promise<BigNumber>
    monitor(handler: (e: ReachEvent<any>) => void): Promise<void>
  }
}

type AssetID = string | number

export type NetworkProvider = 'TestNet' | 'MainNet' | 'ALGO-devnet'

/** Reach StdLib instance */
export type ReachStdLib = StdLibUser<{ [x: string]: any }> & {
  [x: string]: any
  /* Properties */
  atomicUnit: string
  connector: string
  hasConsoleLogger: { log: (...a: any) => void }
  hasRandom: { random: () => BigNumber }
  minimumBalance: BigNumber
  standardUnit: string

  /* Methods */
  addressEq(addr: string | ReachAccount, addr: string | ReachAccount): boolean
  // Arithmetic
  /** Add two values (number, big number, or combo) */
  add(uInt: number | BigNumber, uInt: number | BigNumber): BigNumber
  /** Subtract two values (number, big number, or combo) */
  sub(uInt: number | BigNumber, uInt: number | BigNumber): BigNumber
  /** Modulo of two values (number, big number, or combo) */
  mod(uInt: number | BigNumber, uInt: number | BigNumber): BigNumber
  /** Multiply two values (number, big number, or combo) */
  mul(uInt: number | BigNumber, uInt: number | BigNumber): BigNumber
  /** Divide two values (number, big number, or combo) */
  div(uInt: number | BigNumber, uInt: number | BigNumber): BigNumber
  /** Others */
  balanceOf(acc: ReachAccount, token?: AssetID): Promise<BigNumber>
  bigNumberToHex(uInt: BigNumber): string
  bigNumberify(uInt: number | BigNumber): BigNumber
  bigNumberToNumber(num: any): number
  bytesEq(bytes: string, bytes: string): boolean
  canFundFromFaucet(): Promise<boolean>
  connectAccount(acc: AnyObject & { addr: string }): Promise<ReachAccount>
  createAccount(): Promise<ReachAccount>
  digestEq(Digest: string, Digest: string): boolean
  formatAddress(addr: string): string
  formatCurrency(amt: any, decimals?: number): string
  formatWithDecimals(amt: unknown, decimals: number): string
  fundFromFaucet(account: ReachAccount, balance: AnyObject): Promise<void>
  getDefaultAccount(): Promise<ReachAccount>
  getFaucet(): Promise<ReachAccount>
  getNetworkSecs(): void
  getNetworkTime(): void
  hexToBigNumber(bytes: string): BigNumber
  launchToken: (acc: ReachAccount, name: string, sym: string, opts?: any) => any
  isHex(x: any): bool
  newAccountFromMnemonic(phrase: string): Promise<ReachAccount>
  newAccountFromSecret(secret: string): Promise<ReachAccount>
  newTestAccount(balance: BigNumber): Promise<ReachAccount>
  newTestAccounts(howMany: number, balance: AnyObject): Promise<ReachAccount[]>
  parseCurrency(amt: string | any, decimals?: number): BigNumber
  providerEnvByName(prv: NetworkProvider): AnyObject
  setProviderByName(prv: string): void
  stringToHex(s: string): string
  transfer<A extends ReachAccount>(
    from: A,
    to: A,
    val?: BigNumber,
    token?: number | string,
  ): Promise<unknown>
  uintToBytes(uInt: BigNumber): string
  unsafeGetMnemonic: (acc: ReachAccount) => string
  verifyContract: (ctcInfo: any, backend: BackendModule) => Promise<any>
  wait(delta: BigNumber): Promise<BigNumber>
  waitUntilSecs(secs: BigNumber): Promise<BigNumber>
  waitUntilTime(time: BigNumber): Promise<BigNumber>
} & AnyObject

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      main: string
      error: string
      accent: string
      body: string
      text: string
      svg: string
      card: string
      cardText: string
      background: string
      lighterBackground: string
      hover: string
      slideColor: string
      slideBackground: string
      shadow: string
      border: string
      border2: string
      textHover: string
      button: string
      buttonText: string
      altButton: string
      altButtonText: string
      altButtonActive: string
      altButtonActiveText: string
      altButtonBorder: string
      darkButtonBg: string
      darkButtonText: string
      buttonHover: string
      disabledButton: string
      ring1: string
      ring2: string
      pageTab: string
      pageTabHover: string
      pageTabSelected: string
      cardContentBg: string
      cancelBtnBg: string
      cancelBtnHover: string
      popoverBg: string
      warningBg: string
      warningSageBg: string
      actionInfoText: string
      networkWarningBg: string
      walletWarningBg: string
      walletWarningText: string
      [x: string]: string
      toolTipBackground: string
      farmInfoBackground: string
      inputSeparator: string
      inputBackground: string
      inputActiveBg: string
      inputInactiveBg: string
      inputErrorBg: string
      inputActiveBorder: string
      inputInactiveBorder: string
      inputErrorBorder: string
      arrowColor: string
      cardHighlight: string
      timerColor: string
    }

    images: {
      loading: string
    }

    svgFilter: string

    shadows: {
      default: string
    }

    sizes: {
      borderRadius: string
      xxs: string
      xs: string
      sm: string
      md: string
      lg: string
      xlg: string
      xxlg: string
    }
  }
}

export type ThemeSettings = {
  Light: DefaultTheme
  Dark: DefaultTheme
}

export type Farm = {
  contractId: string
  pairTokenAId: string
  pairTokenASymbol: string
  pairTokenBId: string
  pairTokenBSymbol: string
  stakedTokenPoolId?: string
  stakedTokenAmt: string
  stakedTokenId: string
  stakedTokenSymbol: string
  rewardTokenId: string
  rewardTokenSymbol: string
  startBlock: string
  endBlock: string
  remainingRewardA: string
  remainingRewardB: string
  totalStaked: string
  totalReward: { A: string; B: string }
  stakedTokenDecimals: number
  rewardTokenDecimals: number
  stakedTokenTotalSupply: string
  primaryStakeTokenBalance: string
  endDate?: string
  startDate?: string
  rewardsPerBlock: { asDefaultNetworkToken: string; asRewardToken: string }
  isPartnerFarm?: boolean
}

export type NullableDate = Date | null

export type FormattedPoolData = {
  hasLiquidity: boolean
  formattedPoolInfo: Pool | null
}

export type Prices = {
  lastRate: number
  lastUpdate: number
  displayUnit: string
}
