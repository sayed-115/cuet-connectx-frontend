import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()
  const hasToken = Boolean(localStorage.getItem('token'))

  if (loading && hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
      </div>
    )
  }

  if (!hasToken || !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children || <Outlet />
}

export default ProtectedRoute
