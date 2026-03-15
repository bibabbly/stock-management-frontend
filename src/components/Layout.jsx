import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  MdDashboard, MdInventory, MdPointOfSale, MdPeople,
  MdSwapVert, MdMenu, MdLogout, MdSettings,
  MdAssessment, MdShoppingCart, MdGroup, MdAdminPanelSettings,
  MdLock, MdClose
} from 'react-icons/md'

function Layout({ children }) {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangePassword = async () => {
    setPwError('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters')
      return
    }
    try {
      const api = (await import('../api/api')).default
      await api.put(`/users/${user.userId}/change-password`, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      })
      setPwSuccess(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => { setShowChangePassword(false); setPwSuccess(false) }, 2000)
    } catch (err) {
      setPwError('Current password is incorrect')
    }
  }

  const allNavItems = [
    { path: '/', icon: <MdDashboard size={20} />, label: 'Dashboard', page: 'DASHBOARD' },
    { path: '/products', icon: <MdInventory size={20} />, label: 'Products', page: 'PRODUCTS' },
    { path: '/sales', icon: <MdPointOfSale size={20} />, label: 'Sales', page: 'SALES' },
    { path: '/suppliers', icon: <MdPeople size={20} />, label: 'Suppliers', page: 'SUPPLIERS' },
    { path: '/stock-movements', icon: <MdSwapVert size={20} />, label: 'Stock Movements', page: 'STOCK_MOVEMENTS' },
    { path: '/settings', icon: <MdSettings size={20} />, label: 'Settings', page: 'SETTINGS' },
    { path: '/sales-report', icon: <MdAssessment size={20} />, label: 'Sales Report', page: 'SALES_REPORT' },
    { path: '/purchase-report', icon: <MdShoppingCart size={20} />, label: 'Purchase Report', page: 'PURCHASE_REPORT' },
    { path: '/users', icon: <MdGroup size={20} />, label: 'Users', page: 'USERS' },
    { path: '/roles', icon: <MdAdminPanelSettings size={20} />, label: 'Roles', page: 'ROLES' },
  ]

  const navItems = allNavItems.filter(item => hasPermission(item.page))

  return (
    <div className="flex h-screen" style={{ background: '#f1f5f9' }}>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-60' : 'w-16'} flex flex-col transition-all duration-300 flex-shrink-0`}
        style={{ background: '#0f172a' }}>

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
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm ${isActive ? 'text-white font-medium' : 'hover:text-white'}`
              }
              style={({ isActive }) => ({
                background: isActive ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
              })}>
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info at bottom */}
        <div className="p-3 border-t" style={{ borderColor: '#1e293b' }}>
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg" style={{ background: '#1e293b' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user?.name || 'User'}</p>
                <p className="text-xs truncate" style={{ color: '#64748b' }}>{user?.email || ''}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm transition-all"
            style={{ color: '#94a3b8' }}
            onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
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
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <MdMenu size={22} />
          </button>

          {/* Top right - Avatar with dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 rounded-xl transition-all"
              style={{ background: dropdownOpen ? '#f1f5f9' : 'transparent' }}>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{user?.name || 'User'}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{user?.shopName || 'BizTrack'}</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </div>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-14 w-56 rounded-2xl shadow-xl z-50 overflow-hidden"
                style={{ background: 'white', border: '1px solid #f1f5f9' }}>

                {/* User info */}
                <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{user?.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: '#fef3c7', color: '#d97706' }}>
                    {user?.role}
                  </span>
                </div>

                {/* Change Password */}
                <button
                  onClick={() => { setDropdownOpen(false); setShowChangePassword(true) }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-all"
                  style={{ color: '#64748b' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <MdLock size={18} style={{ color: '#3b82f6' }} />
                  Change Password
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm transition-all"
                  style={{ color: '#ef4444', borderTop: '1px solid #f1f5f9' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <MdLogout size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6" onClick={() => setDropdownOpen(false)}>
          {children}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>Change Password</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Update your account password</p>
              </div>
              <button onClick={() => { setShowChangePassword(false); setPwError('') }}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {pwSuccess && (
                <div className="p-3 rounded-xl text-sm"
                  style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                  ✅ Password changed successfully!
                </div>
              )}
              {pwError && (
                <div className="p-3 rounded-xl text-sm"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444' }}>
                  ⚠️ {pwError}
                </div>
              )}
              {['currentPassword', 'newPassword', 'confirmPassword'].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                    {key === 'currentPassword' ? 'Current Password'
                      : key === 'newPassword' ? 'New Password'
                      : 'Confirm New Password'}
                  </label>
                  <input type="password" value={pwForm[key]}
                    onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                </div>
              ))}
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleChangePassword}
                className="flex-1 text-white py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                Update Password
              </button>
              <button onClick={() => { setShowChangePassword(false); setPwError('') }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout