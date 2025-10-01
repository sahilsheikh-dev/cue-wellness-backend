const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const protect = require("../../middlewares/admin/auth.middleware");
const permissions = require("../../configs/permissionConfig");
const rateLimit = require("express-rate-limit");

// rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT || "10", 10),
  message: { success: false, message: "Too many requests, try again later" },
});

// public
router.post("/login", authLimiter, adminController.login);
router.post("/refresh", adminController.refreshAccessToken); // uses cookie or body refresh token
router.post("/logout", authLimiter, adminController.logout); // logout requires valid access token

// protected - admin management
router.post("/add", protect(permissions["admin:add"]), adminController.addAdmin);
router.get("/list", protect(permissions["admin:list"]), adminController.listAdmins);
router.get("/get/:id", protect(permissions["admin:get"]), adminController.getAdmin);
router.put("/update/:id", protect(permissions["admin:update"]), adminController.updateAdmin);
router.delete("/delete/:id", protect(permissions["admin:delete"]), adminController.deleteAdmin);

module.exports = router;
