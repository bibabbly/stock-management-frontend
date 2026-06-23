import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAdd, MdClose, MdEdit, MdDelete, MdPayment, MdPeople, MdSearch } from 'react-icons/md'
import Pagination from '../components/Pagination'

function Debts() {
  const { shopId } = useAuth()
  const [debts, setDebts] = useState([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ customerDebt: 0, supplierDebt: 0 })
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  // Modals
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState(null)
  const [payAmount, setPayAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '', debtType: 'CUSTOMER',
    totalAmount: '', paidAmount: '', dueDate: '', note: ''
  })

  const fetchDebts = (pageNum = 0, type = typeFilter, status = statusFilter, size = pageSize) => {
    setLoading(true)
    api.get(`/debts/shop/${shopId}?type=${type}&status=${status}&page=${pageNum}&size=${size}`)
      .then(res => {
        setDebts(res.data.content || [])
        setTotalPages(res.data.totalPages || 0)
        setTotalElements(res.data.totalElements || 0)
        setPage(pageNum)
        setPageSize(size)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }

  const fetchSummary = () => {
    api.get(`/debts/shop/${shopId}/summary`)
      .then(res => setSummary(res.data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchDebts()
    fetchSummary()
  }, [])

  const handleTypeFilter = (type) => {
    setTypeFilter(type)
    fetchDebts(0, type, statusFilter, pageSize)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    fetchDebts(0, typeFilter, status, pageSize)
  }

  const handleAdd = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/debts', {
        shopId,
        ...form,
        totalAmount: parseFloat(form.totalAmount),
        paidAmount: parseFloat(form.paidAmount || 0),
      })
      setShowAddModal(false)
      resetForm()
      fetchDebts()
      fetchSummary()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add debt')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await api.put(`/debts/${selectedDebt.id}`, {
        shopId,
        ...form,
        totalAmount: parseFloat(form.totalAmount),
      })
      setShowEditModal(false)
      resetForm()
      fetchDebts()
      fetchSummary()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update debt')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = async () => {
    if (submitting || !payAmount) return
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/debts/${selectedDebt.id}/payment`, {
        amount: parseFloat(payAmount)
      })
      setShowPayModal(false)
      setPayAmount('')
      fetchDebts()
      fetchSummary()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this debt record?')) return
    await api.delete(`/debts/${id}`)
    fetchDebts()
    fetchSummary()
  }

  const openEdit = (debt) => {
    setSelectedDebt(debt)
    setForm({
      name: debt.name,
      phone: debt.phone || '',
      debtType: debt.debtType,
      totalAmount: debt.totalAmount,
      paidAmount: debt.paidAmount,
      dueDate: debt.dueDate,
      note: debt.note || ''
    })
    setShowEditModal(true)
  }

  const openPay = (debt) => {
    setSelectedDebt(debt)
    setPayAmount('')
    setError('')
    setShowPayModal(true)
  }

  const resetForm = () => {
    setForm({ name: '', phone: '', debtType: 'CUSTOMER', totalAmount: '', paidAmount: '', dueDate: '', note: '' })
    setError('')
    setSelectedDebt(null)
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PAID': return { bg: '#f0fdf4', color: '#16a34a' }
      case 'PARTIAL': return { bg: '#fef3c7', color: '#d97706' }
      default: return { bg: '#fef2f2', color: '#ef4444' }
    }
  }

  const getDueDateStyle = (dueDate, status) => {
    if (status === 'PAID') return { color: '#94a3b8' }
    const today = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { color: '#ef4444', fontWeight: 700 } // overdue
    if (diff <= 1) return { color: '#f97316', fontWeight: 700 } // due tomorrow
    if (diff <= 3) return { color: '#d97706', fontWeight: 600 } // due soon
    return { color: '#64748b' }
  }

  const getDueDateLabel = (dueDate, status) => {
    if (status === 'PAID') return new Date(dueDate).toLocaleDateString()
    const today = new Date()
    const due = new Date(dueDate)
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    if (diff < 0) return `${new Date(dueDate).toLocaleDateString()} (Overdue)`
    if (diff === 0) return `Today!`
    if (diff === 1) return `Tomorrow!`
    return new Date(dueDate).toLocaleDateString()
  }

  const DebtForm = ({ onSubmit, onCancel, title, subtitle }) => (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ borderRadius: '20px 20px 0 0', maxHeight: '92vh' }}>

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
        </div>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>{title}</h2>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{subtitle}</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl"
            style={{ color: '#94a3b8', background: '#f8fafc' }}>
            <MdClose size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>
          )}

          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: '#64748b' }}>Debt Type</label>
            <div className="flex gap-2">
              {[
                { value: 'CUSTOMER', label: '👤 Customer owes me' },
                { value: 'SUPPLIER', label: '🏭 I owe supplier' }
              ].map(t => (
                <button key={t.value} onClick={() => setForm({ ...form, debtType: t.value })}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: form.debtType === t.value ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : '#f8fafc',
                    color: form.debtType === t.value ? 'white' : '#64748b',
                    border: form.debtType === t.value ? 'none' : '2px solid #f1f5f9'
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
              {form.debtType === 'CUSTOMER' ? 'Customer Name' : 'Supplier Name'}
            </label>
            <input type="text" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={form.debtType === 'CUSTOMER' ? 'e.g. John Doe' : 'e.g. Kigali Supplies'}
              className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
              style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Phone</label>
            <input type="text" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              placeholder="e.g. 0788000000"
              className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
              style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
          </div>

          {/* Total Amount */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Total Amount (RWF)</label>
            <input type="number" value={form.totalAmount}
              onChange={e => setForm({ ...form, totalAmount: e.target.value })}
              placeholder="e.g. 50000"
              className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
              style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
          </div>

          {/* Paid Amount — only on Add */}
          {!selectedDebt && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                Already Paid (RWF) — optional
              </label>
              <input type="number" value={form.paidAmount}
                onChange={e => setForm({ ...form, paidAmount: e.target.value })}
                placeholder="e.g. 10000 or leave 0"
                className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
            </div>
          )}

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Due Date</label>
            <input type="date" value={form.dueDate}
              onChange={e => setForm({ ...form, dueDate: e.target.value })}
              className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
              style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>Note (optional)</label>
            <input type="text" value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              placeholder="e.g. For electronics purchased"
              className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
              style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
          <button onClick={onSubmit} disabled={submitting}
            className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
            style={{
              background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}>
            {submitting ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onCancel}
            className="px-5 py-3 rounded-xl font-semibold text-sm"
            style={{ background: '#f1f5f9', color: '#64748b' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Debts</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{totalElements} total records</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true) }}
          className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
          <MdAdd size={18} />
          <span className="hidden sm:inline">Add Debt</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Customers Owe You</p>
          <p className="text-xl font-bold" style={{
            background: 'linear-gradient(135deg, #16a34a, #4ade80)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>RWF {summary.customerDebt?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>You Owe Suppliers</p>
          <p className="text-xl font-bold" style={{
            background: 'linear-gradient(135deg, #ef4444, #f87171)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>RWF {summary.supplierDebt?.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-4"
          style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>Net Position</p>
          <p className="text-xl font-bold" style={{
            background: (summary.customerDebt - summary.supplierDebt) >= 0
              ? 'linear-gradient(135deg, #16a34a, #4ade80)'
              : 'linear-gradient(135deg, #ef4444, #f87171)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>RWF {(summary.customerDebt - summary.supplierDebt)?.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Type filter */}
        {['ALL', 'CUSTOMER', 'SUPPLIER'].map(t => (
          <button key={t} onClick={() => handleTypeFilter(t)}
            className="px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: typeFilter === t ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' : 'white',
              color: typeFilter === t ? 'white' : '#64748b',
              border: typeFilter === t ? 'none' : '1px solid #f1f5f9',
              boxShadow: typeFilter === t ? '0 4px 12px rgba(59,130,246,0.3)' : '0 1px 3px rgba(0,0,0,0.06)'
            }}>
            {t === 'ALL' ? '📋 All' : t === 'CUSTOMER' ? '👤 Customers' : '🏭 Suppliers'}
          </button>
        ))}

        <div style={{ width: '1px', background: '#f1f5f9', margin: '0 4px' }} />

        {/* Status filter */}
        {['ALL', 'PENDING', 'PARTIAL', 'PAID'].map(s => (
          <button key={s} onClick={() => handleStatusFilter(s)}
            className="px-3 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: statusFilter === s ? '#0f172a' : 'white',
              color: statusFilter === s ? 'white' : '#64748b',
              border: statusFilter === s ? 'none' : '1px solid #f1f5f9',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}>
            {s === 'ALL' ? 'All Status' : s === 'PENDING' ? '🔴 Pending' : s === 'PARTIAL' ? '🟡 Partial' : '🟢 Paid'}
          </button>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Name', 'Type', 'Phone', 'Total', 'Paid', 'Remaining', 'Due Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading debts...</p>
              </td></tr>
            ) : debts.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-16">
                <MdPeople size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No debts found</p>
              </td></tr>
            ) : (
              debts.map((debt, i) => {
                const statusStyle = getStatusStyle(debt.status)
                const dueDateStyle = getDueDateStyle(debt.dueDate, debt.status)
                const remaining = debt.totalAmount - debt.paidAmount
                return (
                  <tr key={debt.id}
                    style={{ borderBottom: i < debts.length - 1 ? '1px solid #f8fafc' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{debt.name}</p>
                      {debt.note && <p className="text-xs" style={{ color: '#94a3b8' }}>{debt.note}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: debt.debtType === 'CUSTOMER' ? '#f0fdf4' : '#fef2f2',
                          color: debt.debtType === 'CUSTOMER' ? '#16a34a' : '#ef4444'
                        }}>
                        {debt.debtType === 'CUSTOMER' ? '👤 Customer' : '🏭 Supplier'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>{debt.phone || '—'}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold" style={{ color: '#0f172a' }}>
                      RWF {debt.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: '#16a34a' }}>
                      RWF {debt.paidAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold" style={{ color: '#ef4444' }}>
                      {remaining > 0 ? `RWF ${remaining.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={dueDateStyle}>
                      {getDueDateLabel(debt.dueDate, debt.status)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}>
                        {debt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {debt.status !== 'PAID' && (
                          <button onClick={() => openPay(debt)}
                            className="p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                            style={{ background: '#f0fdf4', color: '#16a34a' }}
                            title="Record Payment">
                            <MdPayment size={14} />
                          </button>
                        )}
                        <button onClick={() => openEdit(debt)}
                          className="p-1.5 rounded-lg"
                          style={{ background: '#eff6ff', color: '#3b82f6' }}
                          title="Edit">
                          <MdEdit size={14} />
                        </button>
                        <button onClick={() => handleDelete(debt.id)}
                          className="p-1.5 rounded-lg"
                          style={{ background: '#fef2f2', color: '#ef4444' }}
                          title="Delete">
                          <MdDelete size={14} />
                        </button>
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
            <p style={{ color: '#94a3b8' }}>Loading debts...</p>
          </div>
        ) : debts.length === 0 ? (
          <div className="text-center py-16">
            <MdPeople size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No debts found</p>
          </div>
        ) : (
          debts.map(debt => {
            const statusStyle = getStatusStyle(debt.status)
            const dueDateStyle = getDueDateStyle(debt.dueDate, debt.status)
            const remaining = debt.totalAmount - debt.paidAmount
            return (
              <div key={debt.id} className="bg-white rounded-xl p-4"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{debt.name}</p>
                    {debt.note && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{debt.note}</p>}
                    {debt.phone && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{debt.phone}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: debt.debtType === 'CUSTOMER' ? '#f0fdf4' : '#fef2f2',
                        color: debt.debtType === 'CUSTOMER' ? '#16a34a' : '#ef4444'
                      }}>
                      {debt.debtType === 'CUSTOMER' ? '👤' : '🏭'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {debt.status}
                    </span>
                  </div>
                </div>

                {/* Amount breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Total</p>
                    <p className="text-sm font-bold" style={{ color: '#0f172a' }}>
                      RWF {debt.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Paid</p>
                    <p className="text-sm font-bold" style={{ color: '#16a34a' }}>
                      RWF {debt.paidAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>Remaining</p>
                    <p className="text-sm font-bold" style={{ color: '#ef4444' }}>
                      {remaining > 0 ? `RWF ${remaining.toLocaleString()}` : '✅'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid #f8fafc' }}>
                  <p className="text-xs font-semibold" style={dueDateStyle}>
                    📅 {getDueDateLabel(debt.dueDate, debt.status)}
                  </p>
                  <div className="flex items-center gap-2">
                    {debt.status !== 'PAID' && (
                      <button onClick={() => openPay(debt)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                        style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <MdPayment size={14} /> Pay
                      </button>
                    )}
                    <button onClick={() => openEdit(debt)}
                      className="p-1.5 rounded-lg"
                      style={{ background: '#eff6ff', color: '#3b82f6' }}>
                      <MdEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(debt.id)}
                      className="p-1.5 rounded-lg"
                      style={{ background: '#fef2f2', color: '#ef4444' }}>
                      <MdDelete size={16} />
                    </button>
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
        onPageChange={(p) => fetchDebts(p, typeFilter, statusFilter, pageSize)}
        onPageSizeChange={(s) => fetchDebts(0, typeFilter, statusFilter, s)}
      />

      {/* Add Modal */}
      {showAddModal && (
        <DebtForm
          title="Add Debt"
          subtitle="Record a new debt"
          onSubmit={handleAdd}
          onCancel={() => { setShowAddModal(false); resetForm() }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <DebtForm
          title="Edit Debt"
          subtitle="Update debt details"
          onSubmit={handleEdit}
          onCancel={() => { setShowEditModal(false); resetForm() }}
        />
      )}

      {/* Payment Modal */}
      {showPayModal && selectedDebt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl shadow-2xl"
            style={{ borderRadius: '20px 20px 0 0' }}>

            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full" style={{ background: '#e2e8f0' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#0f172a' }}>Record Payment</h2>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{selectedDebt.name}</p>
              </div>
              <button onClick={() => setShowPayModal(false)}
                className="p-2 rounded-xl" style={{ color: '#94a3b8', background: '#f8fafc' }}>
                <MdClose size={20} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm">{error}</div>
              )}

              {/* Remaining balance info */}
              <div className="rounded-xl p-3 flex items-center justify-between"
                style={{ background: '#fef2f2' }}>
                <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Remaining Balance</span>
                <span className="text-lg font-bold" style={{ color: '#ef4444' }}>
                  RWF {(selectedDebt.totalAmount - selectedDebt.paidAmount).toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>
                  Payment Amount (RWF)
                </label>
                <input type="number" value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full rounded-xl px-3 py-3 text-sm focus:outline-none"
                  style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
              </div>

              {/* Quick fill buttons */}
              <div className="flex gap-2">
                <button onClick={() => setPayAmount(String(selectedDebt.totalAmount - selectedDebt.paidAmount))}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  Pay Full
                </button>
                <button onClick={() => setPayAmount(String(Math.round((selectedDebt.totalAmount - selectedDebt.paidAmount) / 2)))}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  Pay Half
                </button>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid #f1f5f9' }}>
              <button onClick={handlePayment} disabled={submitting || !payAmount}
                className="flex-1 text-white py-3 rounded-xl font-semibold text-sm"
                style={{
                  background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #34d399)',
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}>
                {submitting ? 'Saving...' : 'Confirm Payment'}
              </button>
              <button onClick={() => setShowPayModal(false)}
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

export default Debts