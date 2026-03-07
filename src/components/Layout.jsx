import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard,
  MdInventory,
  MdPointOfSale,
  MdPeople,
  MdSwapVert,
  MdMenu,
  MdLogout,
  MdSettings,
  MdAssessment,
  MdShoppingCart
} from 'react-icons/md'

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: <MdDashboard size={20} />, label: 'Dashboard' },
    { path: '/products', icon: <MdInventory size={20} />, label: 'Products' },
    { path: '/sales', icon: <MdPointOfSale size={20} />, label: 'Sales' },
    { path: '/suppliers', icon: <MdPeople size={20} />, label: 'Suppliers' },
    { path: '/stock-movements', icon: <MdSwapVert size={20} />, label: 'Stock Movements' },
    { path: '/settings', icon: <MdSettings size={20} />, label: 'Settings' },
    { path: '/sales-report', icon: <MdAssessment size={20} />, label: 'Sales Report' },
    { path: '/purchase-report', icon: <MdShoppingCart size={20} />, label: 'Purchase Report' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-blue-700 text-white flex flex-col transition-all duration-300`}>
        
        {/* Logo */}
        <div className="p-4 border-b border-blue-600">
          {sidebarOpen ? (
            <h1 className="font-bold text-lg">📦 StockManager</h1>
          ) : (
            <h1 className="font-bold text-lg">📦</h1>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-900' : 'hover:bg-blue-600'
                }`
              }
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-blue-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-600 w-full text-sm"
          >
            <MdLogout size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white shadow px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MdMenu size={24} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-600">
            Welcome, <strong>{user?.name || 'Admin'}</strong>
          </span>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>

      </div>
    </div>
  )
}

export default Layout