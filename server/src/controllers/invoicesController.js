const prisma = require("../config/prisma");

const VALID_STATUSES = ["Paid", "Unpaid", "Overdue"];
const TAX_RATE = 0.05; // 5%

// GET /api/invoices?status=&customerId=&page=&limit=
async function listInvoices(req, res, next) {
  try {
    const { status = "", customerId = "", page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const where = {
      AND: [
        status && status !== "All" ? { status } : {},
        customerId ? { customerId: Number(customerId) } : {},
      ],
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { issueDate: "desc" },
        include: { customer: true, order: true },
      }),
      prisma.invoice.count({ where }),
    ]);

    return res.json({
      success: true,
      data: invoices,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/invoices/:id
async function getInvoice(req, res, next) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        customer: true,
        order: { include: { items: { include: { product: true } } } },
      },
    });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    return res.json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

// POST /api/invoices
// Body: { orderId }
async function createInvoice(req, res, next) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { items: true, invoice: true },
    });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({ success: false, message: "Cannot invoice a cancelled order" });
    }
    if (order.invoice) {
      return res.status(409).json({ success: false, message: "This order already has an invoice" });
    }

    const subtotal = order.items.reduce((sum, it) => sum + it.lineTotal, 0);
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          invoiceNumber: "TEMP",
          orderId: order.id,
          customerId: order.customerId,
          subtotal,
          tax,
          total,
          status: "Unpaid",
          issueDate,
          dueDate,
        },
      });

      return tx.invoice.update({
        where: { id: created.id },
        data: { invoiceNumber: `INV-${3000 + created.id}` },
        include: { customer: true, order: { include: { items: { include: { product: true } } } } },
      });
    });

    return res.status(201).json({ success: true, message: "Invoice generated", data: invoice });
  } catch (err) {
    next(err);
  }
}

// PUT /api/invoices/:id
// Body: { status }
async function updateInvoiceStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
      include: { customer: true, order: true },
    });

    return res.json({ success: true, message: "Invoice updated", data: invoice });
  } catch (err) {
    next(err);
  }
}

module.exports = { listInvoices, getInvoice, createInvoice, updateInvoiceStatus };