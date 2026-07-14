export const orderStatuses = ["Pending", "Picked", "Shipped", "Delivered", "Cancelled"];

export const statusStyles = {
  Pending: "bg-slate-100 text-slate-600",
  Picked: "bg-amber-50 text-amber-700",
  Shipped: "bg-blue-50 text-blue-600",
  Delivered: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-rose-50 text-rose-600",
};

export const initialOrders = [
  {
    id: 1,
    orderNumber: "ORD-1042",
    customerId: 1,
    items: [
      { productId: 1, name: "Wireless Keyboard", quantity: 2, unitPrice: 3200 },
      { productId: 10, name: "Wireless Mouse", quantity: 2, unitPrice: 1500 },
    ],
    status: "Delivered",
    orderDate: "2026-07-08",
  },
  {
    id: 2,
    orderNumber: "ORD-1041",
    customerId: 2,
    items: [
      { productId: 13, name: "Bluetooth Speaker", quantity: 1, unitPrice: 5600 },
      { productId: 3, name: "USB-C Hub", quantity: 2, unitPrice: 1800 },
    ],
    status: "Shipped",
    orderDate: "2026-07-08",
  },
  {
    id: 3,
    orderNumber: "ORD-1040",
    customerId: 3,
    items: [
      { productId: 5, name: "Standing Desk", quantity: 1, unitPrice: 42000 },
    ],
    status: "Pending",
    orderDate: "2026-07-07",
  },
  {
    id: 4,
    orderNumber: "ORD-1039",
    customerId: 4,
    items: [
      { productId: 6, name: "Cotton T-Shirt", quantity: 3, unitPrice: 950 },
      { productId: 7, name: "Denim Jeans", quantity: 1, unitPrice: 2800 },
    ],
    status: "Picked",
    orderDate: "2026-07-07",
  },
  {
    id: 5,
    orderNumber: "ORD-1038",
    customerId: 5,
    items: [
      { productId: 9, name: "Cooking Oil 1L", quantity: 5, unitPrice: 650 },
    ],
    status: "Cancelled",
    orderDate: "2026-07-06",
  },
];

export function calcOrderTotal(items) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}