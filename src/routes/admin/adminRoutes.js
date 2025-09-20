const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin/adminController");
const verifyAdmin = require("../../middlewares/admin/adminMiddleware");

// Public routes
router.post("/login", adminController.login);
router.post("/check-cookie", adminController.checkCookie);
router.post("/logout", adminController.logout);

// Protected routes (permissions optional)
router.post(
  "/add",
  verifyAdmin(["manage-staff", "add-staff"]),
  adminController.addAdmin
);
router.get(
  "/list",
  verifyAdmin(["manage-staff", "view-staff"]),
  adminController.listAdmins
);
router.get(
  "/get/:id",
  verifyAdmin(["manage-staff", "view-staff"]),
  adminController.getAdmin
);
router.put(
  "/update/:id",
  verifyAdmin(["manage-staff", "edit-staff"]),
  adminController.updateAdmin
);
router.delete(
  "/delete/:id",
  verifyAdmin(["manage-staff", "delete-staff"]),
  adminController.deleteAdmin
);

module.exports = router;
