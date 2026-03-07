import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN'
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
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 text-center mb-2">Stock Management</h1>
        <p className="text-gray-500 text-center mb-6">Create your account</p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Your name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="your@email.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Shop ID</label>
          <input
            type="number"
            name="shopId"
            onChange={(e) => setForm({ ...form, shop: { id: parseInt(e.target.value) } })}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            placeholder="Enter shop ID"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
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

export default Register