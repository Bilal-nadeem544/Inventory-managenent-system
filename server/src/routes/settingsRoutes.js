const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/auth");
const { updateProfile, updatePassword } = require("../controllers/settingsController");

router.use(requireAuth);

router.put("/profile", updateProfile);
router.put("/password", updatePassword);

module.exports = router;