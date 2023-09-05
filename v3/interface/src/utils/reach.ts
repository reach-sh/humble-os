import { Maybe } from 'types/shared'
/**
 * Strip `\0000` characters from byte string
 * @param {stringn} str String with empty `\0000` characters to remove
 * @returns
 */
export function trimByteString(str: string): string {
  return str && str.replace(/\0/g, '')
}

/**
 * Truncates Account string to `XX...XXXX`
 * @param {string} acct Account string
 * @returns {string}
 */
export function truncateAccountString(acct: string): string {
  const { length } = acct
  const start = acct.substring(0, 4)
  return `${start}...${acct.substring(length - 4, length)}`
}

/**
 * Wrap a `Maybe` value, where `mVal[0]` is `"Some"` when `mVal` is truthy
 */
export function asMaybe<T>(mVal?: T): Maybe<T> {
  const maybe: Maybe<T> =
    mVal === null || mVal === undefined ? ['None', null] : ['Some', mVal]
  return maybe
}

/**
 * Unwrap a `Maybe` value. When `mVal[0]` is `"Some"`, `mVal[1]`
 * has a value
 */
export function fromMaybe(
  mVal: [val: 'Some' | 'None', v: any],
  format = (v: any) => v,
  fallback?: any,
): any | null {
  return mVal[0] === 'Some' ? format(mVal[1]) : fallback || mVal[1]
}
