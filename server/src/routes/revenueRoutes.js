const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { getRevenue } = require("../controllers/revenueController");

router.use(requireAuth);

router.get("/", getRevenue);

module.exports = router;