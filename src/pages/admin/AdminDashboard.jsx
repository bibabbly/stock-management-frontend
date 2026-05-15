import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/api'
import { MdAdd, MdClose, MdLogout } from 'react-icons/md'

function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '', ownerEmail: ''
  })

  const fetchShops = () => {
    api.get('/shops').then(res => setShops(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchShops() }, [])

  const handleCreate = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await api.post('/shops', { ...form, active: true })
      setShowModal(false)
      setForm({ name: '', email: '', phone: '', address: '', ownerEmail: '' })
      fetchShops()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id) => {
    await api.put(`/shops/${id}/toggle`)
    fetchShops()
  }

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const handleSendReports = async () => {
    if (sending) return
    setSending(true)
    setSendStatus('')
    try {
      await api.post('/reports/send-daily')
      setSendStatus('✅ Reports sent to all shops!')
    } catch (err) {
      setSendStatus('❌ Failed to send reports')
    } finally {
      setSending(false)
      setTimeout(() => setSendStatus(''), 5000)
    }
  }

  const handleSendShopReport = async (shopId) => {
    try {
      await api.post(`/reports/send-daily/${shopId}`)
      setSendStatus('✅ Report sent!')
      setTimeout(() => setSendStatus(''), 3000)
    } catch (err) {
      setSendStatus('❌ Failed to send report')
      setTimeout(() => setSendStatus(''), 3000)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
          }}>🛡️</div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, margin: 0, fontSize: '15px' }}>BizTrack Admin</p>
            <p style={{ color: '#64748b', margin: 0, fontSize: '11px' }}>INNOTEWO INC LTD</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
        }}>
          <MdLogout size={16} /> Logout
        </button>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Shops', value: shops.length, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Active Shops', value: shops.filter(s => s.active).length, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Inactive Shops', value: shops.filter(s => !s.active).length, color: '#ef4444', bg: '#fef2f2' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '16px', padding: '20px',
              border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
              <p style={{ color: stat.color, fontSize: '32px', fontWeight: 700, margin: 0 }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Shops list header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ color: '#0f172a', fontSize: '18px', fontWeight: 700, margin: 0 }}>All Shops</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {sendStatus && (
              <span style={{
                fontSize: '13px',
                color: sendStatus.includes('✅') ? '#16a34a' : '#ef4444'
              }}>
                {sendStatus}
              </span>
            )}
            <button onClick={handleSendReports} disabled={sending} style={{
              display: 'flex', alignItems: 'center', gap: '6px', color: 'white',
              background: sending ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #34d399)',
              border: 'none', padding: '10px 20px', borderRadius: '12px',
              cursor: sending ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600
            }}>
              📧 {sending ? 'Sending...' : 'Send Reports'}
            </button>
            <button onClick={() => setShowModal(true)} style={{
              display: 'flex', alignItems: 'center', gap: '6px', color: 'white',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              border: 'none', padding: '10px 20px', borderRadius: '12px',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600
            }}>
              <MdAdd size={18} /> New Shop
            </button>
          </div>
        </div>

        {/* Shops table */}
        <div style={{
          background: 'white', borderRadius: '16px', overflow: 'hidden',
          border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                {['Shop', 'Email', 'Phone', 'Owner Email', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left', fontSize: '11px',
                    fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  Loading...
                </td></tr>
              ) : shops.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No shops yet
                </td></tr>
              ) : shops.map((shop, i) => (
                <tr key={shop.id} style={{
                  borderBottom: i < shops.length - 1 ? '1px solid #f8fafc' : 'none'
                }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: '14px'
                      }}>{shop.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{shop.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{shop.email || '—'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{shop.phone || '—'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{shop.ownerEmail || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                      background: shop.active ? '#f0fdf4' : '#fef2f2',
                      color: shop.active ? '#16a34a' : '#ef4444'
                    }}>{shop.active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleSendShopReport(shop.id)} style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '12px',
                        fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: '#eff6ff', color: '#3b82f6'
                      }} title="Send Report">
                        📧
                      </button>
                      <button onClick={() => handleToggle(shop.id)} style={{
                        padding: '6px 16px', borderRadius: '8px', fontSize: '12px',
                        fontWeight: 600, border: 'none', cursor: 'pointer',
                        background: shop.active ? '#fef2f2' : '#f0fdf4',
                        color: shop.active ? '#ef4444' : '#16a34a'
                      }}>
                        {shop.active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Shop Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', zIndex: 50
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', width: '100%',
            maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid #f1f5f9'
            }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', fontWeight: 700 }}>Create New Shop</h3>
                <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>Fill in the shop details</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{
                background: '#f8fafc', border: 'none', borderRadius: '10px',
                padding: '8px', cursor: 'pointer', color: '#94a3b8'
              }}><MdClose size={20} /></button>
            </div>

            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { label: 'Shop Name', key: 'name', col: 2 },
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Address', key: 'address', col: 2 },
                { label: 'Owner Email', key: 'ownerEmail', col: 2 },
              ].map(({ label, key, col }) => (
                <div key={key} style={{ gridColumn: col === 2 ? 'span 2' : 'span 1' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    {label}
                  </label>
                  <input
                    type="text" value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '10px', fontSize: '13px',
                      border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a',
                      boxSizing: 'border-box', outline: 'none'
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{
              display: 'flex', gap: '12px', padding: '16px 24px',
              borderTop: '1px solid #f1f5f9'
            }}>
              <button onClick={handleCreate} disabled={submitting} style={{
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none',
                color: 'white', fontWeight: 600, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)'
              }}>
                {submitting ? 'Creating...' : 'Create Shop'}
              </button>
              <button onClick={() => setShowModal(false)} style={{
                padding: '12px 20px', borderRadius: '12px', border: 'none',
                background: '#f1f5f9', color: '#64748b', fontWeight: 600, cursor: 'pointer'
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard