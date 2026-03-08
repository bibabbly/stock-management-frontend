import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function RegisterShop() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', address: '', phone: '', email: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      await api.post('/shops', form)
      navigate('/register')
    } catch (err) {
      setError('Failed to create shop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-2">Stock Management</h1>
        <p className="text-gray-500 text-center mb-6">Register your shop first</p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Shop Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Shop name" />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Address</label>
          <input type="text" name="address" value={form.address} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Kigali, Rwanda" />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Phone</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="+250788000000" />
        </div>
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="shop@email.com" />
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating shop...' : 'Create Shop & Continue'}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-600 cursor-pointer hover:underline">
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}

export default RegisterShop