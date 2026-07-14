import { X, Loader2 } from "lucide-react";
import { statusStyles } from "../../data/ordersData";

export default function CustomerDetailModal({ open, customer, loading, onClose }) {
  if (!open || !customer) return null;

  const customerOrders = customer.orders || [];
  const totalOrders = customer.totalOrders ?? customerOrders.length;
  const totalSpend = customer.totalSpend ?? 0;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-lg p-6 border border-[#E6D9C3] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#3B2F26]">{customer.name}</h2>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-16">
            <Loader2 size={18} className="animate-spin" />
            Loading customer...
          </div>
        ) : (
          <>
            <div className="bg-[#F1E9DC] rounded-xl p-4 mb-4 space-y-0.5">
              <p className="text-sm text-[#3B2F26]">{customer.email}</p>
              <p className="text-sm text-[#8A7C68]">{customer.phone}</p>
              <p className="text-sm text-[#8A7C68]">{customer.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#F1E9DC] rounded-xl p-3 text-center">
                <p className="text-xs text-[#8A7C68]">Total Orders</p>
                <p className="text-lg font-semibold text-[#3B2F26] mt-1">{totalOrders}</p>
              </div>
              <div className="bg-[#F1E9DC] rounded-xl p-3 text-center">
                <p className="text-xs text-[#8A7C68]">Total Spend</p>
                <p className="text-lg font-semibold text-[#3B2F26] mt-1">Rs {totalSpend.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#8A7C68] mb-2">Order History</p>
              {customerOrders.length === 0 ? (
                <p className="text-sm text-[#B0A48D]">Is customer ka abhi koi order nahi hai.</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm border-b border-[#EFE6D5] pb-2 last:border-0">
                      <div>
                        <p className="text-[#3B2F26] font-medium">{o.orderNumber}</p>
                        <p className="text-xs text-[#B0A48D]">{new Date(o.orderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#8A7C68]">Rs {o.totalAmount.toLocaleString()}</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[o.status]}`}>
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
