import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
