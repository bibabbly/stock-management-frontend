import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

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
          name: s.name || '',
          address: s.address || '',
          phone: s.phone || '',
          email: s.email || '',
          tinNumber: s.tinNumber || '',
          website: s.website || '',
          receiptFooter: s.receiptFooter || '',
          logo: s.logo || ''
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [shopId])

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm({ ...form, logo: reader.result })
    }
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

  if (loading) return <Layout><p className="text-gray-500">Loading...</p></Layout>

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Shop Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            Shop settings saved successfully!
          </div>
        )}

        {/* Logo Upload */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">Shop Logo</label>
          {form.logo && (
            <img
              src={form.logo}
              alt="Shop Logo"
              className="w-24 h-24 object-contain border rounded mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="text-sm text-gray-600"
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Shop Name', key: 'name' },
            { label: 'Phone', key: 'phone' },
            { label: 'Email', key: 'email' },
            { label: 'Address', key: 'address' },
            { label: 'TIN Number', key: 'tinNumber' },
            { label: 'Website', key: 'website' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Receipt Footer */}
        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">
            Receipt Footer Message
          </label>
          <textarea
            value={form.receiptFooter}
            onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            rows={2}
            placeholder="e.g. Thank you for your business!"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </Layout>
  )
}

export default Settings