import { useRef, useEffect } from 'react'
import styled from 'styled-components'
import Settings from 'components/Header/Settings'
import ConnectWallet from 'components/ConnectWallet'
// redux state management
import SIZE from 'constants/screenSizes'
import { HUMBLE_SWAP_SUPPORT } from 'constants/links'
import FlexContainer, {
  FlexColumnContainer,
} from 'components/Common/FlexContainer'
import logoWhite from 'assets/logo-white.svg'
import logoBlack from 'assets/logo-black.svg'
import { Link } from 'react-router-dom'
import { useTheme } from 'contexts/theme'
import NetworkProviderModal from 'components/Modals/NetworkProviderModal'
import GlobalModal, { MODAL, clearGlobalModal } from 'state/reducers/modals'
import AppNavigation from 'components/AppNavigation'
import useGlobalModal from 'hooks/useGlobalModal'
import { useIsMobile } from 'hooks/useScreenSize'
import { paths } from 'App.routes'
import useGlobalUser from 'hooks/useGlobalUser'
import BuyAlgoModal from 'components/Modals/BuyAlgoModal'
import UserAddress from './Account'
import PopupBlocked from '../PopupBlocked'

const Container = styled(FlexColumnContainer)`
  top: 0;
  position: sticky;
  width: 100%;
  z-index: 99;
`
const HeaderContainer = styled(FlexContainer)`
  background: ${({ theme }) => theme.colors.lighterBackground};
  height: auto;
  justify-content: space-between;
  padding: 0.5rem 0.75rem 0.5rem 0.25rem;

  @media (min-width: ${SIZE.sm}) {
    padding: 0 2rem 0 2rem;
  }
`

const LeftContainer = styled(FlexContainer)``
const RightContainer = styled(FlexContainer)`
  justify-content: right;
`
const SettingsWrapper = styled(FlexContainer)`
  > .sendwyre {
    display: inline-flex;
  }

  @media (max-width: ${SIZE.sm}) {
    > .sendwyre {
      display: none;
    }
  }
`
const Logo = styled.img`
  height: auto;
  width: 12.5rem;
  position: relative;
  top: 4px;
  z-index: 9;

  @media screen and (max-width: ${SIZE.sm}) {
    width: 8.5rem;
  }
`

/**
 * Global Header for application
 */
const Header = () => {
  const logo = useTheme().theme === 'Dark' ? logoWhite : logoBlack
  const { CONNECT_WALLET, POPUP_BLOCKED } = MODAL
  const closeNPSelect = () =>
    walletAddress ? clearGlobalModal() : GlobalModal.active(CONNECT_WALLET)
  const { modal } = useGlobalModal()
  const { walletAddress, connecting } = useGlobalUser([
    'connecting',
    'walletAddress',
  ])
  const walletAddressRef = useRef(walletAddress)
  const isMobile = useIsMobile()
  useEffect(() => {
    if (
      !isMobile &&
      walletAddress &&
      walletAddress !== walletAddressRef.current
    ) {
      const newWin = window.open(HUMBLE_SWAP_SUPPORT)
      const blocked = typeof newWin?.closed === 'undefined' || newWin.closed
      if (!newWin || blocked) GlobalModal.active(POPUP_BLOCKED)
      newWin?.close()
    }
    walletAddressRef.current = walletAddress
  }, [walletAddress])

  return (
    <Container>
      <HeaderContainer>
        <LeftContainer>
          <Link to={paths.pool.index}>
            <Logo src={logo} />
          </Link>
          {!isMobile && <AppNavigation />}
        </LeftContainer>
        <RightContainer>
          {connecting && <p className='spinner--before' />}

          {/* <Network /> */}

          {walletAddress ? (
            // Connected User
            <SettingsWrapper>
              <BuyAlgoModal
                open={[MODAL.WYRE_MODAL, MODAL.MOONPAY_MODAL].includes(modal)}
                variant={modal === MODAL.WYRE_MODAL ? 'Wyre' : 'Moon pay'}
              />
              <UserAddress />
              <Settings />
            </SettingsWrapper>
          ) : (
            // "Connect" button
            !connecting && <ConnectWallet />
          )}

          <NetworkProviderModal
            open={modal === MODAL.NETWORK_PROVIDER}
            onClose={closeNPSelect}
          />
        </RightContainer>
        <PopupBlocked
          open={modal === MODAL.POPUP_BLOCKED}
          onClose={clearGlobalModal}
        />
      </HeaderContainer>
    </Container>
  )
}

export default Header
