import { useEffect, useState } from 'react'
import api from '../api/api'

function Receipt({ sale, onClose }) {
  const [shop, setShop] = useState(null)

  useEffect(() => {
    api.get(`/shops/${sale.shop?.id || 1}`).then(res => setShop(res.data))
  }, [])

  const handlePrint = () => window.print()

  if (!shop) return null

  const isCancelled = sale.status === 'CANCELLED'

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: fixed; top: 0; left: 0; width: 80mm; }
          .no-print { display: none; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-4 w-80">

          <div className="flex justify-between mb-4 no-print">
            <button onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
              🖨️ Print
            </button>
            <button onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm">
              Close
            </button>
          </div>

          <div id="receipt" className="text-center font-mono text-sm relative">

            {/* CANCELLED watermark */}
            {isCancelled && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '48px', fontWeight: 'bold', color: 'rgba(239,68,68,0.2)',
                pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap'
              }}>
                CANCELLED
              </div>
            )}

            {/* Cancelled banner */}
            {isCancelled && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '4px', marginBottom: '8px' }}>
                <p style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>⚠️ CANCELLED SALE</p>
                {sale.cancelReason && <p style={{ color: '#64748b', fontSize: '10px' }}>Reason: {sale.cancelReason}</p>}
                {sale.cancelledBy && <p style={{ color: '#64748b', fontSize: '10px' }}>By: {sale.cancelledBy.name}</p>}
                {sale.cancelledAt && <p style={{ color: '#64748b', fontSize: '10px' }}>At: {new Date(sale.cancelledAt).toLocaleString()}</p>}
              </div>
            )}

            {shop.logo && (
              <img src={shop.logo} alt="logo" className="w-16 h-16 object-contain mx-auto mb-2" />
            )}

            <p className="font-bold text-base uppercase">{shop.name}</p>
            {shop.address && <p className="text-xs">{shop.address}</p>}
            {shop.phone && <p className="text-xs">Tel: {shop.phone}</p>}
            {shop.email && <p className="text-xs">{shop.email}</p>}
            {shop.tinNumber && <p className="text-xs">TIN: {shop.tinNumber}</p>}

            <div className="border-t border-dashed border-gray-400 my-2" />

            <p className="text-xs text-left">Date: {new Date(sale.date).toLocaleString()}</p>
            <p className="text-xs text-left">Payment: {sale.paymentMethod}</p>
            {sale.user && <p className="text-xs text-left">By: {sale.user.name}</p>}

            <div className="border-t border-dashed border-gray-400 my-2" />

            <table className="w-full text-xs text-left">
              <thead>
                <tr>
                  <th className="pb-1">Item</th>
                  <th className="pb-1 text-center">Qty</th>
                  <th className="pb-1 text-right">Price</th>
                  <th className="pb-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items?.map(item => (
                  <tr key={item.id}>
                    <td className="py-1">{item.product?.name}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">{item.unitPrice?.toLocaleString()}</td>
                    <td className="py-1 text-right">{item.finalSubtotal?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-gray-400 my-2" />

            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span>Discount</span>
                <span>- RWF {sale.discountAmount?.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL</span>
              <span style={{ textDecoration: isCancelled ? 'line-through' : 'none', color: isCancelled ? '#ef4444' : 'inherit' }}>
                RWF {sale.totalAmount?.toLocaleString()}
              </span>
            </div>

            {isCancelled && (
              <div className="flex justify-between font-bold text-sm" style={{ color: '#ef4444' }}>
                <span>REFUNDED</span>
                <span>RWF {sale.totalAmount?.toLocaleString()}</span>
              </div>
            )}

            <div className="border-t border-dashed border-gray-400 my-2" />

            {shop.receiptFooter && (
              <p className="text-xs italic mt-2">{shop.receiptFooter}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">Powered by Innotewo Software Solution</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Receipt