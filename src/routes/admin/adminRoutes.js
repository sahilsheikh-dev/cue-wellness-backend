const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const verifyAdmin = require("../../middlewares/admin/adminMiddleWare");
const permissions = require("../../configs/permissionConfig");

// Public routes
router.post("/login", adminController.login);
router.post("/check-cookie", adminController.checkCookie);
router.post("/logout", adminController.logout);

// Protected routes (permissions optional)

router.post(
  "/add",
  verifyAdmin(permissions["admin:add"]),
  adminController.addAdmin
);
router.get(
  "/list",
  verifyAdmin(permissions["admin:list"]),
  adminController.listAdmins
);
router.get(
  "/get/:id",
  verifyAdmin(permissions["admin:get"]),
  adminController.getAdmin
);
router.put(
  "/update/:id",
  verifyAdmin(permissions["admin:update"]),
  adminController.updateAdmin
);
router.delete(
  "/delete/:id",
  verifyAdmin(permissions["admin:delete"]),
  adminController.deleteAdmin
);

module.exports = router;
