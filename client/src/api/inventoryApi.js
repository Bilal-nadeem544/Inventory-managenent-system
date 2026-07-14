import api from "./client";

// GET /api/inventory?search=&category=&page=&limit=
// Fetching with a high limit so the existing client-side search/sort/pagination
// in Inventory.jsx keeps working unchanged against the full product list.
export async function fetchProducts({ search = "", category = "All", limit = 1000 } = {}) {
  const res = await api.get("/inventory", { params: { search, category, limit } });
  return res.data; // { success, data, pagination }
}

export async function createProductRequest(payload) {
  const res = await api.post("/inventory", payload);
  return res.data; // { success, message, data }
}

export async function updateProductRequest(id, payload) {
  const res = await api.put(`/inventory/${id}`, payload);
  return res.data;
}

export async function deleteProductRequest(id) {
  const res = await api.delete(`/inventory/${id}`);
  return res.data;
}
