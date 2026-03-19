import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdDelete, MdClose, MdSearch, MdInventory } from 'react-icons/md'

function Products() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const { shopId } = useAuth()
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState({
    name: '', category: '', unit: '',
    buyingPrice: '', sellingPrice: '',
    quantity: '', minStock: '', barcode: ''
  })

  const fetchProducts = () => {
    api.get(`/products/shop/${shopId}`)
      .then(res => { setProducts(res.data); setFiltered(res.data) })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ))
  }, [search, products])

  const openAdd = () => {
    setEditProduct(null)
    setForm({ name: '', category: '', unit: '', buyingPrice: '', sellingPrice: '', quantity: 0, minStock: '', barcode: '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    const payload = { ...form, shopId }
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setShowModal(false)
      setEditProduct(null)
      fetchProducts()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name, category: product.category, unit: product.unit,
      buyingPrice: product.buyingPrice, sellingPrice: product.sellingPrice,
      quantity: product.quantity, minStock: product.minStock, barcode: product.barcode
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await api.delete(`/products/${id}`)
      fetchProducts()
    }
  }

const fields = [
  { label: 'Product Name', key: 'name', col: 2 },
  { label: 'Category', key: 'category' },
  { label: 'Unit (e.g. kg, pcs)', key: 'unit' },
  { label: 'Buying Price (RWF)', key: 'buyingPrice' },
  { label: 'Selling Price (RWF)', key: 'sellingPrice' },
  { label: 'Min Stock', key: 'minStock' },
  { label: 'Barcode', key: 'barcode' },
]

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>Products</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>{products.length} products in inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}
        >
          <MdAdd size={20} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-3"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <MdSearch size={20} style={{ color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search products by name or category..."
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

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Product', 'Category', 'Unit', 'Buying Price', 'Selling Price', 'Stock', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading products...</p>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-16">
                <MdInventory size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No products found</p>
              </td></tr>
            ) : (
              filtered.map((product, i) => (
                <tr key={product.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                        {product.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold" style={{ color: '#0f172a' }}>{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: '#f1f5f9', color: '#64748b' }}>
                      {product.category || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#64748b' }}>{product.unit || '—'}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: '#64748b' }}>
                    RWF {product.buyingPrice?.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: '#0f172a' }}>
                    RWF {product.sellingPrice?.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: product.quantity <= product.minStock ? '#fef2f2' : '#f0fdf4',
                        color: product.quantity <= product.minStock ? '#ef4444' : '#16a34a'
                      }}>
                      {product.quantity} {product.unit || ''}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(product)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#3b82f6', background: '#eff6ff' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                        title="Edit">
                        <MdEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(product.id)}
                        className="p-1.5 rounded-lg transition-all"
                        style={{ color: '#ef4444', background: '#fef2f2' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        title="Delete">
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: '#0f172a' }}>
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {editProduct ? 'Update product details' : 'Fill in the product details below'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl"
                style={{ color: '#94a3b8', background: '#f8fafc' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {fields.map(({ label, key, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-all"
                    style={{
                      border: '2px solid #f1f5f9',
                      color: '#0f172a',
                      background: '#f8fafc'
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'}
                  />
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit}
                className="flex-1 text-white py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                {editProduct ? 'Update Product' : 'Save Product'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm"
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

export default Products