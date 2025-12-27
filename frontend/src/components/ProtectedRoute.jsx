import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthProvider'
import LoadingBlock from './LoadingBlock'

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingBlock label="Checking access..." />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default ProtectedRoute