// src/controllers/activities/activitiesController.js
const activityService = require("../../services/activities/activitiesService");
const { logError } = require("../../utils/errorLogger.util");

/**
 * Public: GET /activities
 * Query: ?q=&page=&limit=
 * Returns root activities (layer 1)
 */
async function listRoots(req, res) {
  try {
    const { q, page = 1, limit = 100 } = req.query;
    const docs = await activityService.listRootActivities({ q, page, limit });
    return res.status(200).json({ ok: true, data: docs });
  } catch (err) {
    await logError({
      name: "listRoots_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/**
 * Public: GET /activities/:parentId
 * Returns children of parent
 */
async function listChildren(req, res) {
  try {
    const { parentId } = req.params;
    const docs = await activityService.listSubActivities(parentId);
    return res.status(200).json({ ok: true, data: docs });
  } catch (err) {
    await logError({
      name: "listChildren_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/**
 * Admin-only: POST /activities/admin/add
 * body: { title, parent_id? }
 * Single endpoint to create root or sub-activity
 */
async function addActivity(req, res) {
  try {
    const { title, parent_id } = req.body;
    if (!title)
      return res.status(400).json({ ok: false, message: "title required" });

    let result;
    if (parent_id) {
      result = await activityService.createSubActivity(parent_id, title);
      return res
        .status(201)
        .json({ ok: true, message: "Sub-activity created", data: result });
    } else {
      result = await activityService.createRootActivity(title);
      return res
        .status(201)
        .json({ ok: true, message: "Activity created", data: result });
    }
  } catch (err) {
    await logError({
      name: "addActivity_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(400).json({ ok: false, message: err.message });
  }
}

/**
 * Admin-only: PUT /activities/admin/update/:id
 * body: { title }
 */
async function updateActivity(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title)
      return res.status(400).json({ ok: false, message: "title required" });

    const updated = await activityService.updateActivity(id, title);
    return res
      .status(200)
      .json({ ok: true, message: "Updated", data: updated });
  } catch (err) {
    await logError({
      name: "updateActivity_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(400).json({ ok: false, message: err.message });
  }
}

/**
 * Admin-only: DELETE /activities/admin/delete/:id
 */
async function deleteActivity(req, res) {
  try {
    const { id } = req.params;
    const result = await activityService.deleteActivity(id);
    return res.status(200).json({ ok: true, message: "Deleted", data: result });
  } catch (err) {
    await logError({
      name: "deleteActivity_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(400).json({ ok: false, message: err.message });
  }
}

module.exports = {
  listRoots,
  listChildren,
  addActivity,
  updateActivity,
  deleteActivity,
};
