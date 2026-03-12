import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await api.post('/auth/login', { email, password })
      const userData = {
        email: response.data.email,
        role: response.data.role,
        shopName: response.data.shopName,
        userId: response.data.userId,
        shopId: response.data.shopId
      }
      login(userData, response.data.token)
      navigate('/')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)' }}>

        {/* Background circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'white' }} />
          <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'white' }} />
          <div className="absolute -bottom-16 left-1/4 w-96 h-96 rounded-full opacity-10"
            style={{ background: 'white' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              📦
            </div>
            <span className="text-2xl font-bold tracking-tight">StockManager</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Manage your<br />
            <span style={{ color: '#93c5fd' }}>business</span><br />
            with ease.
          </h1>
          <p className="text-lg opacity-80 mb-12 leading-relaxed">
            Track your products, sales, and profits all in one place. Built for Rwandan businesses.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Products Tracked', value: '∞' },
              { label: 'Sales Reports', value: '📊' },
              { label: 'Receipt Printing', value: '🖨️' },
              { label: 'Real-time Profit', value: '💰' },
            ].map((item, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="text-2xl mb-1">{item.value}</div>
                <div className="text-sm opacity-70">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ background: '#f8fafc' }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: '#1d4ed8' }}>
              📦
            </div>
            <span className="text-xl font-bold text-gray-800">StockManager</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                style={{ background: 'white' }}
                placeholder="admin@shop.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-800 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ background: 'white' }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-xl font-semibold text-base transition-all disabled:opacity-60"
              style={{
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
                boxShadow: '0 4px 15px rgba(29, 78, 216, 0.4)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register-shop')}
              className="text-blue-600 font-semibold cursor-pointer hover:underline"
            >
              Register your shop
            </span>
          </p>

          <p className="text-center text-xs text-gray-400 mt-6">
            🇷🇼 Built for Rwandan businesses by INNOTEWO INC LTD
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login