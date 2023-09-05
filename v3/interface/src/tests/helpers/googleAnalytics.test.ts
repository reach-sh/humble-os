import { getGAParams } from 'helpers/googleAnalytics'

describe('Google Analytics helper tests', () => {
  const wallet1 = 'AAXX1212DDYY3434'
  const wallet2 = 'DDYY3434AAXX1212'

  it('Generates default Event Params', () => {
    const params = getGAParams()
    expect(params.utm_campaign).toBe('none')
    expect(params.utm_medium).toBe('none')
    expect(params.utm_source).toBe('none')
    expect(params.wallet_id).toBe('')
  })

  it('Maps a wallet address exactly as received', () => {
    expect(getGAParams(wallet1).wallet_id).toStrictEqual(wallet1)
    expect(getGAParams(wallet2).wallet_id).toStrictEqual(wallet2)
  })

  it('Maps values from the URL query params', () => {
    const search = '?utm_campaign=1&utm_medium=2&utm_source=3'
    const params = getGAParams(wallet1, search)
    expect(params.utm_campaign).toBe('1')
    expect(params.utm_medium).toBe('2')
    expect(params.utm_source).toBe('3')
    expect(params.wallet_id).toBe(wallet1)

    const badSearch = '?utm_campaign=1,utm_medium=2,utm_source=3'
    const badParams = getGAParams(wallet2, badSearch)
    expect(badParams.utm_campaign).toBe('1,utm_medium=2,utm_source=3')
    expect(badParams.utm_medium).toBe('none')
    expect(badParams.utm_source).toBe('none')
    expect(badParams.wallet_id).toBe(wallet2)
  })
})
