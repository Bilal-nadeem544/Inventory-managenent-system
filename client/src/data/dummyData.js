
export const kpiData = [
  { label: "Orders Picked", value: 128, change: "+8.2%", trend: "up" },
  { label: "Orders Shipped", value: 96, change: "+4.6%", trend: "up" },
  { label: "Orders Delivered", value: 214, change: "+12.1%", trend: "up" },
  { label: "Invoices Raised", value: 74, change: "-2.3%", trend: "down" },
];

export const salesTrend = [
  { period: "Jan", current: 4200, previous: 3600 },
  { period: "Feb", current: 4800, previous: 4000 },
  { period: "Mar", current: 4600, previous: 4300 },
  { period: "Apr", current: 5400, previous: 4700 },
  { period: "May", current: 5100, previous: 5000 },
  { period: "Jun", current: 6200, previous: 5300 },
  { period: "Jul", current: 6800, previous: 5900 },
];

export const salesByCategory = [
  { name: "Electronics", value: 38 },
  { name: "Clothing", value: 24 },
  { name: "Groceries", value: 18 },
  { name: "Furniture", value: 12 },
  { name: "Other", value: 8 },
];

export const weeklyOrders = [
  { day: "Mon", orders: 22 },
  { day: "Tue", orders: 18 },
  { day: "Wed", orders: 26 },
  { day: "Thu", orders: 30 },
  { day: "Fri", orders: 24 },
  { day: "Sat", orders: 34 },
  { day: "Sun", orders: 15 },
];

export const recentOrders = [
  { id: "ORD-1042", customer: "Ahmed Raza", amount: 12500, status: "Delivered", date: "08-Jul-2026" },
  { id: "ORD-1041", customer: "Sana Malik", amount: 8200, status: "Shipped", date: "08-Jul-2026" },
  { id: "ORD-1040", customer: "Bilal Khan", amount: 15300, status: "Pending", date: "07-Jul-2026" },
  { id: "ORD-1039", customer: "Areeba Fatima", amount: 4600, status: "Picked", date: "07-Jul-2026" },
  { id: "ORD-1038", customer: "Usman Tariq", amount: 9900, status: "Cancelled", date: "06-Jul-2026" },
];

export const lowStockProducts = [
  { name: "Wireless Keyboard", sku: "SKU-2231", quantity: 2, reorderLevel: 10, status: "Low Stock" },
  { name: "27\" Monitor", sku: "SKU-1187", quantity: 0, reorderLevel: 5, status: "Out of Stock" },
  { name: "USB-C Hub", sku: "SKU-3305", quantity: 4, reorderLevel: 15, status: "Low Stock" },
];

export const statusStyles = {
  Delivered: "bg-emerald-50 text-emerald-600",
  Shipped: "bg-blue-50 text-blue-600",
  Picked: "bg-amber-50 text-amber-600",
  Pending: "bg-slate-100 text-slate-600",
  Cancelled: "bg-rose-50 text-rose-600",
  "Low Stock": "bg-amber-50 text-amber-600",
  "Out of Stock": "bg-rose-50 text-rose-600",
};
