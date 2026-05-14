import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/admin/login" />
  if (user.role !== 'SUPER_ADMIN') return <Navigate to="/login" />
  return children
}

export default AdminRoute