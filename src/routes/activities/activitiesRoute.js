const express = require("express");
const router = express.Router();
const activityController = require("../../controllers/actvities/activitiesController");
const verifyCoach = require("../../middlewares/coach/verifyCoach");
const verifyAdmin = require("../../middlewares/admin/adminMiddleWare");
const permissions = require("../../configs/permissionConfig");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

router.post("/add-activities",verifyAdmin(), activityController.addActivityOrSubActivity);

module.exports = router;