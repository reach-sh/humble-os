import Done from 'components/Common/Toasts/Success/Done'
import { ToastProps } from 'types/shared'
import TransactionLink from 'components/Common/Toasts/Success/TransactionLink'
import ActionInfo from 'components/Common/Toasts/ActionInfo'
import styled from 'styled-components'

const Success = ({
  message,
  info,
  acct,
  className,
}: ToastProps): JSX.Element => {
  if (info && acct) {
    return (
      <div className={className}>
        <ActionInfo message={message} info={info} />
        <Done />
        <TransactionLink acct={acct} />
      </div>
    )
  }
  return (
    <div className={className}>
      <Done />
      {`${message}`}
    </div>
  )
}

export default styled(Success).attrs({})`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.text};
  font-family: Lato;
  font-style: normal;
  font-weight: bold;
`
