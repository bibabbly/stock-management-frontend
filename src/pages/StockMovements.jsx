import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdClose, MdSwapVert, MdArrowUpward, MdArrowDownward } from 'react-icons/md'

function StockMovements() {
  const { shopId } = useAuth()
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  const [form, setForm] = useState({ productId: '', supplierId: '', quantity: 1, note: '' })

  const fetchMovements = () => {
    api.get(`/stock-movements/shop/${shopId}`)
      .then(res => setMovements(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMovements()
    api.get(`/products/shop/${shopId}`).then(res => setProducts(res.data))
    api.get(`/suppliers/shop/${shopId}`).then(res => setSuppliers(res.data))
  }, [])

  const handleRestock = async () => {
    setError('')
    try {
      await api.post('/stock-movements/restock', {
        shopId,
        productId: parseInt(form.productId),
        supplierId: parseInt(form.supplierId),
        quantity: parseInt(form.quantity),
        note: form.note
      })
      setShowModal(false)
      setForm({ productId: '', supplierId: '', quantity: 1, note: '' })
      fetchMovements()
    } catch (err) {
      setError('Failed to restock. Please check all fields.')
    }
  }

  const filtered = filter === 'ALL' ? movements : movements.filter(m => m.type === filter)
  const totalIn = movements.filter(m => m.type === 'IN').reduce((s, m) => s + m.quantity, 0)
  const totalOut = movements.filter(m => m.type === 'OUT').reduce((s, m) => s + m.quantity, 0)

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Stock Movements</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{movements.length} total movements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          <MdAdd size={18} /> Restock
        </button>
      </div>

      {/* Summary Cards — already 2 cols, works on mobile */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 flex items-center gap-3"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
            <MdArrowDownward size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Stock IN</p>
            <p className="text-xl font-bold" style={{ color: '#0f172a' }}>{totalIn.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 flex items-center gap-3"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
            <MdArrowUpward size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Stock OUT</p>
            <p className="text-xl font-bold" style={{ color: '#0f172a' }}>{totalOut.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['ALL', 'IN', 'OUT'].map(tab => (
          <button key={tab}
            onClick={() => setFilter(tab)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: filter === tab ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'white',
              color: filter === tab ? 'white' : '#64748b',
              border: filter === tab ? 'none' : '1px solid #f1f5f9',
              boxShadow: filter === tab ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.06)'
            }}>
            {tab === 'ALL' ? '📋 All' : tab === 'IN' ? '📥 In' : '📤 Out'}
          </button>
        ))}
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Date & Time', 'Product', 'Type', 'Quantity', 'Note'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading movements...</p>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-16">
                <MdSwapVert size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No movements found</p>
              </td></tr>
            ) : (
              filtered.map((movement, i) => (
                <tr key={movement.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-sm" style={{ color: '#0f172a' }}>
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(movement.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                        {movement.product?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold" style={{ color: '#0f172a' }}>{movement.product?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit"
                      style={{
                        background: movement.type === 'IN' ? '#f0fdf4' : '#fef2f2',
                        color: movement.type === 'IN' ? '#16a34a' : '#ef4444'
                      }}>
                      {movement.type === 'IN' ? <MdArrowDownward size={12} /> : <MdArrowUpward size={12} />}
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-lg" style={{ color: '#0f172a' }}>
                      {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#64748b' }}>
                    {movement.note || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p style={{ color: '#94a3b8' }}>Loading movements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <MdSwapVert size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No movements found</p>
          </div>
        ) : (
          filtered.map(movement => (
            <div key={movement.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

              {/* Top: product + type badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                    {movement.product?.name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>
                    {movement.product?.name}
                  </p>
                </div>
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: movement.type === 'IN' ? '#f0fdf4' : '#fef2f2',
                    color: movement.type === 'IN' ? '#16a34a' : '#ef4444'
                  }}>
                  {movement.type === 'IN' ? <MdArrowDownward size={12} /> : <MdArrowUpward size={12} />}
                  {movement.type}
                </span>
              </div>

              {/* Bottom: qty + date + note */}
              <div className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid #f8fafc' }}>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Quantity</p>
                  <p className="text-lg font-bold" style={{ color: '#0f172a' }}>
                    {movement.type === 'IN' ? '+' : '-'}{movement.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium" style={{ color: '#0f172a' }}>
                    {new Date(movement.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(movement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {movement.note && (
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{movement.note}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── RESTOCK MODAL — slides up from bottom ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Restock Product</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Add stock from a supplier</p>
              </div>
              <button onClick={() => { setShowModal(false); setError('') }}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>
              )}

              {/* Product */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Product</label>
                <select value={form.productId}
                  onChange={e => setForm({ ...form, productId: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Supplier</label>
                <select value={form.supplierId}
                  onChange={e => setForm({ ...form, supplierId: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">Select supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Quantity stepper */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm({ ...form, quantity: Math.max(1, parseInt(form.quantity || 1) - 1) })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>
                    −
                  </button>
                  <input type="number" min="1" value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none text-center font-bold"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                  <button
                    onClick={() => setForm({ ...form, quantity: parseInt(form.quantity || 1) + 1 })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#3b82f6', color: 'white' }}>
                    +
                  </button>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Note</label>
                <input type="text" value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                  placeholder="e.g. Monthly restock" />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleRestock}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                Confirm Restock
              </button>
              <button onClick={() => { setShowModal(false); setError('') }}
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

export default StockMovements