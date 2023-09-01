export const MAX_DECIMALS = 5

// checks the number amount and prevents any decimals being added than the explicitely described max decimal
export const getValueWithMaxDecimals = (
  originalValue: string,
  decimals = MAX_DECIMALS,
) => {
  let value = originalValue.toString()
  if (value.includes('e')) {
    const exPlaces = value.slice(value.indexOf('e') + 2)
    // if the exponential value (lets say 7 in 3.0e-7) is higher than the decimal
    // value for the coin (6), then the fee is zero since it's calculated amount
    // is too small for the coins precision
    if (decimals < Number(exPlaces)) return '0'
    return originalValue
  }

  const hasDecimal = value.includes('.')
  if (hasDecimal) {
    const idxOfPeriod = value.indexOf('.')
    value =
      value.substring(0, idxOfPeriod) +
      value.substring(idxOfPeriod, idxOfPeriod + decimals + 1)
  }
  if (decimals === 0 && value) value = Math.floor(Number(value)).toString()
  return value
}

// disallows anything other than integers and floats
// ...this works, but can probably be done better
export const blockInvalidChar = (
  e: React.KeyboardEvent<HTMLDivElement>,
  value: string | number,
) => {
  const regex =
    value.toString().includes('.') || value.toString().includes(',')
      ? /[0-9]/
      : /[0-9.,]/
  if (e.key.length > 1 || e.metaKey || e.ctrlKey) return
  if (!regex.test(e.key) && e.preventDefault) e.preventDefault()
}

export const ALLOWED_NAME_LENGTH = 14

export function truncateText(input?: string, maxLength = ALLOWED_NAME_LENGTH) {
  if (!input) return ''
  return input.length > maxLength
    ? `${input.substring(0, maxLength)}...`
    : input
}

export const arrayToObject = <T extends Record<K, any>, K extends keyof any>(
  array: T[] = [],
  getKey: (item: T) => K,
) =>
  array.reduce((obj, cur) => {
    const key = getKey(cur)
    return { ...obj, [key]: cur }
  }, {} as Record<K, T>)

export const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
}

export const capitalizeFirstLetter = (str?: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
