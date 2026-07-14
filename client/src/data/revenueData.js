export const categoryWeights = [
  { name: "Electronics", weight: 0.38, color: "#92400E" },
  { name: "Clothing", weight: 0.24, color: "#C2793A" },
  { name: "Groceries", weight: 0.18, color: "#D9A441" },
  { name: "Furniture", weight: 0.12, color: "#7C9070" },
  { name: "Other", weight: 0.08, color: "#D6C7A8" },
];

export function getDeliveredOrders(orders) {
  return orders.filter((o) => o.status === "Delivered");
}

export function getCategoryBreakdown(totalRevenue) {
  return categoryWeights.map((c) => ({
    name: c.name,
    value: Math.round(totalRevenue * c.weight),
    color: c.color,
  }));
}