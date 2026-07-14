export const invoiceStatuses = ["Paid", "Unpaid", "Overdue"];

export const invoiceStatusStyles = {
  Paid: "bg-emerald-50 text-emerald-600",
  Unpaid: "bg-amber-50 text-amber-700",
  Overdue: "bg-rose-50 text-rose-600",
};

export const TAX_RATE = 0.05; // 5% tax

export const initialInvoices = [
  {
    id: 1,
    invoiceNumber: "INV-3001",
    orderId: 1,
    customerId: 1,
    status: "Paid",
    issueDate: "2026-07-08",
    dueDate: "2026-07-15",
  },
  {
    id: 2,
    invoiceNumber: "INV-3002",
    orderId: 2,
    customerId: 2,
    status: "Unpaid",
    issueDate: "2026-07-08",
    dueDate: "2026-07-15",
  },
  {
    id: 3,
    invoiceNumber: "INV-3003",
    orderId: 5,
    customerId: 5,
    status: "Overdue",
    issueDate: "2026-06-20",
    dueDate: "2026-06-27",
  },
];

// Computes subtotal, tax and total for an order's line items.
export function calcInvoiceAmounts(items) {
  const subtotal = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}