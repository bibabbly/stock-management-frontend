import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { MdAdd, MdClose, MdSwapVert, MdArrowUpward, MdArrowDownward, MdSearch, MdRemoveCircle } from 'react-icons/md'
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
        <span className="truncate">
          {selected ? `${selected.name} (Stock: ${selected.quantity})` : 'Select product'}
        </span>
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
  const [activeTab, setActiveTab] = useState('ALL')
  const [movements, setMovements] = useState([])
  const [activeProducts, setActiveProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [locations, setLocations] = useState([])
  const [stockBalance, setStockBalance] = useState([])
  const [loading, setLoading] = useState(true)
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [showStockOutModal, setShowStockOutModal] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [totalIn, setTotalIn] = useState(0)
  const [totalOut, setTotalOut] = useState(0)
  const [restockForm, setRestockForm] = useState({
    productId: '', supplierId: '', quantity: 1, note: '', locationId: ''
  })
  const [stockOutForm, setStockOutForm] = useState({
    productId: '', quantity: 1, reason: ''
  })

  const fetchMovements = (pageNum = 0, type = 'ALL', searchVal = '', size = 20) => {
    setLoading(true)
    const typeParam = type === 'BALANCE' ? 'ALL' : type
    api.get(`/stock-movements/shop/${shopId}?page=${pageNum}&size=${size}&type=${typeParam}&search=${searchVal}`)
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

  const fetchBalance = () => {
    setBalanceLoading(true)
    api.get(`/stock-locations/shop/${shopId}/stock`)
      .then(res => setStockBalance(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setBalanceLoading(false))
  }

  const fetchSummary = () => {
    api.get(`/stock-movements/shop/${shopId}?page=0&size=1&type=IN`)
      .then(res => setTotalIn(res.data.totalElements || 0)).catch(() => {})
    api.get(`/stock-movements/shop/${shopId}?page=0&size=1&type=OUT`)
      .then(res => setTotalOut(res.data.totalElements || 0)).catch(() => {})
  }

  useEffect(() => {
    fetchMovements(0, 'ALL', '', 20)
    fetchSummary()
    fetchBalance()
    api.get(`/products/shop/${shopId}/active`).then(res => setActiveProducts(res.data || []))
    api.get(`/suppliers/shop/${shopId}/all`).then(res => setSuppliers(res.data))
    api.get(`/stock-locations/shop/${shopId}`).then(res => setLocations(res.data || []))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab !== 'BALANCE') fetchMovements(0, activeTab, search, pageSize)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'BALANCE') {
      fetchBalance()
    } else {
      fetchMovements(0, tab, search, pageSize)
    }
  }

  const handleRestock = async () => {
    if (submitting) return
    if (locations.length > 1 && !restockForm.locationId) {
      setError('Please select a location to save stock')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await api.post('/stock-movements/restock', {
        shopId, userId,
        productId: parseInt(restockForm.productId),
        supplierId: restockForm.supplierId ? parseInt(restockForm.supplierId) : null,
        quantity: parseInt(restockForm.quantity),
        note: restockForm.note || 'Restock',
        locationId: restockForm.locationId ? parseInt(restockForm.locationId) : null
      })
      setShowRestockModal(false)
      setRestockForm({ productId: '', supplierId: '', quantity: 1, note: '', locationId: '' })
      fetchMovements(0, activeTab === 'BALANCE' ? 'ALL' : activeTab, search, pageSize)
      fetchSummary()
      fetchBalance()
      api.get(`/products/shop/${shopId}/active`).then(res => setActiveProducts(res.data || []))
    } catch (err) {
      setError('Failed to restock. Please check all fields.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStockOut = async () => {
    if (submitting) return
    if (!stockOutForm.reason.trim()) {
      setError('Reason is mandatory for manual stock out')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await api.post('/stock-movements/manual-out', {
        shopId, userId,
        productId: parseInt(stockOutForm.productId),
        quantity: parseInt(stockOutForm.quantity),
        reason: stockOutForm.reason
      })
      setShowStockOutModal(false)
      setStockOutForm({ productId: '', quantity: 1, reason: '' })
      fetchMovements(0, activeTab === 'BALANCE' ? 'ALL' : activeTab, search, pageSize)
      fetchSummary()
      fetchBalance()
      api.get(`/products/shop/${shopId}/active`).then(res => setActiveProducts(res.data || []))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record stock out')
    } finally {
      setSubmitting(false)
    }
  }

  const balanceByProduct = stockBalance.reduce((acc, ps) => {
    const productId = ps.product?.id
    if (!acc[productId]) {
      acc[productId] = { product: ps.product, locations: [] }
    }
    acc[productId].locations.push({ location: ps.location, quantity: ps.quantity })
    return acc
  }, {})

  const hasMultipleLocations = locations.length > 1

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Stock Movements</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{totalElements} total movements</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowStockOutModal(true); setError('') }}
            className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            <MdRemoveCircle size={18} />
            <span className="hidden sm:inline">Stock Out</span>
            <span className="sm:hidden">Out</span>
          </button>
          <button onClick={() => { setShowRestockModal(true); setError('') }}
            className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <MdAdd size={18} />
            <span className="hidden sm:inline">Restock</span>
            <span className="sm:hidden">In</span>
          </button>
        </div>
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
      {activeTab !== 'BALANCE' && (
        <div className="bg-white rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <MdSearch size={20} style={{ color: '#94a3b8' }} />
          <input type="text" placeholder="Search by product name..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm focus:outline-none" style={{ color: '#0f172a' }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: '#94a3b8' }}>
              <MdClose size={18} />
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'ALL', label: '📋 All' },
          { key: 'IN', label: '📥 In' },
          { key: 'OUT', label: '📤 Out' },
          { key: 'BALANCE', label: '⚖️ Balance' },
        ].map(tab => (
          <button key={tab.key} onClick={() => handleTabChange(tab.key)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab.key ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'white',
              color: activeTab === tab.key ? 'white' : '#64748b',
              border: activeTab === tab.key ? 'none' : '1px solid #f1f5f9',
              boxShadow: activeTab === tab.key ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.06)'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* BALANCE TAB */}
      {activeTab === 'BALANCE' && (
        <>
          {balanceLoading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
              <p style={{ color: '#94a3b8' }}>Loading balance...</p>
            </div>
          ) : (
            <>
              {/* DESKTOP BALANCE TABLE */}
              <div className="hidden md:block bg-white rounded-xl overflow-hidden"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#94a3b8' }}>Product</th>
                      {hasMultipleLocations
                        ? locations.map(loc => (
                          <th key={loc.id} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                            style={{ color: '#94a3b8' }}>
                            {loc.isMain ? '🏪' : '🏭'} {loc.name}
                          </th>
                        ))
                        : <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: '#94a3b8' }}>Stock</th>
                      }
                      {hasMultipleLocations && (
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: '#94a3b8' }}>Total</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(balanceByProduct).length === 0 ? (
                      <tr><td colSpan={hasMultipleLocations ? locations.length + 2 : 2} className="text-center py-16">
                        <p style={{ color: '#94a3b8' }}>No stock data found</p>
                      </td></tr>
                    ) : (
                      Object.values(balanceByProduct).map((item) => {
                        const total = item.locations.reduce((sum, l) => sum + l.quantity, 0)
                        return (
                          <tr key={item.product?.id}
                            style={{ borderBottom: '1px solid #f8fafc' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                  {item.product?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{item.product?.name}</p>
                                  <p className="text-xs" style={{ color: '#94a3b8' }}>{item.product?.category}</p>
                                </div>
                              </div>
                            </td>
                            {hasMultipleLocations ? (
                              <>
                                {locations.map(loc => {
                                  const locStock = item.locations.find(l => l.location?.id === loc.id)
                                  const qty = locStock ? locStock.quantity : 0
                                  return (
                                    <td key={loc.id} className="px-5 py-3.5">
                                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                        style={{
                                          background: qty <= 0 ? '#fef2f2' : qty <= 5 ? '#fef3c7' : '#f0fdf4',
                                          color: qty <= 0 ? '#ef4444' : qty <= 5 ? '#d97706' : '#16a34a'
                                        }}>
                                        {qty} {item.product?.unit || ''}
                                      </span>
                                    </td>
                                  )
                                })}
                                <td className="px-5 py-3.5">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                    style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                    {total} {item.product?.unit || ''}
                                  </span>
                                </td>
                              </>
                            ) : (
                              <td className="px-5 py-3.5">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                                  style={{
                                    background: total <= 0 ? '#fef2f2' : total <= 5 ? '#fef3c7' : '#f0fdf4',
                                    color: total <= 0 ? '#ef4444' : total <= 5 ? '#d97706' : '#16a34a'
                                  }}>
                                  {total} {item.product?.unit || ''}
                                </span>
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE BALANCE CARDS */}
              <div className="md:hidden space-y-3">
                {Object.values(balanceByProduct).map(item => {
                  const total = item.locations.reduce((sum, l) => sum + l.quantity, 0)
                  return (
                    <div key={item.product?.id} className="bg-white rounded-xl p-4"
                      style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                          {item.product?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{item.product?.name}</p>
                          <p className="text-xs" style={{ color: '#94a3b8' }}>{item.product?.category}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid #f8fafc' }}>
                        {item.locations.map(l => (
                          <div key={l.location?.id} className="flex items-center justify-between">
                            <p className="text-xs" style={{ color: '#64748b' }}>
                              {l.location?.isMain ? '🏪' : '🏭'} {l.location?.name}
                            </p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: l.quantity <= 0 ? '#fef2f2' : l.quantity <= 5 ? '#fef3c7' : '#f0fdf4',
                                color: l.quantity <= 0 ? '#ef4444' : l.quantity <= 5 ? '#d97706' : '#16a34a'
                              }}>
                              {l.quantity} {item.product?.unit || ''}
                            </span>
                          </div>
                        ))}
                        {hasMultipleLocations && (
                          <div className="flex items-center justify-between pt-1"
                            style={{ borderTop: '1px solid #f1f5f9' }}>
                            <p className="text-xs font-semibold" style={{ color: '#64748b' }}>Total</p>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: '#eff6ff', color: '#3b82f6' }}>
                              {total} {item.product?.unit || ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* MOVEMENTS — ALL, IN, OUT tabs */}
      {activeTab !== 'BALANCE' && (
        <>
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
                      <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{movement.product?.name}</p>
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
                      {movement.note && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{movement.note}</p>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            page={page} totalPages={totalPages} totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={(p) => fetchMovements(p, activeTab, search, pageSize)}
            onPageSizeChange={(s) => fetchMovements(0, activeTab, search, s)}
          />
        </>
      )}

      {/* RESTOCK MODAL */}
      {showRestockModal && (
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
              <button onClick={() => { setShowRestockModal(false); setError('') }}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>}

              {/* Product */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Product</label>
                <ProductSearch products={activeProducts} value={restockForm.productId}
                  onChange={(val) => setRestockForm({ ...restockForm, productId: val })} />
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Supplier <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
                </label>
                <select value={restockForm.supplierId}
                  onChange={e => setRestockForm({ ...restockForm, supplierId: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">-- No supplier (Direct Restock) --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Location selector — only show if multiple locations */}
              {locations.length > 1 && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                    Save Stock To <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select value={restockForm.locationId}
                    onChange={e => setRestockForm({ ...restockForm, locationId: e.target.value })}
                    className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                    <option value="">Select location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.isMain ? '🏪' : '🏭'} {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setRestockForm({ ...restockForm, quantity: Math.max(1, parseInt(restockForm.quantity || 1) - 1) })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>−</button>
                  <input type="number" min="1" value={restockForm.quantity}
                    onChange={e => setRestockForm({ ...restockForm, quantity: e.target.value })}
                    className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none text-center font-bold"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                  <button onClick={() => setRestockForm({ ...restockForm, quantity: parseInt(restockForm.quantity || 1) + 1 })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#3b82f6', color: 'white' }}>+</button>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Note</label>
                <input type="text" value={restockForm.note}
                  onChange={e => setRestockForm({ ...restockForm, note: e.target.value })}
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
              <button onClick={() => { setShowRestockModal(false); setError('') }}
                className="px-5 py-3 rounded-xl font-semibold text-sm"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOCK OUT MODAL */}
      {showStockOutModal && (
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
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Manual Stock Out</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Record stolen, expired or damaged stock</p>
              </div>
              <button onClick={() => { setShowStockOutModal(false); setError(''); setStockOutForm({ productId: '', quantity: 1, reason: '' }) }}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>}
              <div className="rounded-xl p-3" style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
                <p className="text-xs font-semibold" style={{ color: '#d97706' }}>⚠️ This will reduce stock permanently</p>
                <p className="text-xs mt-1" style={{ color: '#92400e' }}>Use for: stolen goods, expired items, damaged stock</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Product</label>
                <ProductSearch products={activeProducts} value={stockOutForm.productId}
                  onChange={(val) => setStockOutForm({ ...stockOutForm, productId: val })} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStockOutForm({ ...stockOutForm, quantity: Math.max(1, parseInt(stockOutForm.quantity || 1) - 1) })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>−</button>
                  <input type="number" min="1" value={stockOutForm.quantity}
                    onChange={e => setStockOutForm({ ...stockOutForm, quantity: e.target.value })}
                    className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none text-center font-bold"
                    style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => { e.target.select(); e.target.style.borderColor = '#ef4444' }}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                  <button onClick={() => setStockOutForm({ ...stockOutForm, quantity: parseInt(stockOutForm.quantity || 1) + 1 })}
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0"
                    style={{ background: '#ef4444', color: 'white' }}>+</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Reason <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input type="text" value={stockOutForm.reason}
                  onChange={e => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#ef4444'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                  placeholder="e.g. Stolen, Expired, Damaged" />
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Stolen', 'Expired', 'Damaged', 'Lost', 'Inventory adjustment'].map(r => (
                    <button key={r} onClick={() => setStockOutForm({ ...stockOutForm, reason: r })}
                      className="px-2.5 py-1 rounded-lg text-xs"
                      style={{
                        background: stockOutForm.reason === r ? '#fef2f2' : '#f8fafc',
                        color: stockOutForm.reason === r ? '#ef4444' : '#64748b',
                        border: stockOutForm.reason === r ? '1px solid #fecaca' : '1px solid #e2e8f0'
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleStockOut}
                disabled={submitting || !stockOutForm.reason.trim() || !stockOutForm.productId}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{
                  background: submitting || !stockOutForm.reason.trim() || !stockOutForm.productId
                    ? '#94a3b8' : 'linear-gradient(135deg, #ef4444, #f87171)',
                  cursor: submitting || !stockOutForm.reason.trim() || !stockOutForm.productId
                    ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'Saving...' : 'Confirm Stock Out'}
              </button>
              <button onClick={() => { setShowStockOutModal(false); setError(''); setStockOutForm({ productId: '', quantity: 1, reason: '' }) }}
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