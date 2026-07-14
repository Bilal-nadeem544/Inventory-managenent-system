const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { listOrders, getOrder, createOrder, updateOrderStatus } = require("../controllers/ordersController");

router.use(requireAuth);

router.get("/", listOrders);
router.get("/:id", getOrder);
router.post("/", createOrder);
router.put("/:id", updateOrderStatus);

module.exports = router;