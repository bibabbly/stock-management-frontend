import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdClose, MdPointOfSale, MdPrint } from 'react-icons/md'
import Receipt from '../components/Receipt'

function Sales() {
  const { shopId, userId } = useAuth()
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [items, setItems] = useState([{ productId: '', quantity: 1 }])
  const [selectedSale, setSelectedSale] = useState(null)
  const [error, setError] = useState('')

  const fetchSales = () => {
    api.get(`/sales/shop/${shopId}`)
      .then(res => setSales(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchSales()
    api.get(`/products/shop/${shopId}`).then(res => setProducts(res.data))
    api.get(`/suppliers/shop/${shopId}`).then(res => {
      const list = res.data
      const hasCashNorm = list.some(s => s.name === 'CashNorm')
      if (!hasCashNorm) {
        setSuppliers([{ id: 'cashnorm', name: '🚶 CashNorm (Walk-in)' }, ...list])
      } else {
        setSuppliers(list)
      }
    })
  }, [])

  const addItem = () => setItems([...items, { productId: '', quantity: 1 }])
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index))
  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const formTotal = items.reduce((sum, item) => {
    const product = products.find(p => p.id === parseInt(item.productId))
    return sum + (product ? product.sellingPrice * parseInt(item.quantity || 0) : 0)
  }, 0)

  const handleSubmit = async () => {
    setError('')
    try {
      await api.post('/sales', {
        shopId, userId, paymentMethod,
        supplierId: supplierId && supplierId !== 'cashnorm' ? parseInt(supplierId) : null,
        items: items.map(i => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity)
        }))
      })
      setShowModal(false)
      setItems([{ productId: '', quantity: 1 }])
      setPaymentMethod('CASH')
      setSupplierId('')
      fetchSales()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sale')
    }
  }

  const paymentColors = {
    CASH: { bg: '#f0fdf4', color: '#16a34a' },
    MOMO: { bg: '#fef3c7', color: '#d97706' },
    BANK: { bg: '#eff6ff', color: '#3b82f6' },
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Sales</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{sales.length} total transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          <MdAdd size={18} />
          <span className="hidden sm:inline">New Sale</span>
          <span className="sm:hidden">Sale</span>
        </button>
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Date & Time', 'Items', 'Supplier', 'Payment', 'Total', 'Action'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading sales...</p>
              </td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-16">
                <MdPointOfSale size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No sales yet</p>
              </td></tr>
            ) : (
              sales.map((sale, i) => (
                <tr key={sale.id}
                  style={{ borderBottom: i < sales.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-sm" style={{ color: '#0f172a' }}>
                      {new Date(sale.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {new Date(sale.date).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {sale.items?.map(item => (
                        <span key={item.id} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: '#f1f5f9', color: '#64748b' }}>
                          {item.product?.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-medium" style={{ color: '#64748b' }}>
                    {sale.supplier?.name || <span style={{ color: '#cbd5e1' }}>CashNorm</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9',
                        color: paymentColors[sale.paymentMethod]?.color || '#64748b'
                      }}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold" style={{ color: '#0f172a' }}>
                    RWF {sale.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => setSelectedSale(sale)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <MdPrint size={14} /> Print
                    </button>
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
            <p style={{ color: '#94a3b8' }}>Loading sales...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <MdPointOfSale size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No sales yet</p>
          </div>
        ) : (
          sales.map(sale => (
            <div key={sale.id} className="bg-white rounded-xl p-4"
              style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

              {/* Top: date + total + print */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-sm" style={{ color: '#0f172a' }}>
                    RWF {sale.totalAmount?.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(sale.date).toLocaleDateString()} · {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9',
                      color: paymentColors[sale.paymentMethod]?.color || '#64748b'
                    }}>
                    {sale.paymentMethod}
                  </span>
                  <button onClick={() => setSelectedSale(sale)}
                    className="p-2 rounded-lg"
                    style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <MdPrint size={16} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex flex-wrap gap-1 mb-2">
                {sale.items?.map(item => (
                  <span key={item.id} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>
                    {item.product?.name} ×{item.quantity}
                  </span>
                ))}
              </div>

              {/* Supplier */}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Supplier: <span style={{ color: '#64748b', fontWeight: 500 }}>
                  {sale.supplier?.name || 'CashNorm'}
                </span>
              </p>
            </div>
          ))
        )}
      </div>

      {/* ── NEW SALE MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          {/* On mobile: slides up from bottom. On desktop: centered */}
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col"
            style={{
              borderRadius: '20px 20px 0 0',
              maxHeight: '92vh'
            }}>

            {/* Drag handle on mobile */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            {/* Modal Header */}
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

            {/* Modal Body — scrollable */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                  Payment Method
                </label>
                <div className="flex gap-2">
                  {['CASH', 'MOMO', 'BANK'].map(method => (
                    <button key={method}
                      onClick={() => setPaymentMethod(method)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: paymentMethod === method
                          ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                          : '#f8fafc',
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
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                  Supplier / Customer
                </label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                  <option value="">-- Select supplier --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Items */}
              <div className="mb-4">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                  Products
                </label>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="flex-1 rounded-xl px-3 py-3 text-sm focus:outline-none"
                        style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#f1f5f9'}>
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (×{p.quantity}) — RWF {p.sellingPrice?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {/* Qty stepper — easier on mobile than typing */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateItem(index, 'quantity', Math.max(1, parseInt(item.quantity || 1) - 1))}
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg"
                          style={{ background: '#f1f5f9', color: '#64748b' }}>
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold" style={{ color: '#0f172a' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(index, 'quantity', parseInt(item.quantity || 1) + 1)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg"
                          style={{ background: '#3b82f6', color: 'white' }}>
                          +
                        </button>
                      </div>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(index)}
                          className="p-2 rounded-xl flex-shrink-0"
                          style={{ color: '#ef4444', background: '#fef2f2' }}>
                          <MdClose size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addItem}
                  className="mt-3 text-xs font-semibold flex items-center gap-1 px-3 py-2 rounded-lg"
                  style={{ color: '#3b82f6', background: '#eff6ff' }}>
                  <MdAdd size={16} /> Add another product
                </button>
              </div>

              {/* Total Preview */}
              {formTotal > 0 && (
                <div className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#64748b' }}>Total Amount</span>
                  <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>
                    RWF {formTotal.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Footer — sticky at bottom */}
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                Complete Sale
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

      {/* Receipt Modal */}
      {selectedSale && (
        <Receipt sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </Layout>
  )
}

export default Sales