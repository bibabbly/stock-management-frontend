import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdDelete, MdClose, MdPeople, MdPhone, MdEmail, MdLocationOn } from 'react-icons/md'

function Suppliers() {
  const { shopId } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })

  const fetchSuppliers = () => {
    api.get(`/suppliers/shop/${shopId}`)
      .then(res => setSuppliers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSuppliers() }, [])

  const openAdd = () => {
    setEditSupplier(null)
    setForm({ name: '', phone: '', email: '', address: '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    const payload = { ...form, shop: { id: shopId } }
    try {
      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier.id}`, payload)
      } else {
        await api.post('/suppliers', payload)
      }
      setShowModal(false)
      setEditSupplier(null)
      fetchSuppliers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (supplier) => {
    setEditSupplier(supplier)
    setForm({ name: supplier.name, phone: supplier.phone, email: supplier.email, address: supplier.address })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      await api.delete(`/suppliers/${id}`)
      fetchSuppliers()
    }
  }

  const fields = [
    { label: 'Supplier Name', key: 'name', col: 2 },
    { label: 'Phone', key: 'phone' },
    { label: 'Email', key: 'email' },
    { label: 'Address', key: 'address', col: 2 },
  ]

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
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Suppliers</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{suppliers.length} suppliers registered</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          <MdAdd size={18} />
          <span className="hidden sm:inline">Add Supplier</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Supplier', 'Phone', 'Email', 'Address', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading suppliers...</p>
              </td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-16">
                <MdPeople size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No suppliers yet</p>
              </td></tr>
            ) : (
              suppliers.map((supplier, i) => (
                <tr key={supplier.id}
                  style={{ borderBottom: i < suppliers.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ background: getColor(supplier.name) }}>
                        {supplier.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold" style={{ color: '#0f172a' }}>{supplier.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5" style={{ color: '#64748b' }}>
                      <MdPhone size={14} style={{ color: '#94a3b8' }} />
                      {supplier.phone || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5" style={{ color: '#64748b' }}>
                      <MdEmail size={14} style={{ color: '#94a3b8' }} />
                      {supplier.email || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5" style={{ color: '#64748b' }}>
                      <MdLocationOn size={14} style={{ color: '#94a3b8' }} />
                      {supplier.address || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(supplier)}
                        className="p-1.5 rounded-lg" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                        <MdEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(supplier.id)}
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
            <p style={{ color: '#94a3b8' }}>Loading suppliers...</p>
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-16">
            <MdPeople size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No suppliers yet</p>
          </div>
        ) : (
          suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

              {/* Top: avatar + name + actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: getColor(supplier.name) }}>
                    {supplier.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{supplier.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(supplier)}
                    className="p-2 rounded-lg" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                    <MdEdit size={16} />
                  </button>
                  <button onClick={() => handleDelete(supplier.id)}
                    className="p-2 rounded-lg" style={{ color: '#ef4444', background: '#fef2f2' }}>
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>

              {/* Contact details */}
              <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid #f8fafc' }}>
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                    <MdPhone size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <a href={`tel:${supplier.phone}`} style={{ color: '#3b82f6' }}>{supplier.phone}</a>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                    <MdEmail size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <a href={`mailto:${supplier.email}`} style={{ color: '#3b82f6' }}>{supplier.email}</a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                    <MdLocationOn size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span>{supplier.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal — slides up from bottom on mobile */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>
                  {editSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {editSupplier ? 'Update supplier details' : 'Fill in the supplier details'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            {/* 1 col on mobile, 2 col on desktop */}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ label, key, col }) => (
                <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                    style={{ border: '2px solid #f1f5f9', color: '#0f172a', background: '#f8fafc' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {editSupplier ? 'Update Supplier' : 'Save Supplier'}
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

export default Suppliers