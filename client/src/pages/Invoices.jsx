import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { invoiceStatuses, invoiceStatusStyles } from "../data/invoicesData";
import { fetchInvoices, fetchInvoiceById, createInvoiceRequest, updateInvoiceStatusRequest } from "../api/invoicesApi";
import { fetchOrders } from "../api/ordersApi";
import CreateInvoiceModal from "../components/invoices/CreateInvoiceModal";
import InvoiceDetailModal from "../components/invoices/InvoiceDetailModal";

const PAGE_SIZE = 8;

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [invoicesRes, ordersRes] = await Promise.all([fetchInvoices(), fetchOrders()]);
      setInvoices(invoicesRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invoices load nahi ho sake. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const name = (inv.customer?.name || "").toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        name.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreateInvoice(orderId) {
    setSaving(true);
    setError("");
    try {
      const res = await createInvoiceRequest(orderId);
      setInvoices((prev) => [res.data, ...prev]);
      setCreateOpen(false);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Invoice generate nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(invoice) {
    setDetailLoading(true);
    setSelectedInvoice(invoice);
    try {
      const res = await fetchInvoiceById(invoice.id);
      setSelectedInvoice(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invoice detail load nahi ho saka.");
      setSelectedInvoice(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusChange(invoiceId, newStatus) {
    setError("");
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv)));
    setSelectedInvoice((prev) => (prev && prev.id === invoiceId ? { ...prev, status: newStatus } : prev));
    try {
      const res = await updateInvoiceStatusRequest(invoiceId, newStatus);
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? res.data : inv)));
      setSelectedInvoice((prev) => (prev && prev.id === invoiceId ? { ...prev, ...res.data } : prev));
    } catch (err) {
      setError(err.response?.data?.message || "Status update nahi ho saka.");
      loadAll();
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
          Loading invoices...
        </div>
      ) : (
      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2 bg-[#F1E9DC] rounded-lg px-3 py-2 w-full sm:w-64">
              <Search size={16} className="text-[#B0A48D]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by invoice # or customer..."
                className="bg-transparent outline-none text-sm text-[#3B2F26] placeholder:text-[#B0A48D] w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[#F1E9DC] rounded-lg px-3 py-2 text-sm text-[#3B2F26] outline-none"
            >
              <option value="All">All Statuses</option>
              {invoiceStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 whitespace-nowrap"
          >
            <Plus size={16} />
            Generate Invoice
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#B0A48D] border-b border-[#E6D9C3]">
                <th className="pb-3 font-medium">Invoice #</th>
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Due Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((inv) => (
                <tr key={inv.id} className="border-b border-[#EFE6D5] last:border-0">
                  <td className="py-3 text-[#3B2F26] font-medium whitespace-nowrap">{inv.invoiceNumber}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{inv.order?.orderNumber || "—"}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{inv.customer?.name || "Unknown"}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">Rs {inv.total.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${invoiceStatusStyles[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => openDetail(inv)}
                        className="p-1.5 rounded-lg text-[#8A7C68] hover:bg-[#F1E9DC] hover:text-[#8A5A2B]"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#B0A48D]">
                    Koi invoice nahi mila.
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

      <CreateInvoiceModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateInvoice}
        orders={orders}
        existingOrderIds={invoices.map((i) => i.orderId)}
        saving={saving}
      />

      <InvoiceDetailModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        loading={detailLoading}
        onClose={() => setSelectedInvoice(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
