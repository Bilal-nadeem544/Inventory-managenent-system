const prisma = require("../config/prisma");

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // move back to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

async function getStats(req, res, next) {
  try {
    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = new Date(thisMonthStart.getFullYear(), thisMonthStart.getMonth() - 1, 1);
    const lastMonthEnd = thisMonthStart;

    function countOrders(status, from, to) {
      return prisma.order.count({
        where: {
          status,
          orderDate: { gte: from, ...(to ? { lt: to } : {}) },
        },
      });
    }

    // --- KPI cards ---
    const [
      pickedThis, pickedLast,
      shippedThis, shippedLast,
      deliveredThis, deliveredLast,
      invoicesThis, invoicesLast,
    ] = await Promise.all([
      countOrders("Picked", thisMonthStart),
      countOrders("Picked", lastMonthStart, lastMonthEnd),
      countOrders("Shipped", thisMonthStart),
      countOrders("Shipped", lastMonthStart, lastMonthEnd),
      countOrders("Delivered", thisMonthStart),
      countOrders("Delivered", lastMonthStart, lastMonthEnd),
      prisma.invoice.count({ where: { createdAt: { gte: thisMonthStart } } }),
      prisma.invoice.count({ where: { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
    ]);

    // --- Weekly Order Volume (Mon-Sun, current week) ---
    const weekStart = startOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const thisWeekOrders = await prisma.order.findMany({
      where: { orderDate: { gte: weekStart, lt: weekEnd } },
      select: { orderDate: true },
    });

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    thisWeekOrders.forEach((o) => {
      const jsDay = new Date(o.orderDate).getDay(); // 0=Sun..6=Sat
      const label = dayLabels[jsDay === 0 ? 6 : jsDay - 1];
      weeklyCounts[label] += 1;
    });
    const weeklyOrders = dayLabels.map((day) => ({ day, orders: weeklyCounts[day] }));

    // --- Recent Orders (last 5) ---
    const recentOrdersRaw = await prisma.order.findMany({
      take: 5,
      orderBy: { orderDate: "desc" },
      include: { customer: true },
    });
    const recentOrders = recentOrdersRaw.map((o) => ({
      id: o.orderNumber,
      customer: o.customer?.name || "Unknown",
      amount: o.totalAmount,
      status: o.status,
    }));

    // --- Low Stock Products (top 5, lowest stock first) ---
    const lowStockRaw = await prisma.$queryRawUnsafe(`
      SELECT id, name, sku, quantity, reorderLevel
      FROM Product
      WHERE quantity <= reorderLevel
      ORDER BY quantity ASC
      LIMIT 5
    `);
    const lowStockProducts = lowStockRaw.map((p) => ({
      sku: p.sku,
      name: p.name,
      quantity: p.quantity,
      status: p.quantity === 0 ? "Out of Stock" : "Low Stock",
    }));

    // --- Sales by Category ---
    const orderItemsWithProduct = await prisma.orderItem.findMany({
      include: { product: { select: { category: true } } },
    });

    const KNOWN_CATEGORIES = ["Electronics", "Clothing", "Groceries", "Furniture"];
    const categoryTotals = { Electronics: 0, Clothing: 0, Groceries: 0, Furniture: 0, Other: 0 };

    orderItemsWithProduct.forEach((item) => {
      const cat = item.product?.category;
      if (KNOWN_CATEGORIES.includes(cat)) {
        categoryTotals[cat] += item.lineTotal;
      } else {
        categoryTotals.Other += item.lineTotal;
      }
    });

    const salesByCategory = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .filter((c) => c.value > 0);

    return res.json({
      success: true,
      data: {
        ordersPicked: { value: pickedThis, change: percentChange(pickedThis, pickedLast) },
        ordersShipped: { value: shippedThis, change: percentChange(shippedThis, shippedLast) },
        ordersDelivered: { value: deliveredThis, change: percentChange(deliveredThis, deliveredLast) },
        invoicesRaised: { value: invoicesThis, change: percentChange(invoicesThis, invoicesLast) },
        weeklyOrders,
        recentOrders,
        lowStockProducts,
        salesByCategory,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };