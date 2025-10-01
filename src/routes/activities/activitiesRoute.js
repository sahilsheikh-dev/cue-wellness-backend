// routes/activities/activitiesRoutes.js
const express = require("express");
const router = express.Router();
const activityController = require("../../controllers/activities/activitiesController");
const verifyAdmin = require("../../middlewares/admin/auth.middleware");
const permissions = require("../../configs/permissionConfig");

// Public: view roots or children
router.get("/", activityController.listActivities);

// Admin protected: add (single API will create root or sub depending on parent_id)
router.post("/add", verifyAdmin(permissions["admin:add"]), activityController.addActivityOrSubActivity);

// Admin protected: update title
router.put("/update/:id", verifyAdmin(permissions["admin:update"]), activityController.updateActivity);

// Admin protected: delete
router.delete("/delete/:id", verifyAdmin(permissions["admin:delete"]), activityController.deleteActivity);

module.exports = router;
