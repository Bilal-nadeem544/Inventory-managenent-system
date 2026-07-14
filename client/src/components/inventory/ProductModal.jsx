import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { categories } from "../../data/inventoryData";

const emptyForm = {
  name: "",
  sku: "",
  category: categories[0],
  quantity: "",
  reorderLevel: "",
  unitPrice: "",
  supplier: "",
};

export default function ProductModal({ open, onClose, onSave, product, saving = false }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: product.quantity,
        reorderLevel: product.reorderLevel,
        unitPrice: product.unitPrice,
        supplier: product.supplier || "",
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [product, open]);

  if (!open) return null;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Product name zaroori hai";
    if (!form.sku.trim()) e.sku = "SKU zaroori hai";
    if (form.quantity === "" || Number(form.quantity) < 0) e.quantity = "Valid quantity likhein";
    if (form.reorderLevel === "" || Number(form.reorderLevel) < 0) e.reorderLevel = "Valid reorder level likhein";
    if (form.unitPrice === "" || Number(form.unitPrice) <= 0) e.unitPrice = "Valid price likhein";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      ...product,
      ...form,
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel),
      unitPrice: Number(form.unitPrice),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-md p-6 border border-[#E6D9C3] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#3B2F26]">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="e.g. Wireless Keyboard"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8A7C68]">SKU / Code</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
                placeholder="SKU-0000"
              />
              {errors.sku && <p className="text-xs text-rose-500 mt-1">{errors.sku}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[#8A7C68]">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-[#8A7C68]">Quantity</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              />
              {errors.quantity && <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[#8A7C68]">Reorder Level</label>
              <input
                type="number"
                value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              />
              {errors.reorderLevel && <p className="text-xs text-rose-500 mt-1">{errors.reorderLevel}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[#8A7C68]">Unit Price</label>
              <input
                type="number"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              />
              {errors.unitPrice && <p className="text-xs text-rose-500 mt-1">{errors.unitPrice}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Supplier (optional)</label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => setForm({ ...form, supplier: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="Supplier name"
            />
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
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}