import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { orderStatuses, statusStyles } from "../data/ordersData";
import { fetchOrders, fetchOrderById, createOrderRequest, updateOrderStatusRequest } from "../api/ordersApi";
import { fetchCustomers } from "../api/customersApi";
import { fetchProducts } from "../api/inventoryApi";
import OrderModal from "../components/orders/OrderModal";
import OrderDetailModal from "../components/orders/OrderDetailModal";

const PAGE_SIZE = 8;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        fetchOrders(),
        fetchCustomers(),
        fetchProducts(),
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Orders load nahi ho sake. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const name = (o.customer?.name || "").toLowerCase();
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        name.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCreateOrder(payload) {
    setSaving(true);
    setError("");
    try {
      const res = await createOrderRequest(payload);
      setOrders((prev) => [res.data, ...prev]);
      setCreateOpen(false);
      setPage(1);
    } catch (err) {
      setError(err.response?.data?.message || "Order create nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  async function openDetail(order) {
    setDetailLoading(true);
    setSelectedOrder({ ...order, _loading: true });
    try {
      const res = await fetchOrderById(order.id);
      setSelectedOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Order detail load nahi ho saka.");
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setError("");
    // Optimistic update so the dropdown feels instant.
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
    try {
      const res = await updateOrderStatusRequest(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? res.data : prev));
    } catch (err) {
      setError(err.response?.data?.message || "Status update nahi ho saka.");
      loadAll(); // revert to server truth on failure
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
          Loading orders...
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
                placeholder="Search by order # or customer..."
                className="bg-transparent outline-none text-sm text-[#3B2F26] placeholder:text-[#B0A48D] w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[#F1E9DC] rounded-lg px-3 py-2 text-sm text-[#3B2F26] outline-none"
            >
              <option value="All">All Statuses</option>
              {orderStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 whitespace-nowrap"
          >
            <Plus size={16} />
            Create Order
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#B0A48D] border-b border-[#E6D9C3]">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o) => (
                <tr key={o.id} className="border-b border-[#EFE6D5] last:border-0">
                  <td className="py-3 text-[#3B2F26] font-medium whitespace-nowrap">{o.orderNumber}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{o.customer?.name || "Unknown"}</td>
                  <td className="py-3 text-[#8A7C68]">{o.items.length} item{o.items.length > 1 ? "s" : ""}</td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">Rs {o.totalAmount.toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 text-[#8A7C68] whitespace-nowrap">{new Date(o.orderDate).toLocaleDateString()}</td>
                  <td className="py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => openDetail(o)}
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
                    Koi order nahi mila.
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

      <OrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateOrder}
        customers={customers}
        products={products}
        saving={saving}
      />

      <OrderDetailModal
        open={!!selectedOrder}
        order={selectedOrder}
        loading={detailLoading}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
