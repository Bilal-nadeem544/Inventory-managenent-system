const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { listInvoices, getInvoice, createInvoice, updateInvoiceStatus } = require("../controllers/invoicesController");

router.use(requireAuth);

router.get("/", listInvoices);
router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.put("/:id", updateInvoiceStatus);

module.exports = router;