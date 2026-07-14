const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { getReport } = require("../controllers/reportsController");

router.use(requireAuth);

router.get("/", getReport);

module.exports = router;