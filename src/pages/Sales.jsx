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
        shopId,
        userId,
        paymentMethod,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>Sales</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>{sales.length} total transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          <MdAdd size={20} /> New Sale
        </button>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl overflow-hidden"
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
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
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
                        <span key={item.id}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: '#f1f5f9', color: '#64748b' }}>
                          {item.product?.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium" style={{ color: '#64748b' }}>
                      {sale.supplier?.name || (
                        <span style={{ color: '#cbd5e1' }}>CashNorm</span>
                      )}
                    </span>
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
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: '#eff6ff', color: '#3b82f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                      onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                    >
                      <MdPrint size={14} /> Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>New Sale</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>Add products and complete the sale</p>
              </div>
              <button onClick={() => { setShowModal(false); setError('') }}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 max-h-[32rem] overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Payment Method */}
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                  Payment Method
                </label>
                <div className="flex gap-2">
                  {['CASH', 'MOMO', 'BANK'].map(method => (
                    <button key={method}
                      onClick={() => setPaymentMethod(method)}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
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
              <div className="mb-5">
                <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>
                  Supplier / Customer
                </label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
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
                        className="flex-1 rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                        style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.quantity}) — RWF {p.sellingPrice?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number" min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="w-20 rounded-xl px-3 py-2.5 text-sm focus:outline-none text-center"
                        style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                        onFocus={e => e.target.style.borderColor = '#3b82f6'}
                        onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                        placeholder="Qty"
                      />
                      {items.length > 1 && (
                        <button onClick={() => removeItem(index)}
                          className="p-2 rounded-xl"
                          style={{ color: '#ef4444', background: '#fef2f2' }}>
                          <MdClose size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={addItem}
                  className="mt-2 text-xs font-semibold flex items-center gap-1"
                  style={{ color: '#3b82f6' }}>
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

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                Complete Sale
              </button>
              <button onClick={() => { setShowModal(false); setError('') }}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
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