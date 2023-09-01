import styled from 'styled-components'
import { WALLET_PROVIDERS } from 'constants/reach_constants' // legacy provider ids
import { PROVIDER_ID } from '@txnlab/use-wallet' // txnlab usewallet provider ids
import { useTheme } from 'contexts/theme'
import maLogo from 'assets/my-algo-blue.png'
import deflyLight from 'assets/defly-light.svg'
import deflyDark from 'assets/defly-dark.svg'
import peraWhite from 'assets/pera-logomark-white.png'
import peraBlack from 'assets/pera-logomark-black.png'
import fireBlocksLogo from 'assets/fireblocks-logo.svg'
import walletConnectIcon from 'assets/walletconnect-circle-black.png'
import ExodusLogo from './Icons/exodus'
import ImageLoader from './ImageLoader'

const StyledIcon = styled(ImageLoader)`
  margin: 2px 4px 0 4px; // Make layout consistent with CryptoIcon
`
const Icon = styled(StyledIcon)`
  padding: 6px;
`
const WalletIcon = ({ iconName }: { iconName: string }) => {
  const { theme } = useTheme()
  const {
    MYALGO: LEGACY_MYALGO,
    WALLETCONNECT: LEGACY_WALLETCONNECT,
    PERA: LEGACY_PERA,
    DEFLY: LEGACY_DEFLY,
    FIREBLOCKS: LEGACY_FIREBLOCKS,
    EXODUS: LEGACY_EXODUS,
  } = WALLET_PROVIDERS
  const { MYALGO, WALLETCONNECT, PERA, DEFLY } = PROVIDER_ID
  const peraIcon = theme === 'Dark' ? peraWhite : peraBlack
  const deflyIcon = theme === 'Dark' ? deflyDark : deflyLight
  switch (iconName) {
    case LEGACY_MYALGO:
    case MYALGO:
      return <StyledIcon src={maLogo} width={32} height={32} />
    case LEGACY_WALLETCONNECT:
    case WALLETCONNECT:
      return <Icon src={walletConnectIcon} width={32} height={32} />
    case LEGACY_PERA:
    case PERA:
      return <Icon src={peraIcon} width={32} height={32} />
    case LEGACY_DEFLY:
    case DEFLY:
      return <Icon src={deflyIcon} width={32} height={32} />
    case LEGACY_FIREBLOCKS:
      return <Icon src={fireBlocksLogo} width={32} height={32} />
    case LEGACY_EXODUS:
      return <ExodusLogo />
    default:
      return <></>
  }
}

export default WalletIcon
