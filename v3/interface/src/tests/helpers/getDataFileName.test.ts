import getAPIURL from '../../helpers/getAPIURL'

describe('Generates S3 paths', () => {
  it('Generates MainNet S3 file names', () => {
    const network = 'MainNet'
    expect(getAPIURL(network)).toContain('/humble-mainnet')
    expect(getAPIURL(network)).toContain('/humble-mainnet')
    expect(getAPIURL(network)).toContain('/humble-mainnet')

    expect(getAPIURL(network)).not.toContain('/humble-dev')
    expect(getAPIURL(network)).not.toContain('/humble-dev')
    expect(getAPIURL(network)).not.toContain('/humble-dev')

    expect(getAPIURL(network)).not.toContain('/humble-testnet')
    expect(getAPIURL(network)).not.toContain('/humble-testnet')
    expect(getAPIURL(network)).not.toContain('/humble-testnet')
  })

  it('Generates Public TestNet S3 file names', () => {
    const network = 'TestNet'
    const hostname = 'testnet.humbleswap'
    const value = { hostname }
    Object.defineProperty(window, 'location', { value, writable: true })
    expect(getAPIURL(network)).toContain('/humble-testnet')
    expect(getAPIURL(network)).toContain('/humble-testnet')
    expect(getAPIURL(network)).toContain('/humble-testnet')

    expect(getAPIURL(network)).not.toContain('/humble-dev')
    expect(getAPIURL(network)).not.toContain('/humble-dev')
    expect(getAPIURL(network)).not.toContain('/humble-dev')

    expect(getAPIURL(network)).not.toContain('/humble-mainnet')
    expect(getAPIURL(network)).not.toContain('/humble-mainnet')
    expect(getAPIURL(network)).not.toContain('/humble-mainnet')
  })

  it('Generates TestNet S3 file names', () => {
    const network = 'TestNet'
    const hostname = 'localhost'
    Object.defineProperty(window, 'location', { value: { hostname } })

    expect(getAPIURL(network)).toContain('/humble-dev')
    expect(getAPIURL(network)).toContain('/humble-dev')
    expect(getAPIURL(network)).toContain('/humble-dev')

    expect(getAPIURL(network)).not.toContain('/humble-testnet')
    expect(getAPIURL(network)).not.toContain('/humble-testnet')
    expect(getAPIURL(network)).not.toContain('/humble-testnet')

    expect(getAPIURL(network)).not.toContain('/humble-mainnet')
    expect(getAPIURL(network)).not.toContain('/humble-mainnet')
    expect(getAPIURL(network)).not.toContain('/humble-mainnet')
  })
})
