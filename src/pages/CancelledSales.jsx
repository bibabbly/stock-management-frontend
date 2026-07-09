import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdCancel, MdPrint } from 'react-icons/md'
import Receipt from '../components/Receipt'
import Pagination from '../components/Pagination'

function CancelledSales() {
  const { shopId } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)

  const fetchCancelledSales = (pageNum = 0, size = pageSize) => {
    setLoading(true)
    api.get(`/sales/shop/${shopId}/cancelled?page=${pageNum}&size=${size}`)
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

  useEffect(() => { fetchCancelledSales() }, [])

  const paymentColors = {
    CASH: { bg: '#f0fdf4', color: '#16a34a' },
    MOMO: { bg: '#fef3c7', color: '#d97706' },
    BANK: { bg: '#eff6ff', color: '#3b82f6' },
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Cancelled Sales</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>{totalElements} cancelled transactions</p>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              {['Date', 'Items', 'Payment', 'Amount', 'Cancelled By', 'Cancelled At', 'Reason', 'Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#94a3b8' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center py-16">
                <div className="w-8 h-8 rounded-full border-4 border-red-400 border-t-transparent animate-spin mx-auto mb-2" />
                <p style={{ color: '#94a3b8' }}>Loading...</p>
              </td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-16">
                <MdCancel size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No cancelled sales</p>
              </td></tr>
            ) : (
              sales.map((sale, i) => (
                <tr key={sale.id}
                  style={{ borderBottom: i < sales.length - 1 ? '1px solid #f8fafc' : 'none', background: '#fef2f2' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{new Date(sale.date).toLocaleDateString()}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{new Date(sale.date).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {sale.items?.map(item => (
                        <span key={item.id} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: '#f1f5f9', color: '#64748b' }}>
                          {item.product?.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9', color: paymentColors[sale.paymentMethod]?.color || '#64748b' }}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-sm" style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                    RWF {sale.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {sale.cancelledBy?.name || '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {sale.cancelledAt ? new Date(sale.cancelledAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: '#64748b' }}>
                    {sale.cancelReason || '—'}
                  </td>
                  <td className="px-4 py-3.5">
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

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 rounded-full border-4 border-red-400 border-t-transparent animate-spin mx-auto mb-2" />
            <p style={{ color: '#94a3b8' }}>Loading...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16">
            <MdCancel size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
            <p style={{ color: '#94a3b8' }}>No cancelled sales</p>
          </div>
        ) : (
          sales.map(sale => (
            <div key={sale.id} className="rounded-xl p-4"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-sm line-through" style={{ color: '#ef4444' }}>
                      RWF {sale.totalAmount?.toLocaleString()}
                    </p>
                    <span className="px-1.5 py-0.5 rounded text-xs font-bold"
                      style={{ background: '#ef4444', color: 'white' }}>CANCELLED</span>
                  </div>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {new Date(sale.date).toLocaleDateString()} · {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => setSelectedSale(sale)}
                  className="p-2 rounded-lg" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <MdPrint size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {sale.items?.map(item => (
                  <span key={item.id} className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>
                    {item.product?.name} ×{item.quantity}
                  </span>
                ))}
              </div>

              <div className="pt-3 space-y-1" style={{ borderTop: '1px solid #fecaca' }}>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Cancelled by: <span style={{ fontWeight: 600 }}>{sale.cancelledBy?.name || '—'}</span>
                </p>
                {sale.cancelledAt && (
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    At: {new Date(sale.cancelledAt).toLocaleString()}
                  </p>
                )}
                {sale.cancelReason && (
                  <p className="text-xs" style={{ color: '#ef4444' }}>
                    Reason: {sale.cancelReason}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination
        page={page} totalPages={totalPages} totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => fetchCancelledSales(p, pageSize)}
        onPageSizeChange={(s) => fetchCancelledSales(0, s)}
      />

      {selectedSale && <Receipt sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </Layout>
  )
}

export default CancelledSales