import { X, Download, CheckCircle2, Loader2 } from "lucide-react";
import { invoiceStatusStyles, invoiceStatuses } from "../../data/invoicesData";

export default function InvoiceDetailModal({ open, invoice, loading, onClose, onStatusChange }) {
  if (!open || !invoice) return null;

  const order = invoice.order;
  const customer = invoice.customer;
  const items = order?.items || [];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-lg p-6 border border-[#E6D9C3] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-[#3B2F26]">{invoice.invoiceNumber}</h2>
            <p className="text-xs text-[#B0A48D] mt-0.5">Order: {order?.orderNumber}</p>
          </div>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-16">
            <Loader2 size={18} className="animate-spin" />
            Loading invoice...
          </div>
        ) : (
          <>
            <div className="bg-[#F1E9DC] rounded-xl p-4 mb-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-[#8A7C68]">Billed To</p>
                <p className="text-sm font-medium text-[#3B2F26] mt-0.5">{customer?.name}</p>
                <p className="text-xs text-[#8A7C68]">{customer?.email}</p>
              </div>
              <div>
                <p className="text-xs text-[#8A7C68]">Issue Date</p>
                <p className="text-sm text-[#3B2F26] mt-0.5">{new Date(invoice.issueDate).toLocaleDateString()}</p>
                <p className="text-xs text-[#8A7C68] mt-1">Due Date</p>
                <p className="text-sm text-[#3B2F26]">{new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-[#8A7C68]">Status</label>
              <select
                value={invoice.status}
                onChange={(e) => onStatusChange(invoice.id, e.target.value)}
                className={`mt-1 block w-full px-3 py-2 rounded-lg outline-none text-sm font-medium ${invoiceStatusStyles[invoice.status]}`}
              >
                {invoiceStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-medium text-[#8A7C68] mb-2">Items</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#3B2F26]">
                      {item.product?.name || `Product #${item.productId}`} <span className="text-[#B0A48D]">× {item.quantity}</span>
                    </span>
                    <span className="text-[#8A7C68]">Rs {item.lineTotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E6D9C3] pt-3 mt-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8A7C68]">Subtotal</span>
                <span className="text-[#3B2F26]">Rs {invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8A7C68]">Tax (5%)</span>
                <span className="text-[#3B2F26]">Rs {invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold pt-1">
                <span className="text-[#3B2F26]">Total</span>
                <span className="text-[#3B2F26]">Rs {invoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-5">
              {invoice.status !== "Paid" && (
                <button
                  onClick={() => onStatusChange(invoice.id, "Paid")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 size={16} />
                  Mark as Paid
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#8A5A2B] bg-[#F0E4CE] hover:opacity-90"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
