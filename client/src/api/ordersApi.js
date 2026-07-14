import api from "./client";

// GET /api/orders?status=&customerId=&from=&to=&page=&limit=
export async function fetchOrders({ status = "All", limit = 1000 } = {}) {
  const res = await api.get("/orders", { params: { status, limit } });
  return res.data; // { success, data, pagination }
}

// GET /api/orders/:id — includes full item->product detail + customer + invoice
export async function fetchOrderById(id) {
  const res = await api.get(`/orders/${id}`);
  return res.data;
}

// POST /api/orders — body: { customerId, items: [{ productId, quantity }] }
// Server looks up current unit prices and computes totals — no pricing sent from client.
export async function createOrderRequest(payload) {
  const res = await api.post("/orders", payload);
  return res.data;
}

// PUT /api/orders/:id — body: { status }
export async function updateOrderStatusRequest(id, status) {
  const res = await api.put(`/orders/${id}`, { status });
  return res.data;
}
