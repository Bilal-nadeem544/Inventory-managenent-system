import api from "./client";

// GET /api/revenue?range=daily|weekly|monthly|yearly
// Returns { range, trend: [{label, revenue}], totalOrders, totalRevenue, avgOrderValue, breakdown: [{name, value}] }
// Only Delivered orders count toward revenue.
export async function fetchRevenue({ range = "monthly" } = {}) {
  const res = await api.get("/revenue", { params: { range } });
  return res.data;
}
