import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdSwapHoriz, MdClose, MdSearch, MdAdd } from 'react-icons/md'
import Pagination from '../components/Pagination'

function ProductSearch({ products, value, onChange }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = products.find(p => p.id === parseInt(value))
  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <div onClick={() => setOpen(!open)}
        className="w-full rounded-xl px-3 py-3 text-sm cursor-pointer flex items-center justify-between"
        style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: selected ? '#0f172a' : '#94a3b8', minHeight: '48px' }}>
        <span className="truncate">{selected ? `${selected.name}` : 'Select product'}</span>
        <MdSearch size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden"
          style={{ border: '1px solid #e2e8f0', maxHeight: '260px' }}>
          <div className="p-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <MdSearch size={14} style={{ color: '#94a3b8' }} />
              <input type="text" placeholder="Search product..." value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()} autoFocus
                className="flex-1 text-xs focus:outline-none"
                style={{ background: 'transparent', color: '#0f172a' }} />
              {search && (
                <button onClick={e => { e.stopPropagation(); setSearch('') }}>
                  <MdClose size={12} style={{ color: '#94a3b8' }} />
                </button>
              )}
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filtered.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: '#94a3b8' }}>No products found</p>
            ) : (
              filtered.map(p => (
                <div key={p.id}
                  onClick={() => { onChange(String(p.id)); setOpen(false); setSearch('') }}
                  className="px-3 py-2.5 cursor-pointer flex items-center justify-between"
                  style={{ background: value === String(p.id) ? '#eff6ff' : 'white', borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = value === String(p.id) ? '#eff6ff' : 'white'}>
                  <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>{p.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StockTransfer() {
 const { shopId, userId, user } = useAuth()
 const isAdmin = user?.role === 'ADMIN'

  const [transfers, setTransfers] = useState([])
  const [locations, setLocations] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [form, setForm] = useState({
    productId: '', fromLocationId: '', toLocationId: '', quantity: 1, note: ''
  })

  // Stock info for selected product
  const [productStock, setProductStock] = useState([])

  // Which locations this user is allowed to pick as source/destination
  const allowedFromLocations = isAdmin
    ? locations
    : locations.filter(l => !l.isMain)
  const allowedToLocations = isAdmin
    ? locations
    : locations.filter(l => l.isMain)

  // Non-admins never see Main/shop quantity
  const visibleProductStock = isAdmin
    ? productStock
    : productStock.filter(ps => !ps.location.isMain)

  const fetchTransfers = (pageNum = 0, size = pageSize) => {
    setLoading(true)
    api.get(`/stock-transfers/shop/${shopId}?page=${pageNum}&size=${size}`)
      .then(res => {
        setTransfers(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
        setPage(pageNum)
        setPageSize(size)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTransfers()
    api.get(`/stock-locations/shop/${shopId}`)
      .then(res => setLocations(res.data || []))
    api.get(`/products/shop/${shopId}/active`)
      .then(res => setProducts(res.data || []))
  }, [])

  // When product is selected, fetch its stock per location
  useEffect(() => {
    if (form.productId) {
      api.get(`/stock-locations/shop/${shopId}/stock`)
        .then(res => {
          const filtered = (res.data || []).filter(
            ps => ps.product.id === parseInt(form.productId)
          )
          setProductStock(filtered)
        })
    } else {
      setProductStock([])
    }
  }, [form.productId])

  const getStockForLocation = (locationId) => {
    const ps = productStock.find(ps => ps.location.id === parseInt(locationId))
    return ps ? ps.quantity : 0
  }

  const handleTransfer = async () => {
    if (submitting) return
    if (!form.productId || !form.fromLocationId || !form.toLocationId) {
      setError('Please fill all required fields')
      return
    }
    if (form.fromLocationId === form.toLocationId) {
      setError('Source and destination locations cannot be the same')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/stock-transfers', {
        shopId, userId,
        productId: parseInt(form.productId),
        fromLocationId: parseInt(form.fromLocationId),
        toLocationId: parseInt(form.toLocationId),
        quantity: parseInt(form.quantity),
        note: form.note
      })
      setShowModal(false)
      setForm({ productId: '', fromLocationId: '', toLocationId: '', quantity: 1, note: '' })
      setProductStock([])
      fetchTransfers()
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Stock Transfer</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            {locations.length <= 1
              ? 'Add a second location in Settings to enable transfers'
              : isAdmin
                ? 'Send stock from Main to Warehouse'
                : 'Send stock from Warehouse to Main'}
          </p>
        </div>
        {locations.length > 1 && (
          <button onClick={() => { setShowModal(true); setError('') }}
            className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <MdAdd size={18} />
            <span className="hidden sm:inline">New Transfer</span>
            <span className="sm:hidden">Transfer</span>
          </button>
        )}
      </div>

      {/* No locations warning */}
      {locations.length <= 1 && (
        <div className="rounded-xl p-5 mb-5 flex items-start gap-4"
          style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
          <span style={{ fontSize: '28px' }}>⚠️</span>
          <div>
            <p className="font-bold text-sm mb-1" style={{ color: '#92400e' }}>
              Only one stock location configured
            </p>
            <p className="text-sm" style={{ color: '#78350f' }}>
              Go to <strong>Settings → Stock Locations</strong> to add a Warehouse or second location before transferring stock.
            </p>
          </div>
        </div>
      )}

      {/* Location summary cards */}
      {locations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {locations.map(loc => (
            <div key={loc.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{loc.name}</p>
                {loc.isMain && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: '#f0fdf4', color: '#16a34a' }}>Main</span>
                )}
              </div>
              <p className="text-xs" style={{ color: '#94a3b8' }}>Stock location</p>
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Date', 'Product', 'From', 'To', 'Quantity', 'Note', 'By'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading transfers...</p>
              </td></tr>
            ) : transfers.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-16">
                <MdSwapHoriz size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No transfers yet</p>
              </td></tr>
            ) : (
              transfers.map((t, i) => (
                <tr key={t.id}
                  style={{ borderBottom: i < transfers.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                      {t.product?.name}
                    </p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ background: '#fef2f2', color: '#ef4444' }}>
                      {t.fromLocation?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      {t.toLocation?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-sm" style={{ color: '#3b82f6' }}>
                    {t.quantity}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {t.note || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {t.user?.name || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p style={{ color: '#94a3b8' }}>Loading transfers...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-center py-16">
            <MdSwapHoriz size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No transfers yet</p>
          </div>
        ) : (
          transfers.map(t => (
            <div key={t.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{t.product?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                    {new Date(t.createdAt).toLocaleDateString()} · {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className="text-lg font-bold" style={{ color: '#3b82f6' }}>{t.quantity} units</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#fef2f2', color: '#ef4444' }}>
                  From: {t.fromLocation?.name}
                </span>
                <MdSwapHoriz size={16} style={{ color: '#94a3b8' }} />
                <span className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  To: {t.toLocation?.name}
                </span>
              </div>
              {t.note && <p className="text-xs" style={{ color: '#64748b' }}>Note: {t.note}</p>}
              {t.user && <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>By: {t.user.name}</p>}
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page} totalPages={totalPages} totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => fetchTransfers(p, pageSize)}
        onPageSizeChange={(s) => fetchTransfers(0, s)}
      />

      {/* TRANSFER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>New Stock Transfer</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {isAdmin ? 'Send stock from Main to Warehouse' : 'Send stock from Warehouse to Main'}
                </p>
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
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Product <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <ProductSearch
                  products={products}
                  value={form.productId}
                  onChange={(val) => setForm({ ...form, productId: val, fromLocationId: '', toLocationId: '' })}
                />
              </div>

              {/* Stock per location info — Main/shop quantity hidden from non-admins */}
              {form.productId && visibleProductStock.length > 0 && (
                <div className="rounded-xl p-3 space-y-1"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>Current Stock:</p>
                  {visibleProductStock.map(ps => (
                    <div key={ps.location.id} className="flex justify-between text-xs">
                      <span style={{ color: '#64748b' }}>{ps.location.name}</span>
                      <span className="font-bold" style={{ color: ps.quantity > 0 ? '#16a34a' : '#ef4444' }}>
                        {ps.quantity} units
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* From Location — restricted to the direction this role is allowed */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  From Location <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select value={form.fromLocationId}
                  onChange={e => setForm({ ...form, fromLocationId: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">Select source location</option>
                  {allowedFromLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {form.productId ? `(${getStockForLocation(loc.id)} units)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Location — restricted to the direction this role is allowed */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  To Location <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select value={form.toLocationId}
                  onChange={e => setForm({ ...form, toLocationId: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">Select destination location</option>
                  {allowedToLocations
                    .filter(loc => String(loc.id) !== String(form.fromLocationId))
                    .map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Quantity <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>−</button>
                  <input type="number" min="1" value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                    className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none text-center font-bold"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => { e.target.select(); e.target.style.borderColor = '#3b82f6' }}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                  <button onClick={() => setForm({ ...form, quantity: form.quantity + 1 })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#3b82f6', color: 'white' }}>+</button>
                </div>
                {form.fromLocationId && form.productId && (
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    Available: {getStockForLocation(form.fromLocationId)} units
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Note</label>
                <input type="text" value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="e.g. Weekly restock to main shop"
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleTransfer} disabled={submitting}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'Transferring...' : 'Confirm Transfer'}
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

export default StockTransfer