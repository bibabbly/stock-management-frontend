import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdPrint, MdShoppingCart, MdCalendarToday } from 'react-icons/md'

function PurchaseReport() {
  const { shopId } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [shop, setShop] = useState(null)

  const fetchReport = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const [movementsRes, shopRes] = await Promise.all([
        api.get(`/stock-movements/shop/${shopId}/type/IN`),
        api.get(`/shops/${shopId}`)
      ])
      setShop(shopRes.data)
      const filtered = movementsRes.data.filter(m => {
        const date = new Date(m.createdAt)
        return date >= new Date(startDate) && date <= new Date(endDate + 'T23:59:59')
      })
      setMovements(filtered)
      setSearched(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0)
  const totalCost = movements.reduce((sum, m) => sum + (m.quantity * (m.product?.buyingPrice || 0)), 0)

  return (
    <Layout>
      <style>{`@media print { .no-print { display: none !important; } #report { padding: 20px; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f172a' }}>Purchase Report</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Track stock purchases and costs by date range</p>
        </div>
        {searched && movements.length > 0 && (
          <button onClick={() => window.print()}
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold no-print"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <MdPrint size={18} /> Print Report
          </button>
        )}
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl p-5 mb-6 no-print"
        style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>From Date</label>
            <div className="relative">
              <MdCalendarToday size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>To Date</label>
            <div className="relative">
              <MdCalendarToday size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ border: '2px solid #f1f5f9', background: '#f8fafc', color: '#0f172a' }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#f1f5f9'} />
            </div>
          </div>
          <button onClick={fetchReport} disabled={loading || !startDate || !endDate}
            className="flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            {loading ? (
              <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Generating...</>
            ) : (
              <><MdShoppingCart size={18} /> Generate Report</>
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
            <h3 className="font-bold mt-2">PURCHASE REPORT</h3>
            <p className="text-sm">From: {startDate} To: {endDate}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Restocks', value: movements.length, color: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
              { label: 'Total Units Received', value: totalQuantity.toLocaleString(), color: 'linear-gradient(135deg, #10b981, #34d399)' },
              { label: 'Total Purchase Cost', value: `RWF ${totalCost.toLocaleString()}`, color: 'linear-gradient(135deg, #ef4444, #f87171)' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-5"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>{card.label}</p>
                <p className="text-2xl font-bold" style={{
                  background: card.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  {['#', 'Date', 'Product', 'Qty', 'Buying Price', 'Total Cost', 'Note'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-16">
                    <MdShoppingCart size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                    <p style={{ color: '#94a3b8' }}>No purchases found for this period</p>
                  </td></tr>
                ) : (
                  movements.map((m, index) => (
                    <tr key={m.id}
                      style={{ borderBottom: index < movements.length - 1 ? '1px solid #f8fafc' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td className="px-5 py-3.5 text-xs font-medium" style={{ color: '#94a3b8' }}>{index + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-sm" style={{ color: '#0f172a' }}>{new Date(m.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>{new Date(m.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                            {m.product?.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: '#0f172a' }}>{m.product?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: '#0f172a' }}>
                        +{m.quantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#64748b' }}>
                        RWF {m.product?.buyingPrice?.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: '#ef4444' }}>
                        RWF {(m.quantity * (m.product?.buyingPrice || 0)).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: '#64748b' }}>
                        {m.note || <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {movements.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'linear-gradient(135deg, #fef2f2, #fce7f3)' }}>
                    <td colSpan="5" className="px-5 py-3 text-sm font-bold text-right" style={{ color: '#64748b' }}>
                      TOTAL PURCHASE COST
                    </td>
                    <td className="px-5 py-3 font-bold text-lg" style={{ color: '#ef4444' }}>
                      RWF {totalCost.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}

export default PurchaseReport