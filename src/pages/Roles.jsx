import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdDelete, MdClose, MdAdminPanelSettings } from 'react-icons/md'

const ALL_PAGES = [
  { key: 'DASHBOARD', label: '📊 Dashboard' },
  { key: 'PRODUCTS', label: '📦 Products' },
  { key: 'SALES', label: '🛒 Sales' },
  { key: 'SUPPLIERS', label: '🚚 Suppliers' },
  { key: 'STOCK_MOVEMENTS', label: '↕️ Stock Movements' },
  { key: 'SETTINGS', label: '⚙️ Settings' },
  { key: 'SALES_REPORT', label: '📈 Sales Report' },
  { key: 'PURCHASE_REPORT', label: '🛍️ Purchase Report' },
  { key: 'USERS', label: '👥 Users' },
  { key: 'ROLES', label: '🔐 Roles' },
]

function Roles() {
  const { shopId } = useAuth()
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [form, setForm] = useState({ name: '', permissions: [] })

  const fetchRoles = () => {
    api.get(`/roles/shop/${shopId}`)
      .then(res => setRoles(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRoles() }, [])

  const openAdd = () => {
    setEditRole(null)
    setForm({ name: '', permissions: [] })
    setShowModal(true)
  }

  const handleEdit = (role) => {
    setEditRole(role)
    setForm({ name: role.name, permissions: role.permissions || [] })
    setShowModal(true)
  }

  const togglePermission = (key) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }))
  }

  const selectAll = () => setForm(prev => ({ ...prev, permissions: ALL_PAGES.map(p => p.key) }))
  const clearAll = () => setForm(prev => ({ ...prev, permissions: [] }))

  const handleSubmit = async () => {
    const payload = { name: form.name, permissions: form.permissions, shop: { id: shopId } }
    try {
      if (editRole) {
        await api.put(`/roles/${editRole.id}`, payload)
      } else {
        await api.post('/roles', payload)
      }
      setShowModal(false)
      fetchRoles()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this role?')) {
      await api.delete(`/roles/${id}`)
      fetchRoles()
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#0f172a' }}>Roles</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Manage roles and page permissions</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <MdAdd size={18} />
          <span className="hidden sm:inline">Add Role</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Roles Grid — 1 col mobile, 2 col tablet, 3 col desktop */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
      ) : roles.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center"
          style={{ border: '1px solid #f1f5f9' }}>
          <MdAdminPanelSettings size={48} style={{ color: '#e2e8f0', margin: '0 auto 12px' }} />
          <p style={{ color: '#94a3b8' }}>No roles yet. Create your first role!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-xl p-5"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                    {role.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#0f172a' }}>{role.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {role.permissions?.length || 0} permissions
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(role)}
                    className="p-1.5 rounded-lg"
                    style={{ color: '#3b82f6', background: '#eff6ff' }}>
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(role.id)}
                    className="p-1.5 rounded-lg"
                    style={{ color: '#ef4444', background: '#fef2f2' }}>
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>

              {/* Permissions badges */}
              <div className="flex flex-wrap gap-1.5">
                {ALL_PAGES.map(page => (
                  <span key={page.key}
                    className="px-2 py-1 rounded-lg text-xs font-medium"
                    style={{
                      background: role.permissions?.includes(page.key) ? '#eff6ff' : '#f8fafc',
                      color: role.permissions?.includes(page.key) ? '#3b82f6' : '#cbd5e1',
                      border: `1px solid ${role.permissions?.includes(page.key) ? '#bfdbfe' : '#f1f5f9'}`
                    }}>
                    {page.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal — slides up from bottom on mobile, centered on desktop */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col"
            style={{ borderRadius: '20px 20px 0 0', maxHeight: '92vh' }}>

            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>
                  {editRole ? 'Edit Role' : 'Create New Role'}
                </h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Set role name and page permissions</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* Role Name */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Role Name
                </label>
                <input type="text" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Cashier, Manager"
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              </div>

              {/* Permissions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold" style={{ color: '#64748b' }}>
                    Page Permissions
                  </label>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-xs font-semibold" style={{ color: '#3b82f6' }}>
                      Select All
                    </button>
                    <span style={{ color: '#e2e8f0' }}>|</span>
                    <button onClick={clearAll} className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                      Clear
                    </button>
                  </div>
                </div>

                {/* Permission toggles — larger tap targets on mobile */}
                <div className="space-y-2">
                  {ALL_PAGES.map(page => (
                    <div key={page.key}
                      onClick={() => togglePermission(page.key)}
                      className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: form.permissions.includes(page.key) ? '#eff6ff' : '#f8fafc',
                        border: `2px solid ${form.permissions.includes(page.key) ? '#bfdbfe' : '#f1f5f9'}`
                      }}>
                      <span className="text-sm font-medium" style={{ color: '#0f172a' }}>
                        {page.label}
                      </span>
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{
                          background: form.permissions.includes(page.key)
                            ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : '#e2e8f0'
                        }}>
                        {form.permissions.includes(page.key) && (
                          <span className="text-white text-xs font-bold">✓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer — sticky */}
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {editRole ? 'Update Role' : 'Create Role'}
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

export default Roles