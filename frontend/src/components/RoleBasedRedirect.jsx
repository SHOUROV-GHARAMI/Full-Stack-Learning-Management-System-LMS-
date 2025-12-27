import { Navigate } from 'react-router-dom'
import { useAuth } from '../state/AuthProvider'
import LoadingBlock from './LoadingBlock'

const RoleBasedRedirect = () => {
  const { user, loading } = useAuth()

  if (loading) return <LoadingBlock label="Loading..." />

  if (!user) return <Navigate to="/login" replace />

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />
  } else if (user.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />
  } else if (user.role === 'student') {
    return <Navigate to="/student/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export default RoleBasedRedirect