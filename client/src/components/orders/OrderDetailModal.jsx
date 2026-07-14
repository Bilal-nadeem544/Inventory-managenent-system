import { X, Loader2 } from "lucide-react";
import { statusStyles, orderStatuses } from "../../data/ordersData";

export default function OrderDetailModal({ open, order, loading, onClose, onStatusChange }) {
  if (!open || !order) return null;

  const customer = order.customer;
  const total = order.totalAmount ?? 0;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-lg p-6 border border-[#E6D9C3] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#3B2F26]">{order.orderNumber}</h2>
            <p className="text-xs text-[#B0A48D] mt-0.5">{new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-16">
            <Loader2 size={18} className="animate-spin" />
            Loading order...
          </div>
        ) : (
          <>
            <div className="bg-[#F1E9DC] rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-[#3B2F26]">{customer?.name}</p>
              <p className="text-xs text-[#8A7C68] mt-1">{customer?.email}</p>
              <p className="text-xs text-[#8A7C68]">{customer?.phone}</p>
              <p className="text-xs text-[#8A7C68]">{customer?.address}</p>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-[#8A7C68]">Status</label>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className={`mt-1 block w-full px-3 py-2 rounded-lg outline-none text-sm font-medium ${statusStyles[order.status]}`}
              >
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-[#8A7C68] mb-2">Items</p>
              <div className="space-y-2">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#3B2F26]">
                      {item.product?.name || `Product #${item.productId}`} <span className="text-[#B0A48D]">× {item.quantity}</span>
                    </span>
                    <span className="text-[#8A7C68]">Rs {item.lineTotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E6D9C3] pt-3 mt-4">
              <span className="text-sm font-medium text-[#8A7C68]">Order Total</span>
              <span className="text-lg font-semibold text-[#3B2F26]">Rs {total.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
