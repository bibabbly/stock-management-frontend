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
  name: response.data.name,
  email: response.data.email,
  role: response.data.role,
  shopName: response.data.shopName,
  userId: response.data.userId,
  shopId: response.data.shopId,
  permissions: response.data.permissions || []
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

      {/* Left Panel - Dark like sidebar */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0f172a' }}>

        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', filter: 'blur(80px)', transform: 'translate(-40%, -40%)' }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', filter: 'blur(80px)', transform: 'translate(40%, 40%)' }} />
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
          <h2 className="text-4xl font-bold leading-tight mb-5 text-white">
            Run your<br />business<br />
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>smarter.</span>
          </h2>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: '#64748b' }}>
            Track products, sales, and profits in real-time. Built for Rwandan businesses.
          </p>

          {/* Features */}
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
          <p className="text-xs" style={{ color: '#334155' }}>🇷🇼 INNOTEWO INC LTD — Kigali, Rwanda</p>
        </div>
      </div>

      {/* Right Panel - White like dashboard content */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8"
        style={{ background: '#f1f5f9' }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
              B
            </div>
            <div>
              <h1 className="font-bold text-gray-800">BizTrack</h1>
              <p className="text-xs text-gray-400">by INNOTEWO</p>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl p-8"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>Welcome back </h2>
              <p className="text-sm" style={{ color: '#94a3b8' }}>Sign in to your BizTrack account</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-5 text-sm"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444' }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                  placeholder="admin@shop.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                    style={{ color: '#94a3b8' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  boxShadow: '0 4px 15px rgba(59,130,246,0.35)'
                }}>
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          {/** Registration disabled - contact INNOTEWO INC LTD
           * 
           *    <p className="text-center text-sm mt-6" style={{ color: '#94a3b8' }}>
              Don't have an account?{' '}
              <span onClick={() => navigate('/register-shop')}
                className="font-semibold cursor-pointer" style={{ color: '#3b82f6' }}>
                Register your shop
              </span>
            </p>
           */}
         
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login