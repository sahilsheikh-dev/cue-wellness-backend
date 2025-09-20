const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const verifyAdmin = require("../../middlewares/admin/adminMiddleWare");

// Public routes
router.post("/login", adminController.login);
router.post("/check-cookie", adminController.checkCookie);

// Protected routes
router.post("/add-admin", verifyAdmin, adminController.addAdmin);

module.exports = router;
