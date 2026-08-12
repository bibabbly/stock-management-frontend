import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import {
  MdStore, MdEdit, MdSave, MdClose, MdAdd, MdDelete, MdLocationOn
} from 'react-icons/md'

function Settings() {
  const { shopId } = useAuth()
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
    tinNumber: '', receiptFooter: ''
  })

  // Stock locations state
  const [locations, setLocations] = useState([])
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [editLocation, setEditLocation] = useState(null)
  const [locationForm, setLocationForm] = useState({ name: '', isMain: false })
  const [locationError, setLocationError] = useState('')
  const [locationSubmitting, setLocationSubmitting] = useState(false)

  const fetchShop = () => {
    api.get(`/shops/${shopId}`)
      .then(res => {
        setShop(res.data)
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          address: res.data.address || '',
          tinNumber: res.data.tinNumber || '',
          receiptFooter: res.data.receiptFooter || ''
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  const fetchLocations = () => {
    api.get(`/stock-locations/shop/${shopId}`)
      .then(res => setLocations(res.data || []))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchShop()
    fetchLocations()
  }, [])

  const handleSave = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await api.put(`/shops/${shopId}`, form)
      setEditing(false)
      fetchShop()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveLocation = async () => {
    if (locationSubmitting) return
    if (!locationForm.name.trim()) {
      setLocationError('Location name is required')
      return
    }
    setLocationSubmitting(true)
    setLocationError('')
    try {
      if (editLocation) {
        await api.put(`/stock-locations/${editLocation.id}`, locationForm)
      } else {
        await api.post(`/stock-locations/shop/${shopId}`, locationForm)
      }
      setShowLocationModal(false)
      setEditLocation(null)
      setLocationForm({ name: '', isMain: false })
      fetchLocations()
    } catch (err) {
      setLocationError(err.response?.data?.message || 'Failed to save location')
    } finally {
      setLocationSubmitting(false)
    }
  }

  const handleDeleteLocation = async (id) => {
    try {
      await api.delete(`/stock-locations/${id}`)
      fetchLocations()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete location')
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p style={{ color: '#94a3b8' }}>Loading settings...</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Settings</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Manage your shop information and preferences</p>
        </div>
        {!editing ? (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <MdEdit size={18} />
            <span className="hidden sm:inline">Edit Shop</span>
            <span className="sm:hidden">Edit</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={submitting}
              className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #34d399)',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}>
              <MdSave size={18} />
              <span className="hidden sm:inline">{submitting ? 'Saving...' : 'Save'}</span>
            </button>
            <button onClick={() => { setEditing(false); fetchShop() }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#f1f5f9', color: '#64748b' }}>
              <MdClose size={18} />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Shop Info Card */}
      <div className="bg-white rounded-xl p-5 mb-5"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            {shop?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>{shop?.name}</h2>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Shop Information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Shop Name', key: 'name', placeholder: 'Your shop name' },
            { label: 'Email', key: 'email', placeholder: 'shop@email.com' },
            { label: 'Phone', key: 'phone', placeholder: '+250 788 000 000' },
            { label: 'Address', key: 'address', placeholder: 'Kigali, Rwanda' },
            { label: 'TIN Number', key: 'tinNumber', placeholder: 'Tax ID number' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                {field.label}
              </label>
              {editing ? (
                <input type="text" value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              ) : (
                <p className="text-sm px-3 py-2.5 rounded-xl"
                  style={{ background: '#f8fafc', color: form[field.key] ? '#0f172a' : '#94a3b8' }}>
                  {form[field.key] || `No ${field.label.toLowerCase()} set`}
                </p>
              )}
            </div>
          ))}

          {/* Receipt Footer — full width */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
              Receipt Footer Message
            </label>
            {editing ? (
              <textarea value={form.receiptFooter}
                onChange={e => setForm({ ...form, receiptFooter: e.target.value })}
                placeholder="e.g. Thank you for shopping with us!"
                rows={2}
                className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none resize-none"
                style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
            ) : (
              <p className="text-sm px-3 py-2.5 rounded-xl"
                style={{ background: '#f8fafc', color: form.receiptFooter ? '#0f172a' : '#94a3b8' }}>
                {form.receiptFooter || 'No receipt footer set'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STOCK LOCATIONS SECTION */}
      <div className="bg-white rounded-xl p-5"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Stock Locations</h2>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Manage your stock locations (max 3) — Main shop, Warehouse, etc.
            </p>
          </div>
          {locations.length < 3 && (
            <button onClick={() => {
              setShowLocationModal(true)
              setEditLocation(null)
              setLocationForm({ name: '', isMain: false })
              setLocationError('')
            }}
              className="flex items-center gap-1.5 text-white px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              <MdAdd size={16} /> Add Location
            </button>
          )}
        </div>

        <div className="space-y-2">
          {locations.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: '#94a3b8' }}>
              No locations found
            </p>
          ) : (
            locations.map(loc => (
              <div key={loc.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: loc.isMain ? '#f0fdf4' : '#eff6ff' }}>
                    <MdLocationOn size={18} style={{ color: loc.isMain ? '#16a34a' : '#3b82f6' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{loc.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {loc.isMain ? '✅ Main — selling allowed' : '🏭 Storage / Warehouse'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setEditLocation(loc)
                    setLocationForm({ name: loc.name, isMain: loc.isMain })
                    setLocationError('')
                    setShowLocationModal(true)
                  }}
                    className="p-1.5 rounded-lg" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <MdEdit size={14} />
                  </button>
                  {!loc.isMain && (
                    <button onClick={() => handleDeleteLocation(loc.id)}
                      className="p-1.5 rounded-lg" style={{ background: '#fef2f2', color: '#ef4444' }}>
                      <MdDelete size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {locations.length >= 3 && (
          <p className="text-xs text-center mt-3" style={{ color: '#94a3b8' }}>
            Maximum of 3 locations reached
          </p>
        )}
      </div>

      {/* LOCATION MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>
                  {editLocation ? 'Edit Location' : 'Add Stock Location'}
                </h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {editLocation ? 'Update location details' : 'Add a new stock location'}
                </p>
              </div>
              <button onClick={() => setShowLocationModal(false)}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {locationError && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">
                  {locationError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Location Name
                </label>
                <input type="text" value={locationForm.name}
                  onChange={e => setLocationForm({ ...locationForm, name: e.target.value })}
                  placeholder="e.g. Warehouse, Main Shop, Branch 2"
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
                style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                onClick={() => setLocationForm({ ...locationForm, isMain: !locationForm.isMain })}>
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: locationForm.isMain ? '#3b82f6' : 'white',
                    border: locationForm.isMain ? 'none' : '2px solid #e2e8f0'
                  }}>
                  {locationForm.isMain && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                    Set as Main Location
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    Cashiers can sell from this location
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSaveLocation} disabled={locationSubmitting}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{
                  background: locationSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  cursor: locationSubmitting ? 'not-allowed' : 'pointer'
                }}>
                {locationSubmitting ? 'Saving...' : editLocation ? 'Update Location' : 'Add Location'}
              </button>
              <button onClick={() => setShowLocationModal(false)}
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

export default Settings