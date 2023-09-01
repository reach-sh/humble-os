// Toast Container
import styled from 'styled-components'
import { ToastContainer, ToastOptions, Flip, toast } from 'react-toastify'
// needed to leverage react-toastify's native styles and settings
import 'react-toastify/dist/ReactToastify.css'
import { isMobile } from 'react-device-detect'

// Custom toast styles here
const StyledContainer = styled(ToastContainer).attrs({
  position: isMobile ? toast.POSITION.TOP_CENTER : toast.POSITION.TOP_RIGHT,
})`
  max-width: 420px;
  font-family: Lato;
  .Toastify__toast--warning {
    background: ${({ theme }) => theme.colors.networkWarningBg};
    color: ${({ theme }) => theme.colors.text};
    height: 80px;
  }
  .Toastify__toast {
    background: ${({ theme }) => theme.colors.text};
    width: 420px;
    color: white;
    box-shadow: 0px 4px 40px rgba(108, 150, 136, 0.2);
    border-radius: 16px;
  }
  .Toastify__toast--error {
    background: #dce0e6;
    color: ${({ theme }) => theme.colors.text};
  }
  .Toastify__toast--success {
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text};
    color: black;
    font-weight: bold;
  }
`

/**
 * Applied to all toast notifications in the application
 * see: src/hooks/useToast
 */
const DEFAULT_SETTINGS: ToastOptions = {
  position: 'top-right',
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  draggable: false,
  pauseOnHover: true,
  transition: Flip,
  className: isMobile
    ? 'custom-toast-position-mobile'
    : 'custom-toast-position',
  isLoading: false,
}

/**
 * Notification wrapper that allows for easy ovverrides using the styles above to assign them globally
 */
const NotificationContainer = () => (
  <StyledContainer
    position={DEFAULT_SETTINGS.position}
    autoClose={DEFAULT_SETTINGS.autoClose}
    hideProgressBar={DEFAULT_SETTINGS.hideProgressBar}
    closeOnClick={DEFAULT_SETTINGS.closeOnClick}
    pauseOnFocusLoss={DEFAULT_SETTINGS.pauseOnFocusLoss}
    draggable={DEFAULT_SETTINGS.draggable}
    pauseOnHover={DEFAULT_SETTINGS.pauseOnHover}
    transition={DEFAULT_SETTINGS.transition}
    progressClassName='progress'
    bodyClassName='body'
    // className='toastContainer'
  />
)

export default NotificationContainer
