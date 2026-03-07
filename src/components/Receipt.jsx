import { useEffect, useState } from 'react'
import api from '../api/api'

function Receipt({ sale, onClose }) {
  const [shop, setShop] = useState(null)

  useEffect(() => {
    api.get('/shops/1').then(res => setShop(res.data))
  }, [])

  const handlePrint = () => {
    window.print()
  }

  if (!shop) return null

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: fixed; top: 0; left: 0; width: 80mm; }
          .no-print { display: none; }
        }
      `}</style>

      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print-overlay">
        <div className="bg-white rounded-lg shadow-lg p-4 w-80">

          {/* Buttons */}
          <div className="flex justify-between mb-4 no-print">
            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
            >
              Close
            </button>
          </div>

          {/* Receipt Content */}
          <div id="receipt" className="text-center font-mono text-sm">

            {/* Logo */}
            {shop.logo && (
              <img
                src={shop.logo}
                alt="logo"
                className="w-16 h-16 object-contain mx-auto mb-2"
              />
            )}

            {/* Shop Info */}
            <p className="font-bold text-base uppercase">{shop.name}</p>
            {shop.address && <p className="text-xs">{shop.address}</p>}
            {shop.phone && <p className="text-xs">Tel: {shop.phone}</p>}
            {shop.email && <p className="text-xs">{shop.email}</p>}
            {shop.tinNumber && <p className="text-xs">TIN: {shop.tinNumber}</p>}

            <div className="border-t border-dashed border-gray-400 my-2" />

            {/* Sale Info */}
            <p className="text-xs text-left">Date: {new Date(sale.date).toLocaleString()}</p>
            <p className="text-xs text-left">Payment: {sale.paymentMethod}</p>

            <div className="border-t border-dashed border-gray-400 my-2" />

            {/* Items */}
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
                    <td className="py-1 text-right">{item.subtotal?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-dashed border-gray-400 my-2" />

            {/* Total */}
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL</span>
              <span>RWF {sale.totalAmount?.toLocaleString()}</span>
            </div>

            <div className="border-t border-dashed border-gray-400 my-2" />

            {/* Footer */}
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