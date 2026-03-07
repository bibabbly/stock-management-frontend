import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdClose } from 'react-icons/md'
import Receipt from '../components/Receipt'

function Sales() {
  const { shopId, userId } = useAuth()
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
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
  }, [])

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1 }])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const handleSubmit = async () => {
    setError('')
    try {
      await api.post('/sales', {
        shopId: shopId,
        userId: userId,
        paymentMethod,
        items: items.map(i => ({
          productId: parseInt(i.productId),
          quantity: parseInt(i.quantity)
        }))
      })
      setShowForm(false)
      setItems([{ productId: '', quantity: 1 }])
      setPaymentMethod('CASH')
      fetchSales()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sale')
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Sales</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <MdAdd size={20} /> New Sale
        </button>
      </div>

      {/* New Sale Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Sale</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          {/* Payment Method */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="CASH">Cash</option>
              <option value="MOMO">MoMo</option>
              <option value="BANK">Bank</option>
            </select>
          </div>

          {/* Items */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">Products</label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 mb-2 items-center">
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, 'productId', e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity}) - RWF {p.sellingPrice?.toLocaleString()}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  className="w-24 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  placeholder="Qty"
                />
                {items.length > 1 && (
                  <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">
                    <MdClose size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addItem}
              className="text-blue-600 text-sm mt-1 hover:underline"
            >
              + Add another product
            </button>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Save Sale
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">Loading...</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">No sales found</td></tr>
            ) : (
              sales.map(sale => (
                <tr key={sale.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(sale.date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {sale.items?.map(item => (
                      <span key={item.id} className="block">
                        {item.product?.name} x{item.quantity}
                      </span>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-blue-600">
                    RWF {sale.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="text-blue-500 hover:text-blue-700 text-xs"
                    >
                      🖨️ Print
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {selectedSale && (
        <Receipt
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}

    </Layout>
  )
}

export default Sales