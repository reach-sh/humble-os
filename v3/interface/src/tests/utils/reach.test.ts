import {
  trimByteString,
  truncateAccountString,
  asMaybe,
  fromMaybe,
} from 'utils/reach'

describe('Test trimByteString', () => {
  test('by removing \\u0000', () => {
    expect(trimByteString('Francisco Token\u0000\u0000')).toBe(
      'Francisco Token',
    )
  })
  test('with no \\u0000', () => {
    expect(trimByteString('Raph Token')).toBe('Raph Token')
  })
  test('by removing \\u0000 from beginning', () => {
    expect(trimByteString('\u0000Mauro Token')).toBe('Mauro Token')
  })
  test('by removing \\u0000 from middle', () => {
    expect(trimByteString('Tim\u0000 Token')).toBe('Tim Token')
  })
  test('by removing only \\u0000', () => {
    expect(trimByteString('\u0000\u0000')).toBe('')
  })
})

describe('Test truncateAccountString', () => {
  test('with long account', () => {
    expect(
      truncateAccountString(
        'RXMWRESHEXFOQOC7QTLKIX3IKIOC37U22KPJTZEVRFOTR5TCJEJAUUKM6M',
      ),
    ).toEqual('RXMW...KM6M')
  })
  test('with short account', () => {
    expect(truncateAccountString('11112222')).toEqual('1111...2222')
  })
  test('with short account', () => {
    expect(truncateAccountString('1111')).toEqual('1111...1111')
  })
})

describe('Test asMaybe', () => {
  test('as undefined', () => {
    const res = asMaybe(undefined)
    expect(res[0]).toEqual('None')
    expect(res[1]).toEqual(null)
  })

  test('as null', () => {
    const res = asMaybe(null)
    expect(res[0]).toEqual('None')
    expect(res[1]).toEqual(null)
  })

  test('as token Id', () => {
    const res = asMaybe(23493083)
    expect(res[0]).toEqual('Some')
    expect(res[1]).toEqual(23493083)
  })
})
describe('Test fromMaybe', () => {
  test('[Some, tokenId]', () => {
    expect(fromMaybe(['Some', 23493083])).toEqual(23493083)
  })

  test('[None, null]', () => {
    expect(fromMaybe(['None', null])).toEqual(null)
  })

  test('[None, undefined]', () => {
    expect(fromMaybe(['None', null])).toEqual(null)
  })

  test('[None, undefined] with fallback', () => {
    expect(fromMaybe(['None', null], undefined, 'Fallback')).toEqual('Fallback')
  })
})
