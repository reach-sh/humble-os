import { Theme, toast, TypeOptions } from 'react-toastify'
import FailureToast from 'components/Common/Toasts/Failure/FailureToast'
import SuccessToast from 'components/Common/Toasts/Success/SuccessToast'
import ProgressToast from 'components/Common/Toasts/Progress'
import NetworkToast from 'components/Common/Toasts/Network'
import { ToastProps } from 'types/shared'
import { isMobile } from 'react-device-detect'

/**
 * custom hook to keep toast uniform and prevent the duplicating message settings
 * example:
 * import useToast from 'hooks/useToast'
 * const { launchToast } = useToast()
 * () => launchToast('Toast Message')
 */

const ToastTypes = {
  network: NetworkToast,
  progress: ProgressToast,
  success: SuccessToast,
  reject: FailureToast,
}

const toastTypeTranslator = (type: string): TypeOptions => {
  switch (type) {
    case 'success':
      return 'success'
    case 'progress':
      return 'info'
    case 'network':
      return 'warning'
    case 'reject':
      return 'error'
    default:
      return 'default'
  }
}

const useToast = (theme: Theme = 'light') => {
  const defaultProps = {
    theme,
    className: isMobile
      ? 'custom-toast-position-mobile'
      : 'custom-toast-position',
    isLoading: false,
    autoClose: 4000,
    closeOnClick: false,
    icon: false,
  }
  const launchToast = (
    type: 'success' | 'progress' | 'network' | 'reject',
    props: ToastProps,
    toastId?: string,
    params?: any,
  ): string => {
    const Toast = ToastTypes[type]

    if (toastId) {
      toast.update(toastId, {
        render: <Toast {...props} />,
        type: toastTypeTranslator(type),
        ...defaultProps,
        ...params,
      })
      return toastId
    }

    return toast(<Toast {...props} />, {
      type: toastTypeTranslator(type),
      ...defaultProps,
      ...params,
    }).toString()
  }

  const removeToasts = (id?: string) => toast.dismiss(id)

  return {
    launchToast,
    removeToasts,
  }
}

export default useToast
