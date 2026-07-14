const prisma = require("../config/prisma");
const { getRange, bucketLabel } = require("../utils/dateRanges");

// GET /api/revenue?range=daily|weekly|monthly|yearly|custom&from=&to=
// Only Delivered orders count toward revenue — Pending/Cancelled never do.
async function getRevenue(req, res, next) {
  try {
    const { range = "monthly", from, to } = req.query;
    const { start, end, groupBy } = getRange({ range, from, to });

    const orders = await prisma.order.findMany({
      where: { orderDate: { gte: start, lte: end }, status: "Delivered" },
      orderBy: { orderDate: "asc" },
      include: { items: { include: { product: true } } },
    });

    const buckets = {};
    const bucketOrder = [];
    const categoryTotals = {};

    orders.forEach((o) => {
      const label = bucketLabel(new Date(o.orderDate), groupBy);
      if (!buckets[label]) {
        buckets[label] = { label, revenue: 0 };
        bucketOrder.push(label);
      }
      buckets[label].revenue += o.totalAmount;

      o.items.forEach((item) => {
        const category = item.product?.category || "Other";
        categoryTotals[category] = (categoryTotals[category] || 0) + item.lineTotal;
      });
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    const breakdown = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

    return res.json({
      success: true,
      data: {
        range,
        trend: bucketOrder.map((label) => buckets[label]),
        totalOrders,
        totalRevenue,
        avgOrderValue,
        breakdown,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getRevenue };