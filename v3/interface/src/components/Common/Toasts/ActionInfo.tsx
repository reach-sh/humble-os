import { SwapInfo } from 'types/shared'
import styled from 'styled-components'

type ActionInfoProps = {
  message: string
  info?: SwapInfo
  className?: string
}

const ActionInfo = ({
  message,
  info,
  className,
}: ActionInfoProps): JSX.Element => {
  if (info) {
    return (
      <div className={className}>
        {`${message} ${info.amtA} ${info.tokA?.symbol}
        /
        ${info.amtB} ${info.tokB?.symbol} `}
      </div>
    )
  }
  return <p className={className}>{message}</p>
}

export default styled(ActionInfo).attrs({
  className: 'action-info',
})`
  left: 1em;
  align-self: flex-start;
  font-family: 'Lato', sans-serif;
  font-weight: 700;
  color: black;
`
