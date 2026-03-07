import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import { MdAttachMoney, MdPointOfSale, MdInventory, MdPeople, MdWarning, MdTrendingUp } from 'react-icons/md'

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-700">{value}</p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { shopId } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/dashboard/shop/${shopId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout><p className="text-gray-500">Loading...</p></Layout>

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-700 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<MdAttachMoney size={24} className="text-white" />}
          label="Today's Revenue"
          value={`RWF ${data?.todayRevenue?.toLocaleString() || 0}`}
          color="bg-blue-500"
        />
        <StatCard
          icon={<MdPointOfSale size={24} className="text-white" />}
          label="Today's Sales"
          value={data?.todaySalesCount || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={<MdTrendingUp size={24} className="text-white" />}
          label="Today's Profit"
          value={`RWF ${data?.todayProfit?.toLocaleString() || 0}`}
          color="bg-teal-500"
        />
        <StatCard
          icon={<MdInventory size={24} className="text-white" />}
          label="Total Products"
          value={data?.totalProducts || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={<MdPeople size={24} className="text-white" />}
          label="Total Suppliers"
          value={data?.totalSuppliers || 0}
          color="bg-orange-500"
        />
        <StatCard
          icon={<MdTrendingUp size={24} className="text-white" />}
          label="This Month's Profit"
          value={`RWF ${data?.monthProfit?.toLocaleString() || 0}`}
          color="bg-pink-500"
        />
      </div>

      {/* Monthly Revenue & Purchase Cost */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">This Month's Revenue</h2>
          <p className="text-3xl font-bold text-blue-600">
            RWF {data?.monthRevenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">This Month's Purchase Cost</h2>
          <p className="text-3xl font-bold text-red-500">
            RWF {data?.monthPurchaseCost?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {data?.lowStockProducts?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <MdWarning size={22} className="text-red-500" />
            <h2 className="text-lg font-semibold text-gray-700">
              Low Stock Alert ({data.lowStockCount})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Product</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">Quantity</th>
                <th className="pb-2">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockProducts.map(product => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="py-2 font-medium">{product.name}</td>
                  <td className="py-2 text-gray-500">{product.category}</td>
                  <td className="py-2 text-red-500 font-bold">{product.quantity}</td>
                  <td className="py-2">{product.minStock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </Layout>
  )
}

export default Dashboard