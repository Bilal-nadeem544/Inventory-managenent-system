export const initialCustomers = [
  { id: 1, name: "Ahmed Raza", email: "ahmed.raza@example.com", phone: "0301-1234567", address: "Model Town, Lahore" },
  { id: 2, name: "Sana Malik", email: "sana.malik@example.com", phone: "0322-9876543", address: "DHA Phase 5, Karachi" },
  { id: 3, name: "Bilal Khan", email: "bilal.khan@example.com", phone: "0345-4561230", address: "F-10, Islamabad" },
  { id: 4, name: "Areeba Fatima", email: "areeba.fatima@example.com", phone: "0333-7891234", address: "Gulberg, Lahore" },
  { id: 5, name: "Usman Tariq", email: "usman.tariq@example.com", phone: "0312-3456789", address: "Satellite Town, Rawalpindi" },
  { id: 6, name: "Hina Aslam", email: "hina.aslam@example.com", phone: "0301-9998887", address: "Cantt, Dera Ghazi Khan" },
];

// Computes { totalOrders, totalSpend } for a customer from the orders list.
// Cancelled orders are excluded from totalSpend (but still counted in totalOrders).
export function getCustomerStats(customerId, orders) {
  const customerOrders = orders.filter((o) => o.customerId === customerId);
  const totalOrders = customerOrders.length;
  const totalSpend = customerOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.quantity * it.unitPrice, 0), 0);
  return { totalOrders, totalSpend };
}