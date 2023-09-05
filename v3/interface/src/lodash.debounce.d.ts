declare module 'lodash.debounce' {
  /** Debounce options */
  declare type DebounceOpts = {
    /** Specify invoking on the leading edge of the timeout */
    leading?: boolean
    /** Specify invoking on the trailing edge of the timeout */
    trailing?: boolean
    /** The maximum time `action` is allowed to be delayed before it's invoked */
    maxWait?: number
  }

  /**
   * Creates a debounced function that delays invoking `action` until after `milliseconds`
   * have elapsed since the last time the debounced function was invoked. The debounced
   * function comes with a cancel method to cancel delayed `action` invocations and a `flush`
   * method to immediately invoke them. Provide options to indicate whether `action` should
   * be invoked on the leading and/or trailing edge of the wait timeout.
   */
  declare function debounce<T>(
    action: T,
    milliseconds: number,
    options?: DebounceOpts,
  ): { cancel(): any } & T

  export = debounce
}
