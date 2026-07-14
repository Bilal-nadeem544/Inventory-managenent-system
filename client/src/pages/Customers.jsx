import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { fetchCustomers, fetchCustomerById, createCustomerRequest, updateCustomerRequest, deleteCustomerRequest } from "../api/customersApi";
import CustomerModal from "../components/customers/CustomerModal";
import CustomerDetailModal from "../components/customers/CustomerDetailModal";
import ConfirmDialog from "../components/inventory/ConfirmDialog";

const PAGE_SIZE = 8;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadCustomers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCustomers();
      setCustomers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Customers load nahi ho sake. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openAddModal() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function openEditModal(customer) {
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  async function handleSave(data) {
    setSaving(true);
    setError("");
    try {
      if (editingCustomer) {
        const res = await updateCustomerRequest(editingCustomer.id, data);
        setCustomers((prev) => prev.map((c) => (c.id === editingCustomer.id ? { ...c, ...res.data } : c)));
      } else {
        const res = await createCustomerRequest(data);
        setCustomers((prev) => [{ ...res.data, totalOrders: 0, totalSpend: 0 }, ...prev]);
        setPage(1);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Customer save nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setError("");
    try {
      await deleteCustomerRequest(deleteTarget.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      // Backend blocks deleting a customer that already has orders — surface that message.
      setError(err.response?.data?.message || "Customer delete nahi ho saka.");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function openDetail(customer) {
    setDetailLoading(true);
    setViewingCustomer(customer);
    try {
      const res = await fetchCustomerById(customer.id);
      setViewingCustomer(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Customer detail load nahi ho saka.");
      setViewingCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm font-medium px-4 py-3 rounded-xl border border-rose-100">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-20">
          <Loader2 size={18} className="animate-spin" />
          Loading customers...
        </div>
      ) : (
      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 bg-[#F1E9DC] rounded-lg px-3 py-2 w-full sm:w-72">
            <Search size={16} className="text-[#B0A48D]" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or phone..."
              className="bg-transparent outline-none text-sm text-[#3B2F26] placeholder:text-[#B0A48D] w-full"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 whitespace-nowrap"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#B0A48D] border-b border-[#E6D9C3]">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone</th>
                <th className="pb-3 font-medium">Total Orders</th>
                <th className="pb-3 font-medium">Total Spend</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((c) => (
                <tr key={c.id} className="border-b border-[#EFE6D5] last:border-0">
                  <td className="py-3 text-[#3B2F26] font-medium whitespace-nowrap">{c.name}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{c.email}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{c.phone}</td>
                  <td className="py-3 text-[#8A7C68]">{c.totalOrders}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">Rs {c.totalSpend.toLocaleString()}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openDetail(c)}
                        className="p-1.5 rounded-lg text-[#8A7C68] hover:bg-[#F1E9DC] hover:text-[#8A5A2B]"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 rounded-lg text-[#8A7C68] hover:bg-[#F1E9DC] hover:text-[#8A5A2B]"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg text-[#8A7C68] hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#B0A48D]">
                    Koi customer nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-5 text-sm text-[#8A7C68]">
          <span>
            Showing {paginated.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-[#F1E9DC]"
            >
              Prev
            </button>
            <span className="px-2">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg disabled:opacity-40 hover:bg-[#F1E9DC]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      )}

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        customer={editingCustomer}
        saving={saving}
      />

      <CustomerDetailModal
        open={!!viewingCustomer}
        customer={viewingCustomer}
        loading={detailLoading}
        onClose={() => setViewingCustomer(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={deleteTarget ? `Kya aap "${deleteTarget.name}" ko delete karna chahte hain? Ye action wapas nahi ho sakta.` : ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
