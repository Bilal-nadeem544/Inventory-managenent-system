const prisma = require("../config/prisma");
const { getRange, bucketLabel } = require("../utils/dateRanges");

// GET /api/reports?range=daily|weekly|monthly|yearly|custom&from=&to=
async function getReport(req, res, next) {
  try {
    const { range = "weekly", from, to } = req.query;
    const { start, end, groupBy } = getRange({ range, from, to });

    const orders = await prisma.order.findMany({
      where: { orderDate: { gte: start, lte: end } },
      orderBy: { orderDate: "asc" },
    });

    const buckets = {};
    const bucketOrder = [];

    orders.forEach((o) => {
      const label = bucketLabel(new Date(o.orderDate), groupBy);
      if (!buckets[label]) {
        buckets[label] = { label, orderCount: 0, revenue: 0 };
        bucketOrder.push(label);
      }
      buckets[label].orderCount += 1;
      if (o.status !== "Cancelled") buckets[label].revenue += o.totalAmount;
    });

    const totalOrders = orders.length;
    const nonCancelled = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = nonCancelled.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgOrderValue = nonCancelled.length ? Math.round(totalRevenue / nonCancelled.length) : 0;

    return res.json({
      success: true,
      data: {
        range,
        trend: bucketOrder.map((label) => buckets[label]),
        totalOrders,
        totalRevenue,
        avgOrderValue,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReport };