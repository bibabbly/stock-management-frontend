import { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

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

      // Filter by date range on frontend
      const filtered = salesRes.data.filter(sale => {
        const saleDate = new Date(sale.date)
        return saleDate >= new Date(startDate) &&
               saleDate <= new Date(endDate + 'T23:59:59')
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

  const handlePrint = () => window.print()

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-700">Sales Report</h1>
        {searched && sales.length > 0 && (
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

          {/* Print Header - only shows when printing */}
          <style>{`
            @media print {
              .no-print { display: none !important; }
              #report { padding: 20px; }
            }
          `}</style>

          <div className="hidden print:block text-center mb-6">
            {shop?.logo && (
              <img src={shop.logo} alt="logo" className="w-16 h-16 object-contain mx-auto mb-2" />
            )}
            <h2 className="font-bold text-lg uppercase">{shop?.name}</h2>
            <p className="text-sm">{shop?.address} | Tel: {shop?.phone}</p>
            {shop?.tinNumber && <p className="text-sm">TIN: {shop?.tinNumber}</p>}
            <h3 className="font-bold mt-2">SALES REPORT</h3>
            <p className="text-sm">From: {startDate} To: {endDate}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-blue-600">{sales.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Items Sold</p>
              <p className="text-2xl font-bold text-green-600">{totalItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">RWF {totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-6 text-gray-400">No sales found for this period</td></tr>
                ) : (
                  sales.map((sale, index) => (
                    <tr key={sale.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(sale.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {sale.items?.map(item => (
                          <span key={item.id} className="block">
                            {item.product?.name} x{item.quantity}
                          </span>
                        ))}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-blue-600">
                        RWF {sale.totalAmount?.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {sales.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 font-bold text-right">TOTAL REVENUE</td>
                    <td className="px-4 py-3 font-bold text-blue-600">RWF {totalRevenue.toLocaleString()}</td>
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

export default SalesReport