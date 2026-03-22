import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'
import {
  MdAttachMoney, MdPointOfSale, MdInventory,
  MdPeople, MdWarning, MdTrendingUp
} from 'react-icons/md'

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: gradient }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5 leading-tight" style={{ color: '#94a3b8' }}>{label}</p>
        <p className="text-base font-bold truncate" style={{ color: '#0f172a' }}>{value}</p>
      </div>
    </div>
  )
}

function BigCard({ label, value, valueColor, sub }) {
  return (
    <div className="bg-white rounded-xl p-5"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
      <p className="text-sm font-medium mb-2" style={{ color: '#64748b' }}>{label}</p>
      <p className="text-2xl font-bold mb-1" style={{ color: valueColor }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: '#94a3b8' }}>{sub}</p>}
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

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p style={{ color: '#94a3b8' }}>Loading dashboard...</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" style={{ color: '#0f172a' }}>Dashboard</h1>
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today Stats — 2 cols on mobile, 3 on desktop */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Today</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <StatCard
          icon={<MdAttachMoney size={20} className="text-white" />}
          label="Today's Revenue"
          value={`RWF ${data?.todayRevenue?.toLocaleString() || 0}`}
          gradient="linear-gradient(135deg, #3b82f6, #06b6d4)"
        />
        <StatCard
          icon={<MdPointOfSale size={20} className="text-white" />}
          label="Today's Sales"
          value={data?.todaySalesCount || 0}
          gradient="linear-gradient(135deg, #10b981, #34d399)"
        />
        <StatCard
          icon={<MdTrendingUp size={20} className="text-white" />}
          label="Today's Profit"
          value={`RWF ${data?.todayProfit?.toLocaleString() || 0}`}
          gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)"
        />
      </div>

      {/* Overview Stats */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>Overview</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <StatCard
          icon={<MdInventory size={20} className="text-white" />}
          label="Total Products"
          value={data?.totalProducts || 0}
          gradient="linear-gradient(135deg, #f59e0b, #fbbf24)"
        />
        <StatCard
          icon={<MdPeople size={20} className="text-white" />}
          label="Total Suppliers"
          value={data?.totalSuppliers || 0}
          gradient="linear-gradient(135deg, #ec4899, #f472b6)"
        />
        <StatCard
          icon={<MdTrendingUp size={20} className="text-white" />}
          label="Month's Profit"
          value={`RWF ${data?.monthProfit?.toLocaleString() || 0}`}
          gradient="linear-gradient(135deg, #06b6d4, #67e8f9)"
        />
      </div>

      {/* This Month — 2 cols always */}
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#94a3b8' }}>This Month</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <BigCard
          label="Monthly Revenue"
          value={`RWF ${data?.monthRevenue?.toLocaleString() || 0}`}
          valueColor="#3b82f6"
          sub="Total income"
        />
        <BigCard
          label="Purchase Cost"
          value={`RWF ${data?.monthPurchaseCost?.toLocaleString() || 0}`}
          valueColor="#ef4444"
          sub="Stock cost"
        />
      </div>

      {/* Low Stock Alert */}
      {data?.lowStockProducts?.length > 0 && (
        <div className="bg-white rounded-xl p-4"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #fecaca' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#fef2f2' }}>
              <MdWarning size={18} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: '#0f172a' }}>Low Stock Alert</h2>
              <p className="text-xs text-red-500">{data.lowStockCount} product(s) need restocking</p>
            </div>
          </div>

          {/* Table on desktop */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th className="text-left pb-2 text-xs font-semibold" style={{ color: '#94a3b8' }}>Product</th>
                  <th className="text-left pb-2 text-xs font-semibold" style={{ color: '#94a3b8' }}>Category</th>
                  <th className="text-left pb-2 text-xs font-semibold" style={{ color: '#94a3b8' }}>Qty</th>
                  <th className="text-left pb-2 text-xs font-semibold" style={{ color: '#94a3b8' }}>Min Stock</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStockProducts.map(product => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td className="py-2 font-medium" style={{ color: '#0f172a' }}>{product.name}</td>
                    <td className="py-2 text-xs" style={{ color: '#94a3b8' }}>{product.category}</td>
                    <td className="py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: '#fef2f2', color: '#ef4444' }}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-2 text-xs" style={{ color: '#64748b' }}>{product.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on mobile */}
          <div className="md:hidden space-y-2">
            {data.lowStockProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: '#fef2f2' }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{product.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{product.category}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: 'white', color: '#ef4444' }}>
                    Qty: {product.quantity}
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Min: {product.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Dashboard