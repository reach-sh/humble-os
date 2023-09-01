import { Navigate, Route, RouteProps } from 'react-router-dom'
import { getPersistedUserAccount } from 'helpers/getReach'
import { GlobalUser } from 'state/reducers/user'

const DEFAULT_PATH = '/swap'

export type ProtectedRouteProps = {
  redirectPath?: string
} & RouteProps

export default function ProtectedRoute({
  redirectPath,
  ...routeProps
}: ProtectedRouteProps) {
  const { reachAccount: accountFromState } = GlobalUser.getState()
  const cachedAccount = getPersistedUserAccount()

  if (accountFromState || cachedAccount?.addr) {
    return <Route {...routeProps} />
  }

  return (
    <Route
      path='*'
      element={<Navigate to={redirectPath || DEFAULT_PATH} replace />}
    />
  )
}
