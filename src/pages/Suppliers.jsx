import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md'

function Suppliers() {
  const { shopId } = useAuth()   // ← add this line
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: ''
  })

  const fetchSuppliers = () => {
    api.get(`/suppliers/shop/${shopId}`)
      .then(res => setSuppliers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSuppliers() }, [])

  const handleSubmit = async () => {
    const payload = { ...form, shop: { id: shopId } }
    try {
      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier.id}`, payload)
      } else {
        await api.post('/suppliers', payload)
      }
      setShowForm(false)
      setEditSupplier(null)
      setForm({ name: '', phone: '', email: '', address: '' })
      fetchSuppliers()
    } catch (err) {
      console.error(err)
    }
  }

  const handleEdit = (supplier) => {
    setEditSupplier(supplier)
    setForm({
      name: supplier.name,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      await api.delete(`/suppliers/${id}`)
      fetchSuppliers()
    }
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-700">Suppliers</h1>
        <button
          onClick={() => { setShowForm(true); setEditSupplier(null) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <MdAdd size={20} /> Add Supplier
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Name', key: 'name' },
              { label: 'Phone', key: 'phone' },
              { label: 'Email', key: 'email' },
              { label: 'Address', key: 'address' },
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
              {editSupplier ? 'Update' : 'Save'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditSupplier(null) }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">Loading...</td></tr>
            ) : suppliers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-6 text-gray-400">No suppliers found</td></tr>
            ) : (
              suppliers.map(supplier => (
                <tr key={supplier.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{supplier.name}</td>
                  <td className="px-4 py-3 text-gray-500">{supplier.phone}</td>
                  <td className="px-4 py-3 text-gray-500">{supplier.email}</td>
                  <td className="px-4 py-3 text-gray-500">{supplier.address}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(supplier)} className="text-blue-500 hover:text-blue-700">
                      <MdEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(supplier.id)} className="text-red-500 hover:text-red-700">
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

export default Suppliers