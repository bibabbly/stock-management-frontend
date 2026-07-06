import { useEffect, useState, useRef } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdClose, MdPointOfSale, MdPrint, MdSearch } from 'react-icons/md'
import Receipt from '../components/Receipt'
import Pagination from '../components/Pagination'

// Searchable product dropdown component
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
    <div ref={ref} className="relative flex-1">
      <div
        onClick={() => setOpen(!open)}
        className="w-full rounded-xl px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between"
        style={{ border: '2px solid #f1f5f9', background: 'white', color: selected ? '#0f172a' : '#94a3b8', minHeight: '44px' }}>
        <span className="truncate">
          {selected
            ? `${selected.name} (×${selected.quantity}) — RWF ${selected.sellingPrice?.toLocaleString()}`
            : 'Select product'}
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
                  onClick={() => { onChange(p.id); setOpen(false); setSearch('') }}
                  className="px-3 py-2.5 cursor-pointer flex items-center justify-between"
                  style={{
                    background: value === String(p.id) ? '#eff6ff' : 'white',
                    borderBottom: '1px solid #f8fafc'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = value === String(p.id) ? '#eff6ff' : 'white'}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>{p.name}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      Stock: {p.quantity} · RWF {p.sellingPrice?.toLocaleString()}
                    </p>
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

function Sales() {
  const { shopId, userId } = useAuth()
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [items, setItems] = useState([{ productId: '', quantity: 1, discountType: 'NONE', discountValue: '' }])
  const [selectedSale, setSelectedSale] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const fetchSales = (pageNum = 0, size = pageSize) => {
    setLoading(true)
    api.get(`/sales/shop/${shopId}?page=${pageNum}&size=${size}`)
      .then(res => {
        setSales(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
        setPage(pageNum)
        setPageSize(size)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSales()
    api.get(`/products/shop/${shopId}?page=0&size=1000`).then(res => setProducts(res.data.content || []))
    api.get(`/suppliers/shop/${shopId}/all`).then(res => {
      const list = res.data
      const hasCashNorm = list.some(s => s.name === 'CashNorm')
      if (!hasCashNorm) {
        setSuppliers([{ id: 'cashnorm', name: '🚶 CashNorm (Walk-in)' }, ...list])
      } else {
        setSuppliers(list)
      }
    })
  }, [])

  const addItem = () => setItems([...items, { productId: '', quantity: 1, discountType: 'NONE', discountValue: '' }])
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value
    if (field === 'discountType') updated[index].discountValue = ''
    setItems(updated)
  }

  const getItemDiscount = (item) => {
    const product = products.find(p => p.id === parseInt(item.productId))
    if (!product || item.discountType === 'NONE' || !item.discountValue) return 0
    const subtotal = product.sellingPrice * parseInt(item.quantity || 0)
    if (item.discountType === 'PERCENTAGE') return subtotal * (parseFloat(item.discountValue) / 100)
    if (item.discountType === 'FIXED') return Math.min(parseFloat(item.discountValue), subtotal)
    return 0
  }

  const getItemTotal = (item) => {
    const product = products.find(p => p.id === parseInt(item.productId))
    if (!product) return 0
    const subtotal = product.sellingPrice * parseInt(item.quantity || 0)
    return subtotal - getItemDiscount(item)
  }

  const formOriginal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === parseInt(item.productId))
    return sum + (product ? product.sellingPrice * parseInt(item.quantity || 0) : 0)
  }, 0)

  const formTotalDiscount = items.reduce((sum, item) => sum + getItemDiscount(item), 0)
  const formTotal = formOriginal - formTotalDiscount

  const getBoughtAt = (sale) => {
    return sale.items?.reduce((sum, item) => {
      return sum + ((item.product?.buyingPrice || 0) * (item.quantity || 0))
    }, 0) || 0
  }

  const getProfit = (sale) => {
    return (sale.totalAmount || 0) - getBoughtAt(sale)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/sales', {
        shopId, userId, paymentMethod,
        supplierId: supplierId && supplierId !== 'cashnorm' ? parseInt(supplierId) : null,
        items: items.map(i => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity),
          discountType: i.discountType === 'NONE' ? null : i.discountType,
          discountValue: i.discountType === 'NONE' ? null : parseFloat(i.discountValue || 0)
        }))
      })
      setShowModal(false)
      setItems([{ productId: '', quantity: 1, discountType: 'NONE', discountValue: '' }])
      setPaymentMethod('CASH')
      setSupplierId('')
      fetchSales(0, pageSize)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sale')
    } finally {
      setSubmitting(false)
    }
  }

  const paymentColors = {
    CASH: { bg: '#f0fdf4', color: '#16a34a' },
    MOMO: { bg: '#fef3c7', color: '#d97706' },
    BANK: { bg: '#eff6ff', color: '#3b82f6' },
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Sales</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{totalElements} total transactions</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <MdAdd size={18} />
          <span className="hidden sm:inline">New Sale</span>
          <span className="sm:hidden">Sale</span>
        </button>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Date & Time', 'Items', 'Supplier', 'Payment', 'Bought At', 'Sold For', 'Discount', 'Profit', 'By', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="10" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading sales...</p>
              </td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-16">
                <MdPointOfSale size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No sales yet</p>
              </td></tr>
            ) : (
              sales.map((sale, i) => {
                const boughtAt = getBoughtAt(sale)
                const profit = getProfit(sale)
                const isProfit = profit >= 0
                return (
                  <tr key={sale.id}
                    style={{ borderBottom: i < sales.length - 1 ? '1px solid #f8fafc' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{new Date(sale.date).toLocaleDateString()}</p>
                      <p className="text-xs" style={{ color: '#94a3b8' }}>{new Date(sale.date).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {sale.items?.map(item => (
                          <div key={item.id} className="flex flex-col">
                            <span className="px-2 py-0.5 rounded-full text-xs"
                              style={{ background: '#f1f5f9', color: '#64748b' }}>
                              {item.product?.name} ×{item.quantity}
                            </span>
                            {item.discountAmount > 0 && (
                              <span className="text-xs px-2" style={{ color: '#ef4444' }}>
                                -{item.discountType === 'PERCENTAGE'
                                  ? `${item.discountValue}%`
                                  : `RWF ${item.discountAmount?.toLocaleString()}`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                      {sale.supplier?.name || <span style={{ color: '#cbd5e1' }}>CashNorm</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9',
                          color: paymentColors[sale.paymentMethod]?.color || '#64748b'
                        }}>{sale.paymentMethod}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                      RWF {boughtAt.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-sm" style={{ color: '#0f172a' }}>
                      RWF {sale.totalAmount?.toLocaleString()}
                      {sale.discountAmount > 0 && (
                        <p className="text-xs font-normal line-through" style={{ color: '#94a3b8' }}>
                          RWF {sale.originalAmount?.toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold" style={{ color: '#ef4444' }}>
                      {sale.discountAmount > 0
                        ? `- RWF ${sale.discountAmount?.toLocaleString()}`
                        : <span style={{ color: '#cbd5e1' }}>—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: isProfit ? '#f0fdf4' : '#fef2f2',
                          color: isProfit ? '#16a34a' : '#ef4444'
                        }}>
                        {isProfit ? '+' : ''}RWF {profit.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                      {sale.user?.name || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelectedSale(sale)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <MdPrint size={14} /> Print
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
            <p style={{ color: '#94a3b8' }}>Loading sales...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <MdPointOfSale size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No sales yet</p>
          </div>
        ) : (
          sales.map(sale => {
            const boughtAt = getBoughtAt(sale)
            const profit = getProfit(sale)
            const isProfit = profit >= 0
            return (
              <div key={sale.id} className="bg-white rounded-xl p-4"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#0f172a' }}>
                      RWF {sale.totalAmount?.toLocaleString()}
                      {sale.discountAmount > 0 && (
                        <span className="ml-2 text-xs font-normal line-through" style={{ color: '#94a3b8' }}>
                          RWF {sale.originalAmount?.toLocaleString()}
                        </span>
                      )}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(sale.date).toLocaleDateString()} · {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {sale.user?.name && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>By: {sale.user.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9',
                        color: paymentColors[sale.paymentMethod]?.color || '#64748b'
                      }}>{sale.paymentMethod}</span>
                    <button onClick={() => setSelectedSale(sale)}
                      className="p-2 rounded-lg" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <MdPrint size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {sale.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: '#f1f5f9', color: '#64748b' }}>
                        {item.product?.name} ×{item.quantity}
                      </span>
                      {item.discountAmount > 0 && (
                        <span className="text-xs" style={{ color: '#ef4444' }}>
                          -{item.discountType === 'PERCENTAGE'
                            ? `${item.discountValue}%`
                            : `RWF ${item.discountAmount?.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid #f8fafc' }}>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Bought At</p>
                    <p className="text-xs font-semibold" style={{ color: '#64748b' }}>RWF {boughtAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Discount</p>
                    <p className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                      {sale.discountAmount > 0 ? `- RWF ${sale.discountAmount?.toLocaleString()}` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Profit</p>
                    <p className="text-xs font-bold" style={{ color: isProfit ? '#16a34a' : '#ef4444' }}>
                      {isProfit ? '+' : ''}RWF {profit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
                  Supplier: <span style={{ color: '#64748b', fontWeight: 500 }}>{sale.supplier?.name || 'CashNorm'}</span>
                </p>
              </div>
            )
          })
        )}
      </div>

      <Pagination
        page={page} totalPages={totalPages} totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => fetchSales(p, pageSize)}
        onPageSizeChange={(s) => fetchSales(0, s)}
      />

      {/* NEW SALE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col"
            style={{ borderRadius: '20px 20px 0 0', maxHeight: '92vh' }}>

            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>New Sale</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Add products and complete the sale</p>
              </div>
              <button onClick={() => { setShowModal(false); setError('') }}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>
              )}

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>Payment Method</label>
                <div className="flex gap-2">
                  {['CASH', 'MOMO', 'BANK'].map(method => (
                    <button key={method} onClick={() => setPaymentMethod(method)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: paymentMethod === method ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : '#f8fafc',
                        color: paymentMethod === method ? 'white' : '#64748b',
                        border: paymentMethod === method ? 'none' : '2px solid #f1f5f9'
                      }}>
                      {method === 'CASH' ? '💵' : method === 'MOMO' ? '📱' : '🏦'} {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Supplier */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>Supplier / Customer</label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">-- Select supplier --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Products with searchable dropdown + per-item discount */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>Products</label>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const product = products.find(p => p.id === parseInt(item.productId))
                    const itemSubtotal = product ? product.sellingPrice * parseInt(item.quantity || 0) : 0
                    const itemDisc = getItemDiscount(item)
                    const itemFinal = itemSubtotal - itemDisc

                    return (
                      <div key={index} className="rounded-xl p-3 space-y-2"
                        style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>

                        {/* Searchable product + qty */}
                        <div className="flex gap-2 items-center">
                          <ProductSearch
                            products={products}
                            value={item.productId}
                            onChange={(productId) => updateItem(index, 'productId', String(productId))}
                          />
                          <div className="flex items-center gap-1 flex-shrink-0">
  <button onClick={() => updateItem(index, 'quantity', Math.max(1, parseInt(item.quantity || 1) - 1))}
    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
    style={{ background: '#e2e8f0', color: '#64748b' }}>−</button>
  <input
    type="number"
    min="1"
    value={item.quantity}
    onChange={e => {
      const val = parseInt(e.target.value)
      if (!isNaN(val) && val >= 1) updateItem(index, 'quantity', val)
    }}
    onFocus={e => e.target.select()}
    className="text-center text-sm font-bold focus:outline-none rounded-lg"
    style={{
      width: '48px', height: '32px',
      border: '2px solid #e2e8f0',
      color: '#0f172a', background: '#f8fafc'
    }} />
  <button onClick={() => updateItem(index, 'quantity', parseInt(item.quantity || 1) + 1)}
    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
    style={{ background: '#3b82f6', color: 'white' }}>+</button>
</div>
                          {items.length > 1 && (
                            <button onClick={() => removeItem(index)}
                              className="p-1.5 rounded-lg flex-shrink-0"
                              style={{ color: '#ef4444', background: '#fef2f2' }}>
                              <MdClose size={14} />
                            </button>
                          )}
                        </div>

                        {/* Discount toggle */}
                        <div className="flex gap-1.5">
                          {['NONE', 'PERCENTAGE', 'FIXED'].map(type => (
                            <button key={type}
                              onClick={() => updateItem(index, 'discountType', type)}
                              className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                              style={{
                                background: item.discountType === type ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'white',
                                color: item.discountType === type ? 'white' : '#94a3b8',
                                border: item.discountType === type ? 'none' : '1px solid #e2e8f0'
                              }}>
                              {type === 'NONE' ? 'No disc.' : type === 'PERCENTAGE' ? '% Off' : 'RWF Off'}
                            </button>
                          ))}
                        </div>

                        {item.discountType !== 'NONE' && (
                          <input type="number" min="0"
                            value={item.discountValue}
                            onChange={e => updateItem(index, 'discountValue', e.target.value)}
                            placeholder={item.discountType === 'PERCENTAGE' ? 'e.g. 10 for 10%' : 'e.g. 5000'}
                            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                            style={{ border: '1px solid #e2e8f0', background: 'white', color: '#0f172a' }}
                            onFocus={e => e.target.style.borderColor = '#3b82f6'}
                            onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                        )}

                        {itemSubtotal > 0 && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span style={{ color: '#94a3b8' }}>
                              {itemDisc > 0 && <span style={{ color: '#ef4444' }}>- RWF {itemDisc.toLocaleString()} </span>}
                            </span>
                            <span className="font-bold" style={{ color: '#0f172a' }}>
                              RWF {itemFinal.toLocaleString()}
                              {itemDisc > 0 && <span className="ml-1 line-through font-normal" style={{ color: '#94a3b8' }}>
                                RWF {itemSubtotal.toLocaleString()}
                              </span>}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button onClick={addItem}
                  className="mt-3 text-xs font-semibold flex items-center gap-1 px-3 py-2 rounded-lg"
                  style={{ color: '#3b82f6', background: '#eff6ff' }}>
                  <MdAdd size={16} /> Add another product
                </button>
              </div>

              {/* Total Summary */}
              {formOriginal > 0 && (
                <div className="rounded-xl p-4 space-y-2"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#64748b' }}>Subtotal</span>
                    <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>RWF {formOriginal.toLocaleString()}</span>
                  </div>
                  {formTotalDiscount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: '#ef4444' }}>Total Discount</span>
                      <span className="text-sm font-semibold" style={{ color: '#ef4444' }}>- RWF {formTotalDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2"
                    style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}>
                    <span className="text-sm font-bold" style={{ color: '#64748b' }}>Total</span>
                    <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                      RWF {formTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'Processing...' : 'Complete Sale'}
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

      {selectedSale && <Receipt sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </Layout>
  )
}

export default Sales