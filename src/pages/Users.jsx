import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdDelete, MdClose, MdGroup, MdVisibility, MdVisibilityOff } from 'react-icons/md'

function Users() {
  const { shopId } = useAuth()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', shopRoleId: '' })

  const fetchUsers = () => {
    api.get(`/users/shop/${shopId}`)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
    api.get(`/roles/shop/${shopId}`).then(res => setRoles(res.data))
  }, [])

  const openAdd = () => {
    setEditUser(null)
    setForm({ name: '', email: '', password: '', shopRoleId: '' })
    setShowModal(true)
  }

  const handleEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, password: '', shopRoleId: user.shopRole?.id || '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    const payload = {
      name: form.name, email: form.email, password: form.password,
      shop: { id: shopId }, role: 'CASHIER',
      shopRole: form.shopRoleId ? { id: parseInt(form.shopRoleId) } : null
    }
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, payload)
      } else {
        await api.post('/users', payload)
      }
      setShowModal(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      await api.delete(`/users/${id}`)
      fetchUsers()
    }
  }

  const avatarColors = [
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
  ]
  const getColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Users</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{users.length} users in your shop</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <MdAdd size={18} />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['User', 'Email', 'Role', 'Permissions', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading users...</p>
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-16">
                <MdGroup size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No users yet</p>
              </td></tr>
            ) : (
              users.map((user, i) => (
                <tr key={user.id}
                  style={{ borderBottom: i < users.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: getColor(user.name) }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold" style={{ color: '#0f172a' }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#64748b' }}>{user.email}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: user.role === 'ADMIN' ? '#fef3c7' : '#eff6ff',
                        color: user.role === 'ADMIN' ? '#d97706' : '#3b82f6'
                      }}>
                      {user.shopRole?.name || user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: '#94a3b8' }}>
                    {user.shopRole?.permissions?.length
                      ? `${user.shopRole.permissions.length} pages`
                      : user.role === 'ADMIN' ? 'Full access' : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(user)}
                        className="p-1.5 rounded-lg" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                        <MdEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded-lg" style={{ color: '#ef4444', background: '#fef2f2' }}>
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p style={{ color: '#94a3b8' }}>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <MdGroup size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No users yet</p>
          </div>
        ) : (
          users.map(user => (
            <div key={user.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: getColor(user.name) }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{user.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: user.role === 'ADMIN' ? '#fef3c7' : '#eff6ff',
                          color: user.role === 'ADMIN' ? '#d97706' : '#3b82f6'
                        }}>
                        {user.shopRole?.name || user.role}
                      </span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {user.shopRole?.permissions?.length
                          ? `${user.shopRole.permissions.length} pages`
                          : user.role === 'ADMIN' ? 'Full access' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(user)}
                    className="p-2 rounded-lg" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(user.id)}
                    className="p-2 rounded-lg" style={{ color: '#ef4444', background: '#fef2f2' }}>
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal — slides up from bottom */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>
                  {editUser ? 'Edit User' : 'Add New User'}
                </h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {editUser ? 'Update user details' : 'Create a new user account'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Full Name</label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@shop.com"
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  {editUser ? 'New Password (leave blank to keep)' : 'Password'}
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-3 py-3 pr-10 text-sm focus:outline-none"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                    {showPassword ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Assign Role</label>
                <select value={form.shopRoleId}
                  onChange={e => setForm({ ...form, shopRoleId: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">-- Select a role --</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} ({role.permissions?.length || 0} permissions)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {editUser ? 'Update User' : 'Create User'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 py-3 rounded-xl font-semibold text-sm"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Users