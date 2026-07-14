import api from "./client";

// GET /api/customers?search=&page=&limit=
export async function fetchCustomers({ search = "", limit = 1000 } = {}) {
  const res = await api.get("/customers", { params: { search, limit } });
  return res.data; // { success, data, pagination }
}

// GET /api/customers/:id — includes full order history + computed stats
export async function fetchCustomerById(id) {
  const res = await api.get(`/customers/${id}`);
  return res.data;
}

export async function createCustomerRequest(payload) {
  const res = await api.post("/customers", payload);
  return res.data;
}

export async function updateCustomerRequest(id, payload) {
  const res = await api.put(`/customers/${id}`, payload);
  return res.data;
}

export async function deleteCustomerRequest(id) {
  const res = await api.delete(`/customers/${id}`);
  return res.data;
}
