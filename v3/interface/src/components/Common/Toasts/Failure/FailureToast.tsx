import styled from 'styled-components'
import { ToastProps } from 'types/shared'
import rejection from 'assets/Icons/rejected.svg'
import { ASSURANCE, TRANSACTION } from 'constants/messages'
import ActionInfo from '../ActionInfo'
import TroubleshootingLink from './TroubleshootingLink'

const RejectionImage = styled.img`
  filter: invert(35%) sepia(55%) saturate(4921%) hue-rotate(344deg)
    brightness(87%) contrast(96%);
  margin-right: 0.25em;
  line-height: 19px;
`

const Rejection = styled.div`
  vertical-align: middle;
  display: flex;
  color: #db362c;
  font-family: Lato;
  font-weight: bold;
  margin-left: 1em;
`

const RejectionMessage = ({ message }: { message: string }) => (
  <>
    <RejectionImage src={rejection} />
    <p>{message === 'Cancel' ? 'Cancel' : 'Error'}</p>
  </>
)

const Reassurance = styled.div`
  color: black;
  font-weight: 400;
  padding-top: 0.25em;
  margin-left: 1em;
`
const ErrorMessage = styled.p`
  margin-left: 1em;
  color: black;
`
const getFailureType = (errorString: string) => {
  const failureType = ''
  switch (true) {
    case errorString.includes('swap'):
      return failureType.concat('Swap')
    case errorString.includes('withdraw'):
      return failureType.concat('Withdraw')
    case errorString.includes('deposit'):
      return failureType.concat('Deposit')
    case errorString.includes('create pool'):
      return failureType.concat('Create Pool')
    default:
      failureType.concat('Error')
      break
  }
  return failureType
}

const Failure = ({
  message,
  info,
  error,
  className,
}: ToastProps): JSX.Element => {
  if (info && message.includes(TRANSACTION.CANCELLED)) {
    const cancelledAction = getFailureType(error.toString())
    return (
      <div className={className}>
        <ActionInfo message={cancelledAction} info={info} />
        <Rejection>
          <RejectionMessage message='Cancel' />
        </Rejection>
        <Reassurance>{ASSURANCE.FUNDS_SAFE}</Reassurance>
      </div>
    )
  }

  if (info && error) {
    return (
      <div className={className}>
        <ActionInfo message={getFailureType(error.toString())} info={info} />
        <Rejection>
          <RejectionMessage message='Error' />
        </Rejection>
        <ErrorMessage>{message}</ErrorMessage>
        <TroubleshootingLink />
      </div>
    )
  }
  return (
    <div className={className}>
      <Rejection>
        <RejectionMessage message='Error' />
      </Rejection>
      <ErrorMessage>{message}</ErrorMessage>
      <TroubleshootingLink />
    </div>
  )
}

export default styled(Failure).attrs({})`
  background: #dce0e6;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Lato', sans-serif;
`
