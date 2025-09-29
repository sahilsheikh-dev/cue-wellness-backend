const activityService = require("../../services/activities/activitiesService");
const otpService = require("../../services/otpService");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const validateInputs = require("../../utils/validateInputs.util");
const Error = require("../../models/errorModel");
const getId = require("../../utils/getId.util");


async function addActivity(req, res) {
  try {
    const { title } = req.body;
    const activities = await activityService.addActivityService(title);
    return res.status(201).send({
      message: "activity added successful",
      data: activities,
    });
  } catch (err) {
    console.error("addActivity error:", err);
    const newError = new Error({
      name: "addActivity error",
      file: "controllers/activities/activitiesController",
      description: "error while adding activities" + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    return res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

async function addSubActivity(req, res) {
  try {
    const { parent_id, title } = req.body;

    if (!parent_id || !title) {
      return res.status(400).json({
        message: "parent_id and title are required",
      });
    }

    const subActivity = await activityService.addSubActivity(parent_id, title);

    res.status(201).json({
      message: "Sub-activity created successfully",
      data: subActivity,
    });
  } catch (err) {
    console.error("addSubActivity error:", err);
    const newError = new Error({
      name: "addSubActivity error",
      file: "controllers/activities/activitiesController",
      description: "error while adding sub-activities" + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    return res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

async function addActivityOrSubActivity(req, res) {
  try {
    const { title, parent_id } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    let result;
    if (parent_id) {
      // add sub-activity
      result = await activityService.addSubActivity(parent_id, title);
      return res.status(201).json({
        message: "Sub-activity created successfully",
        data: result,
      });
    } else {
      // add root activity
      result = await activityService.addActivityService(title);
      return res.status(201).json({
        message: "Activity created successfully",
        data: result,
      });
    }
  } catch (err) {
    console.error("addActivityOrSubActivity error:", err);
    const newError = new Error({
      name: "addActivityOrSubActivity error",
      file: "controllers/activities/activitiesController",
      description: "error while adding activity or sub-activity: " + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    return res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

module.exports = {
    addActivity,
    addSubActivity,
    addActivityOrSubActivity
};