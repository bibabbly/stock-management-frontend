import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdPrint, MdAssessment, MdCalendarToday } from 'react-icons/md'

function SalesReport() {
  const { shopId } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [shop, setShop] = useState(null)

  const fetchReport = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const [salesRes, shopRes] = await Promise.all([
        api.get(`/sales/shop/${shopId}`),
        api.get(`/shops/${shopId}`)
      ])
      setShop(shopRes.data)
      const filtered = salesRes.data.filter(sale => {
        const saleDate = new Date(sale.date)
        return saleDate >= new Date(startDate) && saleDate <= new Date(endDate + 'T23:59:59')
      })
      setSales(filtered)
      setSearched(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0)
  const totalItems = sales.reduce((sum, s) => sum + (s.items?.length || 0), 0)

  const paymentColors = {
    CASH: { bg: '#f0fdf4', color: '#16a34a' },
    MOMO: { bg: '#fef3c7', color: '#d97706' },
    BANK: { bg: '#eff6ff', color: '#3b82f6' },
  }

  return (
    <Layout>
      <style>{`@media print { .no-print { display: none !important; } #report { padding: 20px; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 no-print">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Sales Report</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Generate and print sales reports by date range</p>
        </div>
        {searched && sales.length > 0 && (
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold no-print"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <MdPrint size={16} />
            <span className="hidden sm:inline">Print Report</span>
            <span className="sm:hidden">Print</span>
          </button>
        )}
      </div>

      {/* Date Filter — stacks on mobile */}
      <div className="bg-white rounded-xl p-4 mb-5 no-print"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>From Date</label>
            <div className="relative">
              <MdCalendarToday size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>To Date</label>
            <div className="relative">
              <MdCalendarToday size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-xl text-sm focus:outline-none"
                style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
            </div>
          </div>
          <button onClick={fetchReport} disabled={loading || !startDate || !endDate}
            className="flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            {loading ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating...</>
            ) : (
              <><MdAssessment size={18} /> Generate</>
            )}
          </button>
        </div>
      </div>

      {/* Report Content */}
      {searched && (
        <div id="report">
          {/* Print Header */}
          <div className="hidden print:block text-center mb-6">
            {shop?.logo && <img src={shop.logo} alt="logo" className="w-16 h-16 object-contain mx-auto mb-2" />}
            <h2 className="font-bold text-lg uppercase">{shop?.name}</h2>
            <p className="text-sm">{shop?.address} | Tel: {shop?.phone}</p>
            {shop?.tinNumber && <p className="text-sm">TIN: {shop?.tinNumber}</p>}
            <h3 className="font-bold mt-2">SALES REPORT</h3>
            <p className="text-sm">From: {startDate} To: {endDate}</p>
          </div>

          {/* Summary Cards — 1 col mobile, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Sales', value: sales.length, color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
              { label: 'Total Items Sold', value: totalItems, color: 'linear-gradient(135deg, #10b981, #34d399)' },
              { label: 'Total Revenue', value: `RWF ${totalRevenue.toLocaleString()}`, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex sm:block items-center gap-4"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p className="text-xs font-medium sm:mb-2" style={{ color: '#94a3b8', minWidth: 'fit-content' }}>{card.label}</p>
                <p className="text-xl font-bold" style={{
                  background: card.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  {['#', 'Date & Time', 'Items', 'Payment', 'Total'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-16">
                    <MdAssessment size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                    <p style={{ color: '#94a3b8' }}>No sales found for this period</p>
                  </td></tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.id}
                      style={{ borderBottom: index < sales.length - 1 ? '1px solid #f8fafc' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td className="px-5 py-3.5 text-xs font-medium" style={{ color: '#94a3b8' }}>{index + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{new Date(sale.date).toLocaleDateString()}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{new Date(sale.date).toLocaleTimeString()}</p>
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
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9',
                            color: paymentColors[sale.paymentMethod]?.color || '#64748b'
                          }}>{sale.paymentMethod}</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: '#0f172a' }}>
                        RWF {sale.totalAmount?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {sales.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)' }}>
                    <td colSpan="4" className="px-5 py-3 text-sm font-bold text-right" style={{ color: '#64748b' }}>
                      TOTAL REVENUE
                    </td>
                    <td className="px-5 py-3 font-bold text-lg" style={{ color: '#3b82f6' }}>
                      RWF {totalRevenue.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden space-y-3">
            {sales.length === 0 ? (
              <div className="text-center py-16">
                <MdAssessment size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No sales found for this period</p>
              </div>
            ) : (
              <>
                {sales.map((sale, index) => (
                  <div key={sale.id} className="bg-white rounded-xl p-4"
                    style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#0f172a' }}>
                          RWF {sale.totalAmount?.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                          {new Date(sale.date).toLocaleDateString()} · {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>#{index + 1}</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: paymentColors[sale.paymentMethod]?.bg || '#f1f5f9',
                            color: paymentColors[sale.paymentMethod]?.color || '#64748b'
                          }}>{sale.paymentMethod}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sale.items?.map(item => (
                        <span key={item.id} className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: '#f1f5f9', color: '#64748b' }}>
                          {item.product?.name} ×{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {/* Total footer */}
                <div className="rounded-xl p-4 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)' }}>
                  <span className="text-sm font-bold" style={{ color: '#64748b' }}>TOTAL REVENUE</span>
                  <span className="text-lg font-bold" style={{ color: '#3b82f6' }}>
                    RWF {totalRevenue.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default SalesReport