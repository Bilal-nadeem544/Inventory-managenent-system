import api from "./client";

// GET /api/invoices?status=&customerId=&page=&limit=
export async function fetchInvoices({ status = "All", limit = 1000 } = {}) {
  const res = await api.get("/invoices", { params: { status, limit } });
  return res.data; // { success, data, pagination }
}

// GET /api/invoices/:id — includes order.items.product for the line-item breakdown
export async function fetchInvoiceById(id) {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

// POST /api/invoices — body: { orderId }. Server computes subtotal/tax/total/dates.
export async function createInvoiceRequest(orderId) {
  const res = await api.post("/invoices", { orderId });
  return res.data;
}

// PUT /api/invoices/:id — body: { status }
export async function updateInvoiceStatusRequest(id, status) {
  const res = await api.put(`/invoices/${id}`, { status });
  return res.data;
}
