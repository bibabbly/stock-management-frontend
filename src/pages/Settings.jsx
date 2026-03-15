import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import {
  MdStorefront, MdPhone, MdEmail, MdLocationOn,
  MdReceipt, MdLanguage, MdBadge, MdSave, MdPhotoCamera
} from 'react-icons/md'

function Settings() {
  const { shopId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '', address: '', phone: '',
    email: '', tinNumber: '', website: '',
    receiptFooter: '', logo: ''
  })

  useEffect(() => {
    api.get(`/shops/${shopId}`)
      .then(res => {
        const s = res.data
        setForm({
          name: s.name || '', address: s.address || '',
          phone: s.phone || '', email: s.email || '',
          tinNumber: s.tinNumber || '', website: s.website || '',
          receiptFooter: s.receiptFooter || '', logo: s.logo || ''
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [shopId])

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setForm({ ...form, logo: reader.result })
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      await api.put(`/shops/${shopId}`, form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
      </div>
    </Layout>
  )

  const fields = [
    { label: 'Shop Name', key: 'name', icon: <MdStorefront size={16} />, placeholder: 'My Shop' },
    { label: 'Phone', key: 'phone', icon: <MdPhone size={16} />, placeholder: '+250788000000' },
    { label: 'Email', key: 'email', icon: <MdEmail size={16} />, placeholder: 'shop@email.com' },
    { label: 'Address', key: 'address', icon: <MdLocationOn size={16} />, placeholder: 'Kigali, Rwanda' },
    { label: 'TIN Number', key: 'tinNumber', icon: <MdBadge size={16} />, placeholder: '123456789' },
    { label: 'Website', key: 'website', icon: <MdLanguage size={16} />, placeholder: 'www.myshop.rw' },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>Shop Settings</h1>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Manage your shop profile and receipt information</p>
      </div>

      <div className="max-w-2xl space-y-4">

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl text-sm font-medium"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
            <span className="text-lg">✅</span>
            Shop settings saved successfully!
          </div>
        )}

        {/* Logo Card */}
        <div className="bg-white rounded-xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
            Shop Logo
          </h2>
          <div className="flex items-center gap-6">
            {/* Logo Preview */}
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}>
              {form.logo ? (
                <img src={form.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center">
                  <MdStorefront size={28} style={{ color: '#cbd5e1', margin: '0 auto' }} />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                style={{ background: '#f1f5f9', color: '#64748b', border: '2px solid #e2e8f0' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                <MdPhotoCamera size={18} />
                {form.logo ? 'Change Logo' : 'Upload Logo'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>PNG, JPG up to 2MB</p>
            </div>

            {/* Remove logo */}
            {form.logo && (
              <button
                onClick={() => setForm({ ...form, logo: '' })}
                className="text-xs font-semibold"
                style={{ color: '#ef4444' }}>
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Shop Info Card */}
        <div className="bg-white rounded-xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#94a3b8' }}>
            Shop Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ label, key, icon, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  {label}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
                    {icon}
                  </div>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt Footer Card */}
        <div className="bg-white rounded-xl p-6"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: '#94a3b8' }}>
            Receipt Footer
          </h2>
          <p className="text-xs mb-4" style={{ color: '#cbd5e1' }}>
            This message appears at the bottom of every printed receipt
          </p>
          <div className="relative">
            <MdReceipt size={16} className="absolute left-3 top-3" style={{ color: '#94a3b8' }} />
            <textarea
              value={form.receiptFooter}
              onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
              rows={3}
              placeholder="e.g. Thank you for your business! Come back soon."
              className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none resize-none"
              style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#f1f5f9'}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 text-white px-8 py-3 rounded-xl font-semibold text-sm disabled:opacity-60"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
          }}>
          <MdSave size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </Layout>
  )
}

export default Settings