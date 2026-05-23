import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdClose, MdSwapVert, MdArrowUpward, MdArrowDownward, MdSearch } from 'react-icons/md'
import Pagination from '../components/Pagination'

// Searchable product dropdown — same as Sales
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
      <div
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl px-3 py-3 text-sm cursor-pointer flex items-center justify-between"
        style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: selected ? '#0f172a' : '#94a3b8', minHeight: '48px' }}>
        <span className="truncate">
          {selected ? `${selected.name} (Stock: ${selected.quantity})` : 'Select product'}
        </span>
        <MdSearch size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden"
          style={{ border: '1px solid #e2e8f0', maxHeight: '260px' }}>
          {/* Search input */}
          <div className="p-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <MdSearch size={14} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
                className="flex-1 text-xs focus:outline-none"
                style={{ background: 'transparent', color: '#0f172a' }}
              />
              {search && (
                <button onClick={e => { e.stopPropagation(); setSearch('') }}>
                  <MdClose size={12} style={{ color: '#94a3b8' }} />
                </button>
              )}
            </div>
          </div>

          {/* Product list */}
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filtered.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: '#94a3b8' }}>No products found</p>
            ) : (
              filtered.map(p => (
                <div
                  key={p.id}
                  onClick={() => { onChange(String(p.id)); setOpen(false); setSearch('') }}
                  className="px-3 py-2.5 cursor-pointer flex items-center justify-between"
                  style={{
                    background: value === String(p.id) ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f8fafc'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = value === String(p.id) ? '#eff6ff' : 'white'}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Stock: {p.quantity}</p>
                  </div>
                  {p.quantity <= 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ background: '#fef2f2', color: '#ef4444' }}>Out</span>
                  )}
                  {p.quantity > 0 && p.quantity <= 5 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold"
                      style={{ background: '#fef3c7', color: '#d97706' }}>Low</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StockMovements() {
  const { shopId, userId } = useAuth()
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalIn, setTotalIn] = useState(0)
  const [totalOut, setTotalOut] = useState(0)
  const [form, setForm] = useState({ productId: '', supplierId: '', quantity: 1, note: '' })

  const fetchMovements = (pageNum = 0, type = 'ALL', searchVal = '', size = 20) => {
    setLoading(true)
    api.get(`/stock-movements/shop/${shopId}?page=${pageNum}&size=${size}&type=${type}&search=${searchVal}`)
      .then(res => {
        setMovements(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
        setPage(pageNum)
        setPageSize(size)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  const fetchSummary = () => {
    api.get(`/stock-movements/shop/${shopId}?page=0&size=1&type=IN`)
      .then(res => setTotalIn(res.data.totalElements || 0))
      .catch(() => {})
    api.get(`/stock-movements/shop/${shopId}?page=0&size=1&type=OUT`)
      .then(res => setTotalOut(res.data.totalElements || 0))
      .catch(() => {})
  }

  useEffect(() => {
    fetchMovements(0, 'ALL', '', 20)
    fetchSummary()
    api.get(`/products/shop/${shopId}?page=0&size=1000`).then(res => setProducts(res.data.content || []))
    api.get(`/suppliers/shop/${shopId}/all`).then(res => setSuppliers(res.data))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMovements(0, filter, search, pageSize)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    fetchMovements(0, newFilter, search, pageSize)
  }

  const handleRestock = async () => {
    if (submitting) return
    setError('')
    setSubmitting(true)
    try {
      await api.post('/stock-movements/restock', {
        shopId, userId,
        productId: parseInt(form.productId),
        supplierId: parseInt(form.supplierId),
        quantity: parseInt(form.quantity),
        note: form.note
      })
      setShowModal(false)
      setForm({ productId: '', supplierId: '', quantity: 1, note: '' })
      fetchMovements(0, filter, search, pageSize)
      fetchSummary()
    } catch (err) {
      setError('Failed to restock. Please check all fields.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Stock Movements</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{totalElements} total movements</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <MdAdd size={18} /> Restock
        </button>
      </div>

      {/* Summary Cards */}
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

      {/* Search */}
      <div className="bg-white rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <MdSearch size={20} style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search by product name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm focus:outline-none"
          style={{ color: '#0f172a' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: '#94a3b8' }}>
            <MdClose size={18} />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {['ALL', 'IN', 'OUT'].map(tab => (
          <button key={tab}
            onClick={() => handleFilterChange(tab)}
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

      {/* DESKTOP TABLE */}
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
            ) : movements.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-16">
                <MdSwapVert size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No movements found</p>
              </td></tr>
            ) : (
              movements.map((movement, i) => (
                <tr key={movement.id}
                  style={{ borderBottom: i < movements.length - 1 ? '1px solid #f8fafc' : 'none' }}
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

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p style={{ color: '#94a3b8' }}>Loading movements...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="text-center py-16">
            <MdSwapVert size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No movements found</p>
          </div>
        ) : (
          movements.map(movement => (
            <div key={movement.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
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

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => fetchMovements(p, filter, search, pageSize)}
        onPageSizeChange={(s) => fetchMovements(0, filter, search, s)}
      />

      {/* RESTOCK MODAL */}
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

              {/* Searchable Product */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Product</label>
                <ProductSearch
                  products={products}
                  value={form.productId}
                  onChange={(val) => setForm({ ...form, productId: val })}
                />
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

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setForm({ ...form, quantity: Math.max(1, parseInt(form.quantity || 1) - 1) })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>−</button>
                  <input type="number" min="1" value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none text-center font-bold"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                  <button
                    onClick={() => setForm({ ...form, quantity: parseInt(form.quantity || 1) + 1 })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#3b82f6', color: 'white' }}>+</button>
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
              <button onClick={handleRestock} disabled={submitting}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'Saving...' : 'Confirm Restock'}
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