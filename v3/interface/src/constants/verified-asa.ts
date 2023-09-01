/** Curated list of Verified Algorand ASAs */

interface ASA {
  assetID: number
  creator: string
  totalSupply: number
  timestamp: number
  owner: string
  unitName: string
  assetName: string
  url: string
  decimals: number
  verified: true
  verified_info: {
    name: string
    title: string
    description: string
    creator: string
    unit: string
    url: string
  }
  destroyed: false
}

const ASAs: ASA[] = [
  {
    assetID: 312769,
    creator: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
    totalSupply: 18446744073709552000,
    timestamp: 1581015401,
    owner: 'Tether',
    unitName: 'USDt',
    assetName: 'Tether USDt',
    url: 'tether.to',
    decimals: 6,
    verified: true,
    verified_info: {
      name: 'Tether USDt',
      title: 'Tether USDt',
      description:
        'Tether is a token backed by actual assets, including USD and Euros. One Tether equals one underlying unit of the currency backing it, e.g., the U.S. Dollar, and is backed 100% by actual assets in the Tether platform\'s reserve account. Being anchored or \'tethered\' to real world currency, Tether provides protection from the volatility of cryptocurrencies.\n\nTether enables businesses – including exchanges, wallets, payment processors, financial services and ATMs – to easily use fiat-backed tokens on blockchains. By leveraging Blockchain technology, Tether allows you to store, send and receive digital tokens person-to-person, globally, instantly, and securely for a fraction of the cost of alternatives.\n\nTether\'s platform is built to be fully transparent at all times.',
      creator: 'XIU7HGGAJ3QOTATPDSIIHPFVKMICXKHMOR2FJKHTVLII4FAOA3CYZQDLG4',
      unit: 'USDt',
      url: 'https://tether.to/',
    },
    destroyed: false,
  },
  {
    assetID: 31566704,
    creator: '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM',
    totalSupply: 18446744073709552000,
    timestamp: 1599252577,
    owner: 'Centre',
    unitName: 'USDC',
    assetName: 'USDC',
    url: 'https://www.centre.io/usdc',
    decimals: 6,
    verified: true,
    verified_info: {
      name: 'USDC',
      title: 'USD Coin',
      description:
        'USDC provides a fully collateralized US dollar stablecoin, and is based on the open source asset-backed stablecoin framework developed by Centre.\n\nCentre stablecoins are issued by regulated and licensed financial institutions that maintain full reserves of the equivalent fiat currency. Issuers are required to regularly report their USD reserve holdings, and Grant Thornton LLP issues reports on those holdings every month.',
      creator: '2UEQTE5QDNXPI7M3TU44G6SYKLFWLPQO7EBZM7K7MHMQQMFI4QJPLHQFHM',
      unit: 'USDC',
      url: 'https://www.centre.io/usdc',
    },
    destroyed: false,
  },
]

/* Convert list into key-value store */
type ASARecord = Record<number, ASA>
const VerifiedASAs: ASARecord = ASAs.reduce(
  (agg, asa) => ({ ...agg, [asa.assetID]: asa }),
  {},
)

export default VerifiedASAs
