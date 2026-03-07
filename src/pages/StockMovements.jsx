import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'
import { MdAdd } from 'react-icons/md'

function StockMovements() {
    const { shopId } = useAuth() 
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    productId: '', supplierId: '', quantity: '', note: ''
  })

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
        shopId: shopId,
        productId: parseInt(form.productId),
        supplierId: parseInt(form.supplierId),
        quantity: parseInt(form.quantity),
        note: form.note
      })
      setShowForm(false)
      setForm({ productId: '', supplierId: '', quantity: '', note: '' })
      fetchMovements()
    } catch (err) {
      setError('Failed to restock')
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Stock Movements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <MdAdd size={20} /> Restock
        </button>
      </div>

      {/* Restock Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Restock from Supplier</h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product</label>
              <select
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock: {p.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Supplier</label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select supplier</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Note</label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Monthly restock"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleRestock}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Save
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

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">Loading...</td></tr>
            ) : movements.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">No movements found</td></tr>
            ) : (
              movements.map(movement => (
                <tr key={movement.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(movement.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{movement.product?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      movement.type === 'IN'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{movement.quantity}</td>
                  <td className="px-4 py-3 text-gray-500">{movement.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

export default StockMovements