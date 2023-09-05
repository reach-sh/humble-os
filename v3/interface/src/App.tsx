import { useEffect, useState, Suspense } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import NotFound from 'pages/NotFound'
// UI
import { paths, FarmPage, SwapPage, PoolPage, XGovs } from 'App.routes'
import Header from 'components/Header'
// Notification Container
import NotificationContainer from 'components/NotificationWrapper'
import LanguageProvider from 'LanguageProvider'
//
import 'styles/App.scss'
// Global Theme
import styled, { ThemeProvider } from 'styled-components'
import GlobalStyles from 'components/GlobalStyles'
import THEME from 'theme'
import { ThemeContext, ThemeEnum } from 'contexts/theme'
import { lsGetJSON, lsSetJSON } from 'helpers/localStorage'
import LoadingScreen from 'LoadingScreen'
import ADI, { cacheExpired, initializeADI } from 'cache'
import Footer from 'components/Footer'
import InitialLoadingScreen from 'InitialLoadingScreen'
import ProgressBar from 'components/ProgressBar'
import IdleUserNotification from 'components/IdleUserNotification'
import LimitOrder from 'pages/LimitOrder'
import NavFooter from 'components/AppNavigation/NavFooter'
import { useIsMobile } from 'hooks/useScreenSize'
import {
  APP_UPDATED,
  CURRENT_PROVIDER,
  PROVIDERS,
} from 'constants/reach_constants'
import { CLIENT_OPTIONS } from 'constants/wc2'
import circlesDark from 'assets/bg-circles-dark.svg'
import circlesLight from 'assets/bg-circles-light.svg'
import { buildProviderEnv, clearPersistedUserAccount } from 'helpers/getReach'
import AppUpdateModal from 'components/Modals/AppUpdateModal'
import useGlobalModal from 'hooks/useGlobalModal'
import GlobalModal, { MODAL } from 'state/reducers/modals'
import ClearLocalDataModal from 'components/Modals/ClearLocalDataModal'
import { executeHubspotSupport } from 'utils/inject-scripts'
import { getAppEnvironment } from 'helpers/getAPIURL'
import WarningBanner from 'components/WarningBanner'
import DeclaimerBanner from 'components/DeclaimerBanner'
import GovernanceNotification from 'components/GovernanceNotification'

import {
  WalletProvider,
  useInitializeProviders,
  PROVIDER_ID,
} from '@txnlab/use-wallet'
import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { PeraWalletConnect } from '@perawallet/connect'
import {
  WalletConnectModalSign,
  WalletConnectModalSignOptions,
} from '@walletconnect/modal-sign-html'
import algosdk from 'algosdk'
import MyAlgoConnect from '@randlabs/myalgo-connect'

const gradient = (bgColor: string, isDark = false) => {
  const dark = '#8F8F8F1A 4%, #36332E 50%'
  const light = '#FFBE1D80 10%, #FFBE1D80 40%'
  const theme = isDark ? dark : light
  return `radial-gradient(circle at top, ${theme}, ${bgColor} 75%)`
}
const Background = styled.div<{ dark?: boolean }>`
  background: ${({ dark, theme }) => gradient(theme.colors.background, dark)};
  height: 100%;
  position: absolute;
  top: 0px;
  width: 100%;
  z-index: -100;
`

const CirclesBackground = styled(Background)<{ dark?: boolean }>`
  background-image: url(${({ dark }) => (dark ? circlesDark : circlesLight)});
  background-repeat: no-repeat;
  background-position: center top;
  z-index: -99;
`

function App(): JSX.Element {
  const providerEnv = buildProviderEnv()
  const providers = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.MYALGO, clientStatic: MyAlgoConnect },
      {
        id: PROVIDER_ID.WALLETCONNECT,
        clientStatic: WalletConnectModalSign,
        clientOptions: CLIENT_OPTIONS as WalletConnectModalSignOptions,
      },
    ],
    nodeConfig: {
      network: CURRENT_PROVIDER.toLowerCase(),
      nodeServer: providerEnv.ALGO_SERVER,
      nodeToken: providerEnv.ALGO_TOKEN,
      nodePort: '443',
    },
    algosdkStatic: algosdk,
  })

  const themeSetting = lsGetJSON('theme')
  const [theme, changeTheme] = useState<ThemeEnum>(
    themeSetting || ThemeEnum.Light,
  )
  const [showAnimation, setShowAnimation] = useState(true)
  const [ready, setReady] = useState(false)

  const setTheme = () => {
    const incomingTheme = theme === 'Dark' ? ThemeEnum.Light : ThemeEnum.Dark
    lsSetJSON('theme', incomingTheme)
    changeTheme(incomingTheme)
  }
  const { modal } = useGlobalModal()

  const clearAndReload = () => {
    localStorage.removeItem(APP_UPDATED)
    clearPersistedUserAccount() // reloads window
  }

  const checkAppVersion = async () => {
    const newVersion = await cacheExpired()
    if (newVersion) GlobalModal.active(MODAL.APP_UPDATE)
    else {
      setShowAnimation(false)
      setReady(true)
    }
  }

  useEffect(() => {
    if (!ADI.isInitialized()) initializeADI()
    setTimeout(checkAppVersion) // failsafe to ensure ADI is up
    // Enable Hubspot (chat support) outside dev env
    if (getAppEnvironment() !== 'dev') executeHubspotSupport()
  }, [])

  const isMobile = useIsMobile()
  return (
    <WalletProvider value={providers}>
      <ThemeProvider theme={THEME[theme]}>
        <GlobalStyles />
        <LanguageProvider>
          <ThemeContext.Provider value={{ theme, setTheme }}>
            <Background dark={theme === 'Dark'} />
            <CirclesBackground dark={theme === 'Dark'} />
            {CURRENT_PROVIDER === PROVIDERS.MAINNET ? (
              <DeclaimerBanner />
            ) : (
              <WarningBanner />
            )}

            <Router>
              <Header />
              {isMobile && <NavFooter />}

              <GovernanceNotification />

              <Routes>
                <Route
                  path='/swap/*'
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <SwapPage />
                    </Suspense>
                  }
                />
                <Route
                  path='/limit-order'
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <LimitOrder />
                    </Suspense>
                  }
                />
                <Route
                  path='/pool/*'
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <PoolPage />
                    </Suspense>
                  }
                />
                <Route
                  path='/farm/*'
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <FarmPage />
                    </Suspense>
                  }
                />
                <Route
                  path='/xgovs'
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <XGovs />
                    </Suspense>
                  }
                />
                <Route
                  path='/'
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <Navigate to={paths.pool.index} replace />
                    </Suspense>
                  }
                />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Router>

            <Footer />
          </ThemeContext.Provider>

          <NotificationContainer />
          <ProgressBar />
          <IdleUserNotification />

          {/* Modals */}
          <AppUpdateModal
            open={modal === MODAL.APP_UPDATE}
            onClose={clearAndReload}
          />

          <ClearLocalDataModal open={modal === MODAL.CONFIRM_CLEAR_DATA} />

          {/* Loading Screen */}
          {showAnimation && <InitialLoadingScreen completeAnimation={ready} />}
        </LanguageProvider>
      </ThemeProvider>
    </WalletProvider>
  )
}

export default App
