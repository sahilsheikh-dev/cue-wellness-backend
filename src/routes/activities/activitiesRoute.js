// src/routes/activities/activitiesRoutes.js
const express = require("express");
const router = express.Router();

const activityController = require("../../controllers/activities/activitiesController");
const protectAdmin = require("../../middlewares/admin/auth.middleware");
const permissions = require("../../configs/permissionConfig");

// Public routes (view)
router.get("/", activityController.listRoots);
router.get("/:parentId", activityController.listChildren);

// Admin routes (protected by admin permission)
router.post(
  "/admin/add",
  protectAdmin(permissions["activities:add"]),
  activityController.addActivity
);

router.put(
  "/admin/update/:id",
  protectAdmin(permissions["activities:update"]),
  activityController.updateActivity
);

router.delete(
  "/admin/delete/:id",
  protectAdmin(permissions["activities:delete"]),
  activityController.deleteActivity
);

module.exports = router;
