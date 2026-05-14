import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/api'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data.role !== 'SUPER_ADMIN') {
        setError('Access denied. Super admin only.')
        setLoading(false)
        return
      }
      login(res.data, res.data.token)
      navigate('/admin')
    } catch (err) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '24px'
          }}>🛡️</div>
          <h1 style={{ color: '#0f172a', fontSize: '22px', fontWeight: 700, margin: 0 }}>
            Admin Portal
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: '6px 0 0' }}>
            INNOTEWO INC LTD — BizTrack
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            color: '#ef4444', padding: '12px', borderRadius: '12px',
            fontSize: '13px', marginBottom: '20px'
          }}>{error}</div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="superadmin@innotewo.com"
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
              border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a',
              boxSizing: 'border-box', outline: 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
              border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a',
              boxSizing: 'border-box', outline: 'none'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px', fontSize: '14px',
            fontWeight: 600, color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)'
          }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}

export default AdminLogin