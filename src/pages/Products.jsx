import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdClose, MdSearch, MdInventory, MdBlock, MdCheckCircle } from 'react-icons/md'
import Pagination from '../components/Pagination'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [submitting, setSubmitting] = useState(false)
  const { shopId } = useAuth()
  const [editProduct, setEditProduct] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [form, setForm] = useState({
    name: '', category: '', unit: '',
    buyingPrice: '', sellingPrice: '',
    quantity: '', minStock: '', barcode: ''
  })

  const fetchProducts = (pageNum = 0, searchVal = '', size = pageSize) => {
    setLoading(true)
    api.get(`/products/shop/${shopId}?page=${pageNum}&size=${size}&search=${searchVal}`)
      .then(res => {
        setProducts(res.data.content)
        setTotalPages(res.data.totalPages)
        setTotalElements(res.data.totalElements)
        setPage(pageNum)
        setPageSize(size)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProducts() }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(0, search, pageSize), 400)
    return () => clearTimeout(timer)
  }, [search])

  const filteredProducts = products.filter(p => {
    if (statusFilter === 'ACTIVE') return p.active !== false
    if (statusFilter === 'INACTIVE') return p.active === false
    return true
  })

  const openAdd = () => {
    setEditProduct(null)
    setForm({ name: '', category: '', unit: '', buyingPrice: '', sellingPrice: '', quantity: 0, minStock: '', barcode: '' })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    const payload = { ...form, shopId }
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setShowModal(false)
      setEditProduct(null)
      fetchProducts(page, search, pageSize)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
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

  const openConfirm = (type, product) => {
    setConfirmAction({ type, product })
    setShowConfirmModal(true)
  }

  const handleDeactivate = (product) => {
    if (product.quantity > 0) {
      setConfirmAction({ type: 'error', product })
      setShowConfirmModal(true)
      return
    }
    openConfirm('deactivate', product)
  }

  const handleReactivate = (product) => {
    openConfirm('reactivate', product)
  }

  const handleConfirm = async () => {
    const { type, product } = confirmAction
    try {
      if (type === 'deactivate') {
        await api.put(`/products/${product.id}/deactivate`)
      } else if (type === 'reactivate') {
        await api.put(`/products/${product.id}/reactivate`)
      }
      setShowConfirmModal(false)
      setConfirmAction(null)
      fetchProducts(page, search, pageSize)
    } catch (err) {
      setShowConfirmModal(false)
      setConfirmAction(null)
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Products</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{totalElements} products in inventory</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <MdAdd size={18} />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl px-4 py-3 mb-4 flex items-center gap-3"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <MdSearch size={20} style={{ color: '#94a3b8' }} />
        <input type="text" placeholder="Search by name or category..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm focus:outline-none" style={{ color: '#0f172a' }} />
        {search && (
          <button onClick={() => setSearch('')} style={{ color: '#94a3b8' }}>
            <MdClose size={18} />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'ALL', label: '📋 All' },
          { value: 'ACTIVE', label: '✅ Active' },
          { value: 'INACTIVE', label: '🚫 Inactive' },
        ].map(tab => (
          <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: statusFilter === tab.value ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'white',
              color: statusFilter === tab.value ? 'white' : '#64748b',
              border: statusFilter === tab.value ? 'none' : '1px solid #f1f5f9',
              boxShadow: statusFilter === tab.value ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.06)'
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Product', 'Category', 'Unit', 'Buying Price', 'Selling Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading products...</p>
              </td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-16">
                <MdInventory size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No products found</p>
              </td></tr>
            ) : (
              filteredProducts.map((product, i) => {
                const isInactive = product.active === false
                return (
                  <tr key={product.id}
                    style={{
                      borderBottom: i < filteredProducts.length - 1 ? '1px solid #f8fafc' : 'none',
                      background: isInactive ? '#f8fafc' : 'white',
                      opacity: isInactive ? 0.7 : 1
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={e => e.currentTarget.style.background = isInactive ? '#f8fafc' : 'white'}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: isInactive ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                          {product.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold" style={{ color: isInactive ? '#94a3b8' : '#0f172a' }}>
                          {product.name}
                        </span>
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
                          background: product.quantity <= (product.minStock || 0) ? '#fef2f2' : '#f0fdf4',
                          color: product.quantity <= (product.minStock || 0) ? '#ef4444' : '#16a34a'
                        }}>
                        {product.quantity} {product.unit || ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: isInactive ? '#f1f5f9' : '#f0fdf4',
                          color: isInactive ? '#94a3b8' : '#16a34a'
                        }}>
                        {isInactive ? '🚫 Inactive' : '✅ Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(product)}
                          className="p-1.5 rounded-lg" style={{ color: '#3b82f6', background: '#eff6ff' }}
                          title="Edit">
                          <MdEdit size={16} />
                        </button>
                        {isInactive ? (
                          <button onClick={() => handleReactivate(product)}
                            className="p-1.5 rounded-lg" style={{ color: '#16a34a', background: '#f0fdf4' }}
                            title="Reactivate">
                            <MdCheckCircle size={16} />
                          </button>
                        ) : (
                          <button onClick={() => handleDeactivate(product)}
                            className="p-1.5 rounded-lg" style={{ color: '#ef4444', background: '#fef2f2' }}
                            title="Deactivate">
                            <MdBlock size={16} />
                          </button>
                        )}
                      </div>
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
            <p style={{ color: '#94a3b8' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <MdInventory size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No products found</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isInactive = product.active === false
            return (
              <div key={product.id} className="bg-white rounded-xl p-4"
                style={{
                  border: isInactive ? '1px solid #e2e8f0' : '1px solid #f1f5f9',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  opacity: isInactive ? 0.75 : 1
                }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: isInactive ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                      {product.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: isInactive ? '#94a3b8' : '#0f172a' }}>
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#f1f5f9', color: '#64748b' }}>
                          {product.category || '—'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: isInactive ? '#f1f5f9' : '#f0fdf4',
                            color: isInactive ? '#94a3b8' : '#16a34a'
                          }}>
                          {isInactive ? '🚫 Inactive' : '✅ Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(product)}
                      className="p-2 rounded-lg" style={{ color: '#3b82f6', background: '#eff6ff' }}>
                      <MdEdit size={16} />
                    </button>
                    {isInactive ? (
                      <button onClick={() => handleReactivate(product)}
                        className="p-2 rounded-lg" style={{ color: '#16a34a', background: '#f0fdf4' }}>
                        <MdCheckCircle size={16} />
                      </button>
                    ) : (
                      <button onClick={() => handleDeactivate(product)}
                        className="p-2 rounded-lg" style={{ color: '#ef4444', background: '#fef2f2' }}>
                        <MdBlock size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3" style={{ borderTop: '1px solid #f8fafc' }}>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Buying</p>
                    <p className="text-xs font-semibold" style={{ color: '#64748b' }}>
                      RWF {product.buyingPrice?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Selling</p>
                    <p className="text-xs font-semibold" style={{ color: '#0f172a' }}>
                      RWF {product.sellingPrice?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Stock</p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: product.quantity <= (product.minStock || 0) ? '#fef2f2' : '#f0fdf4',
                        color: product.quantity <= (product.minStock || 0) ? '#ef4444' : '#16a34a'
                      }}>
                      {product.quantity} {product.unit || ''}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <Pagination
        page={page} totalPages={totalPages} totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => fetchProducts(p, search, pageSize)}
        onPageSizeChange={(s) => fetchProducts(0, search, s)}
      />

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white"
              style={{ borderBottom: '1px solid #f1f5f9', zIndex: 1 }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>
                  {editProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {editProduct ? 'Update product details' : 'Fill in the product details below'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map(({ label, key, col }) => (
                <div key={key} className={col === 2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                    {label}
                  </label>
                  <input type="text" value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: '2px solid #f1f5f9', color: '#0f172a', background: '#f8fafc' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 px-5 py-4 sticky bottom-0 bg-white"
              style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 text-white py-2.5 rounded-xl font-semibold text-sm"
                style={{
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'Saving...' : editProduct ? 'Update Product' : 'Save Product'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: '#f1f5f9', color: '#64748b' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DEACTIVATE/REACTIVATE MODAL */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="px-6 py-6 text-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: confirmAction.type === 'error' ? '#fef3c7' :
                              confirmAction.type === 'deactivate' ? '#fef2f2' : '#f0fdf4'
                }}>
                <span style={{ fontSize: '32px' }}>
                  {confirmAction.type === 'error' ? '⚠️' :
                   confirmAction.type === 'deactivate' ? '🚫' : '✅'}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg font-bold mb-2" style={{ color: '#0f172a' }}>
                {confirmAction.type === 'error' ? 'Cannot Deactivate' :
                 confirmAction.type === 'deactivate' ? 'Deactivate Product' : 'Reactivate Product'}
              </h2>

              {/* Product name badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl mb-3"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                  {confirmAction.product.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                  {confirmAction.product.name}
                </span>
              </div>

              {/* Message */}
              <p className="text-sm mb-1" style={{ color: '#64748b' }}>
                {confirmAction.type === 'error' ?
                  `This product still has ${confirmAction.product.quantity} units in stock.` :
                 confirmAction.type === 'deactivate' ?
                  'This product will be hidden from sales and restock modals.' :
                  'This product will be visible again in sales and restock modals.'}
              </p>
              {confirmAction.type === 'error' && (
                <p className="text-sm font-semibold mt-1" style={{ color: '#d97706' }}>
                  Please do a manual stock out first.
                </p>
              )}
              {confirmAction.type === 'deactivate' && (
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  You can reactivate it anytime from the Products page.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              {confirmAction.type === 'error' ? (
                <button onClick={() => { setShowConfirmModal(false); setConfirmAction(null) }}
                  className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                  Got it
                </button>
              ) : (
                <>
                  <button onClick={handleConfirm}
                    className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                    style={{
                      background: confirmAction.type === 'deactivate'
                        ? 'linear-gradient(135deg, #ef4444, #f87171)'
                        : 'linear-gradient(135deg, #16a34a, #4ade80)'
                    }}>
                    {confirmAction.type === 'deactivate' ? 'Yes, Deactivate' : 'Yes, Reactivate'}
                  </button>
                  <button onClick={() => { setShowConfirmModal(false); setConfirmAction(null) }}
                    className="px-5 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Products