import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

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

      // Filter by date range
      const filtered = movementsRes.data.filter(m => {
        const date = new Date(m.createdAt)
        return date >= new Date(startDate) &&
               date <= new Date(endDate + 'T23:59:59')
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

  const handlePrint = () => window.print()

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-700">Purchase Report</h1>
        {searched && movements.length > 0 && (
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            🖨️ Print Report
          </button>
        )}
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex gap-4 items-end no-print">
        <div>
          <label className="block text-sm text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Generate Report'}
        </button>
      </div>

      {/* Report Content */}
      {searched && (
        <div id="report">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              #report { padding: 20px; }
            }
          `}</style>

          {/* Print Header */}
          <div className="hidden print:block text-center mb-6">
            {shop?.logo && (
              <img src={shop.logo} alt="logo" className="w-16 h-16 object-contain mx-auto mb-2" />
            )}
            <h2 className="font-bold text-lg uppercase">{shop?.name}</h2>
            <p className="text-sm">{shop?.address} | Tel: {shop?.phone}</p>
            {shop?.tinNumber && <p className="text-sm">TIN: {shop?.tinNumber}</p>}
            <h3 className="font-bold mt-2">PURCHASE REPORT</h3>
            <p className="text-sm">From: {startDate} To: {endDate}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Restocks</p>
              <p className="text-2xl font-bold text-blue-600">{movements.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Units Received</p>
              <p className="text-2xl font-bold text-green-600">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Purchase Cost</p>
              <p className="text-2xl font-bold text-purple-600">RWF {totalCost.toLocaleString()}</p>
            </div>
          </div>

          {/* Movements Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Buying Price</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-6 text-gray-400">No purchases found for this period</td></tr>
                ) : (
                  movements.map((m, index) => (
                    <tr key={m.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(m.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium">{m.product?.name}</td>
                      <td className="px-4 py-3">{m.quantity.toLocaleString()}</td>
                      <td className="px-4 py-3">RWF {m.product?.buyingPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-bold text-purple-600">
                        RWF {(m.quantity * (m.product?.buyingPrice || 0)).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{m.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {movements.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="5" className="px-4 py-3 font-bold text-right">TOTAL PURCHASE COST</td>
                    <td className="px-4 py-3 font-bold text-purple-600">RWF {totalCost.toLocaleString()}</td>
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