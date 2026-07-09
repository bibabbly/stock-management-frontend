import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Suppliers from './pages/Suppliers'
import StockMovements from './pages/StockMovements'
import Settings from './pages/Settings'
import SalesReport from './pages/SalesReport'
import PurchaseReport from './pages/PurchaseReport'
import Register from './pages/Register'
import RegisterShop from './pages/RegisterShop'
import Roles from './pages/Roles'
import Users from './pages/Users'
import Debts from './pages/Debts'
import CancelledSales from './pages/CancelledSales'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoute from './components/AdminRoute'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-shop" element={<RegisterShop />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
        <Route path="/suppliers" element={<PrivateRoute><Suppliers /></PrivateRoute>} />
        <Route path="/stock-movements" element={<PrivateRoute><StockMovements /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/sales-report" element={<PrivateRoute><SalesReport /></PrivateRoute>} />
        <Route path="/purchase-report" element={<PrivateRoute><PurchaseReport /></PrivateRoute>} />
        <Route path="/roles" element={<PrivateRoute><Roles /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/debts" element={<PrivateRoute><Debts /></PrivateRoute>} />
        <Route path="/cancelled-sales" element={<PrivateRoute><CancelledSales /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  )
}

export default App