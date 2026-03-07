import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const { shopId } = useAuth()
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({
    name: '', category: '', unit: '',
    buyingPrice: '', sellingPrice: '',
    quantity: '', minStock: '', barcode: ''
  })

  const fetchProducts = () => {
   api.get(`/products/shop/${shopId}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSubmit = async () => {
   const payload = { ...form, shopId: shopId }
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setShowForm(false)
      setEditProduct(null)
      setForm({ name: '', category: '', unit: '', buyingPrice: '', sellingPrice: '', quantity: '', minStock: '', barcode: '' })
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name,
      category: product.category,
      unit: product.unit,
      buyingPrice: product.buyingPrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      minStock: product.minStock,
      barcode: product.barcode
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/products/${id}`)
      fetchProducts()
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Products</h1>
        <button
          onClick={() => { setShowForm(true); setEditProduct(null) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <MdAdd size={20} /> Add Product
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Name', key: 'name' },
              { label: 'Category', key: 'category' },
              { label: 'Unit', key: 'unit' },
              { label: 'Buying Price', key: 'buyingPrice' },
              { label: 'Selling Price', key: 'sellingPrice' },
              { label: 'Quantity', key: 'quantity' },
              { label: 'Min Stock', key: 'minStock' },
              { label: 'Barcode', key: 'barcode' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm text-gray-600 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              {editProduct ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditProduct(null) }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Buying Price</th>
              <th className="px-4 py-3">Selling Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Min Stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-6 text-gray-400">Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-6 text-gray-400">No products found</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500">{product.category}</td>
                  <td className="px-4 py-3">RWF {product.buyingPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">RWF {product.sellingPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${product.quantity <= product.minStock ? 'text-red-500' : 'text-green-600'}`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">{product.minStock}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(product)} className="text-blue-500 hover:text-blue-700">
                      <MdEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700">
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}

export default Products