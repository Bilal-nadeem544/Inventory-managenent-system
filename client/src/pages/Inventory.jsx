import { useState, useMemo, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, ArrowUpDown, AlertTriangle, Loader2 } from "lucide-react";
import { categories, getStockStatus } from "../data/inventoryData";
import { fetchProducts, createProductRequest, updateProductRequest, deleteProductRequest } from "../api/inventoryApi";
import ProductModal from "../components/inventory/ProductModal";
import ConfirmDialog from "../components/inventory/ConfirmDialog";

const PAGE_SIZE = 8;

const statusStyles = {
  "In Stock": "bg-emerald-50 text-emerald-600",
  "Low Stock": "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-rose-50 text-rose-600",
};

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchProducts();
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Products load nahi ho sake. Backend chal raha hai?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const lowStockCount = products.filter((p) => p.quantity <= p.reorderLevel).length;

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    list.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [products, search, categoryFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function openAddModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleSave(data) {
    setSaving(true);
    setError("");
    try {
      if (editingProduct) {
        const res = await updateProductRequest(editingProduct.id, data);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.data : p)));
      } else {
        const res = await createProductRequest(data);
        setProducts((prev) => [res.data, ...prev]);
        setPage(1);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || "Product save nahi ho saka.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setError("");
    try {
      await deleteProductRequest(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      setError(err.response?.data?.message || "Product delete nahi ho saka.");
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns = [
    { key: "name", label: "Product" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Category" },
    { key: "quantity", label: "Quantity" },
    { key: "reorderLevel", label: "Reorder Level" },
    { key: "unitPrice", label: "Unit Price" },
    { key: "updatedAt", label: "Last Updated" },
  ];

  return (
    <div className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 text-sm font-medium px-4 py-3 rounded-xl border border-rose-100">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-3 rounded-xl border border-amber-100">
          <AlertTriangle size={16} />
          {lowStockCount} product{lowStockCount > 1 ? "s are" : " is"} at or below reorder level — restock soon.
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-[#8A7C68] py-20">
          <Loader2 size={18} className="animate-spin" />
          Loading products...
        </div>
      ) : (
      <div className="bg-[#FFFDF8] rounded-2xl p-5 border border-[#E6D9C3] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="flex items-center gap-2 bg-[#F1E9DC] rounded-lg px-3 py-2 w-full sm:w-64">
              <Search size={16} className="text-[#B0A48D]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name or SKU..."
                className="bg-transparent outline-none text-sm text-[#3B2F26] placeholder:text-[#B0A48D] w-full"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="bg-[#F1E9DC] rounded-lg px-3 py-2 text-sm text-[#3B2F26] outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-br from-amber-800 to-orange-700 hover:opacity-90 whitespace-nowrap"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#B0A48D] border-b border-[#E6D9C3]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="pb-3 font-medium cursor-pointer select-none whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ArrowUpDown size={12} className={sortKey === col.key ? "text-[#8A5A2B]" : "text-[#D6C7A8]"} />
                    </span>
                  </th>
                ))}
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const status = getStockStatus(p.quantity, p.reorderLevel);
                return (
                  <tr key={p.id} className="border-b border-[#EFE6D5] last:border-0">
                    <td className="py-3 text-[#3B2F26] font-medium whitespace-nowrap">{p.name}</td>
                    <td className="py-3 text-[#8A7C68] whitespace-nowrap">{p.sku}</td>
                    <td className="py-3 text-[#8A7C68] whitespace-nowrap">{p.category}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
                        {p.quantity} {status !== "In Stock" ? `· ${status}` : ""}
                      </span>
                    </td>
                    <td className="py-3 text-[#8A7C68]">{p.reorderLevel}</td>
                    <td className="py-3 text-[#8A7C68] whitespace-nowrap">Rs {p.unitPrice.toLocaleString()}</td>
                    <td className="py-3 text-[#8A7C68] whitespace-nowrap">{new Date(p.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg text-[#8A7C68] hover:bg-[#F1E9DC] hover:text-[#8A5A2B]"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-[#8A7C68] hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-8 text-center text-[#B0A48D]">
                    Koi product nahi mila.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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

      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={editingProduct}
        saving={saving}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={deleteTarget ? `Kya aap "${deleteTarget.name}" ko delete karna chahte hain? Ye action wapas nahi ho sakta.` : ""}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}