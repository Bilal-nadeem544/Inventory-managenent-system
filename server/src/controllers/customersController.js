const prisma = require("../config/prisma");

function computeStats(orders) {
  const totalOrders = orders.length;
  const totalSpend = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  return { totalOrders, totalSpend };
}

// GET /api/customers?search=&page=&limit=
async function listCustomers(req, res, next) {
  try {
    const { search = "", page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { name: "asc" },
        include: { orders: { select: { status: true, totalAmount: true } } },
      }),
      prisma.customer.count({ where }),
    ]);

    const data = customers.map(({ orders, ...customer }) => ({
      ...customer,
      ...computeStats(orders),
    }));

    return res.json({
      success: true,
      data,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/customers/:id  (includes full order history)
async function getCustomer(req, res, next) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        orders: {
          orderBy: { orderDate: "desc" },
          include: { items: { include: { product: true } } },
        },
      },
    });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const { orders, ...rest } = customer;
    const stats = computeStats(orders);

    return res.json({ success: true, data: { ...rest, ...stats, orders } });
  } catch (err) {
    next(err);
  }
}

// POST /api/customers
async function createCustomer(req, res, next) {
  try {
    const { name, email, phone, address } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: "name, email and phone are required" });
    }

    const customer = await prisma.customer.create({
      data: { name, email, phone, address: address || null },
    });

    return res.status(201).json({ success: true, message: "Customer created", data: customer });
  } catch (err) {
    next(err);
  }
}

// PUT /api/customers/:id
async function updateCustomer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const { name, email, phone, address } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
    });

    return res.json({ success: true, message: "Customer updated", data: customer });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/customers/:id
async function deleteCustomer(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    const orderCount = await prisma.order.count({ where: { customerId: id } });
    if (orderCount > 0) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a customer with existing orders",
      });
    }

    await prisma.customer.delete({ where: { id } });
    return res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };