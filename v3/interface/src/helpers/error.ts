import useToast from 'hooks/useToast'
import { SwapInfo } from 'types/shared'

const handleContractError = (
  failureSection: string,
  e: any,
  info?: SwapInfo,
  toastId?: string,
) => {
  const { launchToast } = useToast()
  launchToast(
    'reject',
    {
      message: e.message,
      info,
      error: e,
    },
    toastId,
    { autoClose: 30000 },
  )

  captureException(e.message, failureSection)
}

export const captureException = (error: any, location: string) => {
  // eslint-disable-next-line no-console
  console.error({
    location,
    error,
  })
}

export default handleContractError
