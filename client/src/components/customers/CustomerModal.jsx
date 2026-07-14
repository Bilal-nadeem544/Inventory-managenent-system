import { useState, useEffect } from "react";
import { X } from "lucide-react";

const emptyForm = { name: "", email: "", phone: "", address: "" };

export default function CustomerModal({ open, onClose, onSave, customer, saving = false }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [customer, open]);

  if (!open) return null;

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Naam zaroori hai";
    if (!form.email.trim()) e.email = "Email zaroori hai";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email likhein";
    if (!form.phone.trim()) e.phone = "Phone number zaroori hai";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ ...customer, ...form });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFDF8] rounded-2xl w-full max-w-md p-6 border border-[#E6D9C3] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-[#3B2F26]">
            {customer ? "Edit Customer" : "Add New Customer"}
          </h2>
          <button onClick={onClose} className="text-[#B0A48D] hover:text-[#6B5D48]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="e.g. Ahmed Raza"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Phone Number</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="03XX-XXXXXXX"
            />
            {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-medium text-[#8A7C68]">Address (optional)</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg bg-[#F1E9DC] outline-none text-sm text-[#3B2F26] focus:ring-2 focus:ring-[#C2793A]"
              placeholder="City, area..."
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
              {saving ? "Saving..." : customer ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}