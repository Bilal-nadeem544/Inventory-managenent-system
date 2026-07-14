const prisma = require("../config/prisma");

// GET /api/inventory?search=&category=&page=&limit=
async function listProducts(req, res, next) {
  try {
    const { search = "", category = "", page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search } },
                { sku: { contains: search } },
              ],
            }
          : {},
        category && category !== "All" ? { category } : {},
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      success: true,
      data: products,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/inventory/:id
async function getProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(req.params.id) } });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// POST /api/inventory
async function createProduct(req, res, next) {
  try {
    const { name, sku, category, quantity, reorderLevel, unitPrice, supplier } = req.body;

    if (!name || !sku || !category || unitPrice === undefined) {
      return res.status(400).json({ success: false, message: "name, sku, category and unitPrice are required" });
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return res.status(409).json({ success: false, message: "SKU already exists" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        quantity: Number(quantity) || 0,
        reorderLevel: Number(reorderLevel) || 0,
        unitPrice: Number(unitPrice),
        supplier: supplier || null,
      },
    });

    return res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (err) {
    next(err);
  }
}

// PUT /api/inventory/:id
async function updateProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, sku, category, quantity, reorderLevel, unitPrice, supplier } = req.body;

    if (sku && sku !== existing.sku) {
      const skuTaken = await prisma.product.findUnique({ where: { sku } });
      if (skuTaken) {
        return res.status(409).json({ success: false, message: "SKU already exists" });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(category !== undefined && { category }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(reorderLevel !== undefined && { reorderLevel: Number(reorderLevel) }),
        ...(unitPrice !== undefined && { unitPrice: Number(unitPrice) }),
        ...(supplier !== undefined && { supplier }),
      },
    });

    return res.json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/inventory/:id
async function deleteProduct(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    await prisma.product.delete({ where: { id } });
    return res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };