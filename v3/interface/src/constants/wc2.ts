const defaultWC2ProviderId = 'e7b04c22de006e0fc7cef5a00cb7fac9'
export const CLIENT_OPTIONS = {
  projectId: process.env.REACT_APP_WC2_PROVIDER_ID || defaultWC2ProviderId,
  metadata: {
    name: 'Humble Swap',
    description: 'Humble Swap Dapp',
    url: 'https://app.humble.sh',
    icons: ['https://walletconnect.com/walletconnect-logo.png'],
  },
  modalOptions: {
    themeMode: 'dark',
  },
}
export default CLIENT_OPTIONS
