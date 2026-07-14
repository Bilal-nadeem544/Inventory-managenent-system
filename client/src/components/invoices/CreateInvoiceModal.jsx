import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CreateInvoiceModal({ open, onClose, onSave, orders, existingOrderIds, saving = false }) {
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setOrderId("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  const availableOrders = orders.filter(
    (o) => !existingOrderIds.includes(o.id) && o.status !== "Cancelled"
  );

  function handleSubmit(e) {
    e.preventDefault();
    if (!orderId) {
      setError("Order select karein");
      return;
    }
    onSave(Number(orderId));
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-md p-6 border border-[#E6D9C3] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#3B2F26]">Generate Invoice</h2>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Select Order</label>
            <select
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
            >
              <option value="">Choose an order...</option>
              {availableOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} — {o.customer?.name} — Rs {o.totalAmount.toLocaleString()}
                </option>
              ))}
            </select>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            {availableOrders.length === 0 && (
              <p className="text-xs text-[#B0A48D] mt-2">
                Sab orders ke invoices already generate ho chuke hain.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#8A7C68] hover:bg-[#F1E9DC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableOrders.length === 0 || saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-40"
            >
              {saving ? "Generating..." : "Generate Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
