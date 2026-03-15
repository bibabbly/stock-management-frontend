import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdInventory, MdPointOfSale, MdPeople,
  MdSwapVert, MdMenu, MdLogout, MdSettings,
  MdAssessment, MdShoppingCart, MdClose
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
    <div className="flex h-screen" style={{ background: '#f1f5f9' }}>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-60' : 'w-16'} flex flex-col transition-all duration-300 flex-shrink-0`}
        style={{ background: '#0f172a' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: '#1e293b' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <span className="text-white text-sm font-bold">B</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-white text-base leading-tight">BizTrack</h1>
              <p className="text-xs" style={{ color: '#64748b' }}>by INNOTEWO</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${
                  isActive
                    ? 'text-white font-medium'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
              })}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t" style={{ borderColor: '#1e293b' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ background: '#1e293b' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-xs truncate" style={{ color: '#64748b' }}>{user?.email || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <MdLogout size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <div className="bg-white px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MdMenu size={22} />
          </button>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Admin'}</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>{user?.shopName || 'BizTrack'}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              {(user?.name || 'A').charAt(0).toUpperCase()}
            </div>
          </div>
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