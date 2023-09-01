import noNetwork from 'assets/Icons/no-network.svg'
import { ToastProps } from 'types/shared'
import styled from 'styled-components'

const NetworkToast = ({ message, className }: ToastProps) => (
  <div className={className}>
    <p> Network Error</p>
    <div className='network_toast_warning'>
      <img src={noNetwork} />
      <p>{message}</p>
    </div>
  </div>
)

export default styled(NetworkToast).attrs({})``
