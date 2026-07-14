import api from "./client";

// GET /api/reports?range=daily|weekly|monthly|yearly|custom&from=&to=
// Returns { range, trend: [{label, orderCount, revenue}], totalOrders, totalRevenue, avgOrderValue }
export async function fetchReport({ range = "weekly", from, to } = {}) {
  const params = { range };
  if (range === "custom") {
    params.from = from;
    params.to = to;
  }
  const res = await api.get("/reports", { params });
  return res.data;
}
