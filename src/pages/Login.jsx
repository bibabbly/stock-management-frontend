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
    <div className="min-h-screen flex" style={{ background: '#0f172a' }}>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', filter: 'blur(60px)', transform: 'translate(-30%, -30%)' }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-5"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', filter: 'blur(60px)', transform: 'translate(30%, 30%)' }} />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            B
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">BizTrack</h1>
            <p className="text-xs" style={{ color: '#475569' }}>by INNOTEWO</p>
          </div>
        </div>

        {/* Main text */}
        <div className="relative z-10">
          <h2 className="text-5xl font-bold leading-tight mb-6 text-white">
            Run your<br />
            business<br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>smarter.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: '#64748b' }}>
            Track products, sales, and profits in real-time. Built for Rwandan businesses.
          </p>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              { icon: '📦', text: 'Real-time inventory tracking' },
              { icon: '💰', text: 'Instant profit calculations' },
              { icon: '🖨️', text: 'Professional receipt printing' },
              { icon: '📊', text: 'Sales & purchase reports' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: '#1e293b' }}>
                  {item.icon}
                </div>
                <span className="text-sm" style={{ color: '#94a3b8' }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: '#334155' }}>
            🇷🇼 INNOTEWO INC LTD — Kigali, Rwanda
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8"
        style={{ background: '#0f172a', borderLeft: '1px solid #1e293b' }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              B
            </div>
            <div>
              <h1 className="font-bold text-white">BizTrack</h1>
              <p className="text-xs" style={{ color: '#475569' }}>by INNOTEWO</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p style={{ color: '#64748b' }}>Sign in to your BizTrack account</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
              style={{ background: '#2d1515', border: '1px solid #7f1d1d', color: '#fca5a5' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  background: '#1e293b',
                  border: '2px solid #334155',
                  color: 'white',
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#334155'}
                placeholder="admin@shop.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm focus:outline-none transition-all"
                  style={{
                    background: '#1e293b',
                    border: '2px solid #334155',
                    color: 'white',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#334155'}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                  style={{ color: '#475569' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all mt-2 disabled:opacity-60"
              style={{
                background: loading ? '#1e40af' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                boxShadow: '0 4px 20px rgba(59,130,246,0.3)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: '#475569' }}>
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/register-shop')}
              className="font-semibold cursor-pointer"
              style={{ color: '#3b82f6' }}
            >
              Register your shop
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login