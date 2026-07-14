// Generates a larger synthetic order dataset spanning the last 12 months, used specifically
// to demonstrate Reports & Revenue aggregations with realistic-looking trends.
// Once the backend is ready, this will be replaced by real orders fetched from /api/orders.

const STATUSES = ["Delivered", "Shipped", "Picked", "Pending", "Cancelled"];
const STATUS_WEIGHTS = [0.55, 0.15, 0.1, 0.1, 0.1];

function pickStatus() {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < STATUSES.length; i++) {
    acc += STATUS_WEIGHTS[i];
    if (r <= acc) return STATUSES[i];
  }
  return STATUSES[0];
}

function generateOrders() {
  const orders = [];
  const now = new Date();
  let id = 1;
  for (let daysAgo = 364; daysAgo >= 0; daysAgo--) {
    const date = new Date(now);
    date.setDate(now.getDate() - daysAgo);
    const orderCount = 2 + Math.round(Math.random() * 4);
    for (let i = 0; i < orderCount; i++) {
      const hour = Math.floor(Math.random() * 14) + 8; // 8am - 10pm
      const orderDate = new Date(date);
      orderDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
      const amount = Math.round((1500 + Math.random() * 40000) / 50) * 50;
      orders.push({
        id: id++,
        orderDate: orderDate.toISOString(),
        totalAmount: amount,
        status: pickStatus(),
      });
    }
  }
  return orders;
}

export const dummyOrdersForReports = generateOrders();

// Reusable aggregation function — accepts a date range + grouping strategy and returns
// a trend array plus summary totals. Cancelled orders are excluded from revenue figures.
export function aggregateOrders(orders, { start, end, groupBy }) {
  const inRange = orders.filter((o) => {
    const d = new Date(o.orderDate);
    return d >= start && d < end;
  });

  const buckets = {};
  const labelOrder = [];

  inRange.forEach((o) => {
    const d = new Date(o.orderDate);
    let label;
    if (groupBy === "hour") label = `${d.getHours().toString().padStart(2, "0")}:00`;
    else if (groupBy === "weekday") label = d.toLocaleDateString("en-US", { weekday: "short" });
    else if (groupBy === "day") label = d.getDate().toString();
    else if (groupBy === "month") label = d.toLocaleDateString("en-US", { month: "short" });
    else label = d.toISOString().slice(0, 10);

    if (!buckets[label]) {
      buckets[label] = { label, orderCount: 0, revenue: 0 };
      labelOrder.push(label);
    }
    buckets[label].orderCount += 1;
    if (o.status !== "Cancelled") buckets[label].revenue += o.totalAmount;
  });

  const totalOrders = inRange.length;
  const nonCancelled = inRange.filter((o) => o.status !== "Cancelled");
  const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue = nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0;

  return {
    trend: labelOrder.map((label) => buckets[label]),
    totalOrders,
    totalRevenue,
    avgOrderValue,
  };
}

// Returns { start, end, groupBy } for a named preset, relative to "now".
export function getPresetRange(preset) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 1);
  end.setHours(0, 0, 0, 0);

  let start, groupBy;
  if (preset === "daily") {
    start = new Date(now);
    start.setHours(0, 0, 0, 0);
    groupBy = "hour";
  } else if (preset === "weekly") {
    start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    groupBy = "weekday";
  } else if (preset === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    groupBy = "day";
  } else {
    start = new Date(now.getFullYear(), 0, 1);
    groupBy = "month";
  }
  return { start, end, groupBy };
} 