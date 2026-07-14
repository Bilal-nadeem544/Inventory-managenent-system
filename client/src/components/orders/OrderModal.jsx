import { useState, useEffect } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";

export default function OrderModal({ open, onClose, onSave, customers, products, saving }) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);
  const [formError, setFormError] = useState("");

  // Reset form whenever modal is opened fresh
  useEffect(() => {
    if (open) {
      setCustomerId("");
      setItems([{ productId: "", quantity: 1 }]);
      setFormError("");
    }
  }, [open]);

  if (!open) return null;

  function updateItem(index, field, value) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItemRow() {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeItemRow(index) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function getProduct(productId) {
    return products.find((p) => String(p.id) === String(productId));
  }

  const estimatedTotal = items.reduce((sum, item) => {
    const product = getProduct(item.productId);
    const price = product?.price || 0;
    return sum + price * (Number(item.quantity) || 0);
  }, 0);

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!customerId) {
      setFormError("Customer select karein.");
      return;
    }
    const validItems = items.filter((it) => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setFormError("Kam se kam ek product add karein.");
      return;
    }

    const payload = {
      customerId,
      items: validItems.map((it) => ({
        productId: it.productId,
        quantity: Number(it.quantity),
      })),
    };

    onSave(payload);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-lg p-6 border border-[#E6D9C3] shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#3B2F26]">Create Order</h2>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {formError}
            </div>
          )}

          {/* Customer */}
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26]"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[#8A7C68]">Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1 text-xs font-medium text-amber-800 hover:opacity-80"
              >
                <Plus size={14} /> Add item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const product = getProduct(item.productId);
                return (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, "productId", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26]"
                      >
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      {product && (
                        <p className="text-[11px] text-[#B0A48D] mt-1">
                          Rs {product.price?.toLocaleString?.() ?? product.price} · Stock: {product.stock ?? product.quantity ?? "N/A"}
                        </p>
                      )}
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="w-20 px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26]"
                    />
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(index)}
                        className="p-2 text-[#B0A48D] hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated total */}
          <div className="flex items-center justify-between border-t border-[#E6D9C3] pt-3">
            <span className="text-sm font-medium text-[#8A7C68]">Estimated Total</span>
            <span className="text-lg font-semibold text-[#3B2F26]">Rs {estimatedTotal.toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#8A7C68] hover:bg-[#F1E9DC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}