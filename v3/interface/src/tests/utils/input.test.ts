import {
  ALLOWED_NAME_LENGTH,
  getValueWithMaxDecimals,
  MAX_DECIMALS,
  truncateText,
  arrayToObject,
} from 'utils/input'

describe.each([
  [
    'returns value with default decimal places',
    '0.1234567',
    '0.12345',
    MAX_DECIMALS,
  ],
  ['returns value with specified decimal places', '0.1234567', '0.12', 2],
  [
    'returns integer without pointless decimal places added on',
    '5',
    '5',
    MAX_DECIMALS,
  ],
  [
    'returns values that are already in exponential form',
    '3.0e-3',
    '3.0e-3',
    MAX_DECIMALS,
  ],
  [
    'returns 0 if exponential value cant be represented within decimal places',
    '3.0e-6',
    '0',
    MAX_DECIMALS,
  ],
])(
  'test getValueWithMaxDecimals functionality',
  (testName, value, expectedValue, decimals) => {
    test(testName, () => {
      const resultValue = getValueWithMaxDecimals(value, decimals)
      expect(resultValue).toBe(expectedValue)
    })
  },
)

describe.each([
  [
    'trims string to default allowed length',
    'TheBabblingBrook',
    'TheBabblingBro...',
    ALLOWED_NAME_LENGTH,
  ],
  ['trims string to specified allowed length', 'TheBabblingBrook', 'The...', 3],
  [
    'returns string that does not require trimming',
    'TheBabblingBro',
    'TheBabblingBro',
    ALLOWED_NAME_LENGTH,
  ],
  [
    'returns empty string if no input is given',
    undefined,
    '',
    ALLOWED_NAME_LENGTH,
  ],
])(
  'test truncateText functionality',
  (testName, value, expectedValue, allowedNameLength) => {
    test(testName, () => {
      const resultValue = truncateText(value, allowedNameLength)
      expect(resultValue).toBe(expectedValue)
    })
  },
)

describe('test arrayToObject functionality', () => {
  type ob = { a: string; b: string }
  const array = [
    { a: 'one', b: 'two' },
    { a: 'three', b: 'four' },
    { a: 'five', b: 'six' },
  ]
  const expected = {
    one: { a: 'one', b: 'two' },
    three: { a: 'three', b: 'four' },
    five: { a: 'five', b: 'six' },
  }
  const expectedB = {
    two: { a: 'one', b: 'two' },
    four: { a: 'three', b: 'four' },
    six: { a: 'five', b: 'six' },
  }

  test('array gets converted to keyed object', () => {
    const getKey = (objInArray: ob) => objInArray.a
    const resultValue = arrayToObject(array, getKey)
    expect(resultValue).toStrictEqual(expected)
  })

  test('array gets converted to keyed object', () => {
    const getKey = (objInArray: ob) => objInArray.b
    const resultValue = arrayToObject(array, getKey)
    expect(resultValue).toStrictEqual(expectedB)
  })

  test('converted object respects array order', () => {
    const arrayChangedOrder = [
      { a: 'three', b: 'four' },
      { a: 'five', b: 'six' },
      { a: 'one', b: 'two' },
    ]
    const expectedChangedOrder = {
      three: { a: 'three', b: 'four' },
      five: { a: 'five', b: 'six' },
      one: { a: 'one', b: 'two' },
    }
    const getKey = (objInArray: ob) => objInArray.a

    const resultValue = arrayToObject(arrayChangedOrder, getKey)
    expect(resultValue).toStrictEqual(expectedChangedOrder) // Same content
    expect(JSON.stringify(resultValue)).toStrictEqual(
      JSON.stringify(expectedChangedOrder),
    ) // And same order

    expect(resultValue).toStrictEqual(expected) // Same content
    expect(JSON.stringify(resultValue)).not.toStrictEqual(
      JSON.stringify(expected),
    ) // But different order
  })
})
