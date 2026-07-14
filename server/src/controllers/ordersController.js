const prisma = require("../config/prisma");

const VALID_STATUSES = ["Pending", "Picked", "Shipped", "Delivered", "Cancelled"];
const FULFILLED_STATUSES = ["Shipped", "Delivered"];

// GET /api/orders?status=&customerId=&from=&to=&page=&limit=
async function listOrders(req, res, next) {
  try {
    const { status = "", customerId = "", from = "", to = "", page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const where = {
      AND: [
        status && status !== "All" ? { status } : {},
        customerId ? { customerId: Number(customerId) } : {},
        from ? { orderDate: { gte: new Date(from) } } : {},
        to ? { orderDate: { lte: new Date(to) } } : {},
      ],
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { orderDate: "desc" },
        include: { customer: true, items: true },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:id
async function getOrder(req, res, next) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        items: { include: { product: true } },
        invoice: true,
      },
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

// POST /api/orders
// Body: { customerId, items: [{ productId, quantity }] }
async function createOrder(req, res, next) {
  try {
    const { customerId, items } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "customerId and at least one item are required" });
    }

    const customer = await prisma.customer.findUnique({ where: { id: Number(customerId) } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const productIds = items.map((it) => Number(it.productId));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: "One or more products not found" });
    }

    const lineItems = items.map((it) => {
      const product = products.find((p) => p.id === Number(it.productId));
      const quantity = Number(it.quantity);
      return {
        productId: product.id,
        quantity,
        unitPrice: product.unitPrice,
        lineTotal: product.unitPrice * quantity,
      };
    });

    const totalAmount = lineItems.reduce((sum, it) => sum + it.lineTotal, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber: "TEMP",
          customerId: Number(customerId),
          status: "Pending",
          totalAmount,
          orderDate: new Date(),
          items: { create: lineItems },
        },
      });

      return tx.order.update({
        where: { id: created.id },
        data: { orderNumber: `ORD-${1000 + created.id}` },
        include: { items: { include: { product: true } }, customer: true },
      });
    });

    return res.status(201).json({ success: true, message: "Order created", data: order });
  } catch (err) {
    next(err);
  }
}

// PUT /api/orders/:id
// Body: { status }
// When status moves into Shipped/Delivered for the first time, stock is decremented.
async function updateOrderStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const wasFulfilled = FULFILLED_STATUSES.includes(order.status);
    const becomesFulfilled = FULFILLED_STATUSES.includes(status);

    const updated = await prisma.$transaction(async (tx) => {
      if (!wasFulfilled && becomesFulfilled) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }
      return tx.order.update({
        where: { id },
        data: { status },
        include: { items: { include: { product: true } }, customer: true },
      });
    });

    return res.json({ success: true, message: "Order updated", data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { listOrders, getOrder, createOrder, updateOrderStatus };