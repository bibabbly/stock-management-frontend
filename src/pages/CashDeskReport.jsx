import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAssessment, MdCalendarToday, MdPrint, MdPerson } from 'react-icons/md'

function CashDeskReport() {
  const { shopId } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const fetchReport = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const res = await api.get(`/sales/shop/${shopId}/cash-desk?startDate=${startDate}&endDate=${endDate}`)
      setReport(res.data || [])
      setSearched(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = report.reduce((sum, r) => sum + (r.totalRevenue || 0), 0)
  const totalSales = report.reduce((sum, r) => sum + (r.salesCount || 0), 0)
  const totalCash = report.reduce((sum, r) => sum + (r.cashAmount || 0), 0)
  const totalMomo = report.reduce((sum, r) => sum + (r.momoAmount || 0), 0)
  const totalBank = report.reduce((sum, r) => sum + (r.bankAmount || 0), 0)

  return (
    <Layout>
      <style>{`@media print { .no-print { display: none !important; } #report { padding: 20px; } }`}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5 no-print">
        <div>
          <h1 className="text-xl font-bold mb-0.5" style={{ color: '#0f172a' }}>Cash Desk Report</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Sales performance per cashier by date range</p>
        </div>
        {searched && report.length > 0 && (
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-semibold no-print"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            <MdPrint size={16} />
            <span className="hidden sm:inline">Print Report</span>
            <span className="sm:hidden">Print</span>
          </button>
        )}
      </div>

      {/* Date Filter */}
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

      {searched && (
        <div id="report">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            {[
              { label: 'Total Sales', value: totalSales, color: 'linear-gradient(135deg, #3b82f6, #06b6d4)', isNum: true },
              { label: 'Total Revenue', value: `RWF ${totalRevenue.toLocaleString()}`, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
              { label: 'Cash', value: `RWF ${totalCash.toLocaleString()}`, color: 'linear-gradient(135deg, #16a34a, #4ade80)' },
              { label: 'MoMo', value: `RWF ${totalMomo.toLocaleString()}`, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
              { label: 'Bank', value: `RWF ${totalBank.toLocaleString()}`, color: 'linear-gradient(135deg, #06b6d4, #67e8f9)' },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl p-4"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>{card.label}</p>
                <p className="text-base font-bold" style={{
                  background: card.color,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-xl overflow-hidden"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  {['#', 'Cashier', 'Sales', 'Cash', 'MoMo', 'Bank', 'Total Revenue'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-16">
                    <MdPerson size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                    <p style={{ color: '#94a3b8' }}>No sales found for this period</p>
                  </td></tr>
                ) : (
                  report.map((row, index) => (
                    <tr key={row.userId}
                      style={{ borderBottom: index < report.length - 1 ? '1px solid #f8fafc' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <td className="px-4 py-3.5 text-xs font-medium" style={{ color: '#94a3b8' }}>{index + 1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                            {row.userName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: '#0f172a' }}>{row.userName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ background: '#eff6ff', color: '#3b82f6' }}>
                          {Number(row.salesCount).toLocaleString()} sales
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color: '#16a34a' }}>
                        RWF {Number(row.cashAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color: '#d97706' }}>
                        RWF {Number(row.momoAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-sm" style={{ color: '#3b82f6' }}>
                        RWF {Number(row.bankAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-sm" style={{ color: '#0f172a' }}>
                        RWF {Number(row.totalRevenue || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {report.length > 0 && (
                <tfoot>
                  <tr style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)' }}>
                    <td colSpan="2" className="px-4 py-3 text-sm font-bold text-right" style={{ color: '#64748b' }}>TOTALS</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#3b82f6' }}>{totalSales} sales</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#16a34a' }}>RWF {totalCash.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#d97706' }}>RWF {totalMomo.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-bold" style={{ color: '#3b82f6' }}>RWF {totalBank.toLocaleString()}</td>
                    <td className="px-4 py-3 font-bold text-lg" style={{ color: '#8b5cf6' }}>RWF {totalRevenue.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {report.length === 0 ? (
              <div className="text-center py-16">
                <MdPerson size={40} style={{ color: '#e2e8f0', margin: '0 auto 8px' }} />
                <p style={{ color: '#94a3b8' }}>No sales found for this period</p>
              </div>
            ) : (
              <>
                {report.map((row, index) => (
                  <div key={row.userId} className="bg-white rounded-xl p-4"
                    style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                          {row.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{row.userName}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: '#eff6ff', color: '#3b82f6' }}>
                            {Number(row.salesCount)} sales
                          </span>
                        </div>
                      </div>
                      <p className="font-bold text-sm" style={{ color: '#8b5cf6' }}>
                        RWF {Number(row.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3"
                      style={{ borderTop: '1px solid #f8fafc' }}>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>💵 Cash</p>
                        <p className="text-xs font-bold" style={{ color: '#16a34a' }}>
                          RWF {Number(row.cashAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>📱 MoMo</p>
                        <p className="text-xs font-bold" style={{ color: '#d97706' }}>
                          RWF {Number(row.momoAmount || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: '#94a3b8' }}>🏦 Bank</p>
                        <p className="text-xs font-bold" style={{ color: '#3b82f6' }}>
                          RWF {Number(row.bankAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Mobile totals */}
                <div className="rounded-xl p-4 space-y-2"
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #e0f2fe)' }}>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Total Cash</span>
                    <span className="text-xs font-bold" style={{ color: '#16a34a' }}>RWF {totalCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Total MoMo</span>
                    <span className="text-xs font-bold" style={{ color: '#d97706' }}>RWF {totalMomo.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Total Bank</span>
                    <span className="text-xs font-bold" style={{ color: '#3b82f6' }}>RWF {totalBank.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2"
                    style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}>
                    <span className="text-sm font-bold" style={{ color: '#64748b' }}>TOTAL REVENUE</span>
                    <span className="text-lg font-bold" style={{ color: '#8b5cf6' }}>RWF {totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default CashDeskReport