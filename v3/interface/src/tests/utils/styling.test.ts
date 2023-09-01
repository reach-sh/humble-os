import { colorOpacityToHex } from 'utils/styling'

describe('Test colorOpacityToHex', () => {
  test('with 100% opacity', () => {
    const newHex = colorOpacityToHex('#1C42BA', 100)
    expect(newHex).toEqual('#FF1C42BA')
  })

  test('with 73% opacity', () => {
    const newHex = colorOpacityToHex('#1C42BA', 73)
    expect(newHex).toEqual('#BA1C42BA')
  })

  test('with no #', () => {
    const newHex = colorOpacityToHex('1C42BA', 100)
    expect(newHex).toEqual('#FF1C42BA')
  })
})
