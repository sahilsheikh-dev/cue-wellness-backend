// controllers/activities/activitiesController.js
const activityService = require("../../services/activities/activitiesService");
const { logError } = require("../../utils/errorLogger.util");

async function addActivityOrSubActivity(req, res) {
  try {
    const { title, parent_id } = req.body;
    if (!title)
      return res.status(400).json({ ok: false, message: "title required" });
    const result = await activityService.addActivityOrSubActivity(
      title,
      parent_id
    );
    return res.status(201).json({ ok: true, message: "Created", data: result });
  } catch (err) {
    await logError({
      name: "addActivityOrSubActivity_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function listActivities(req, res) {
  try {
    const parentId = req.query.parentId || null;
    if (!parentId) {
      // return root items
      const roots = await activityService.listRootActivities();
      return res.status(200).json({ ok: true, data: roots });
    } else {
      const children = await activityService.listChildren(parentId);
      return res.status(200).json({ ok: true, data: children });
    }
  } catch (err) {
    await logError({
      name: "listActivities_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function updateActivity(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title)
      return res.status(400).json({ ok: false, message: "title required" });
    const updated = await activityService.updateActivity(id, title);
    if (!updated)
      return res.status(404).json({ ok: false, message: "Not found" });
    return res.status(200).json({ ok: true, data: updated });
  } catch (err) {
    await logError({
      name: "updateActivity_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(500).json({ ok: false, message: err.message });
  }
}

async function deleteActivity(req, res) {
  try {
    const { id } = req.params;
    const ok = await activityService.deleteActivity(id);
    if (!ok) return res.status(404).json({ ok: false, message: "Not found" });
    return res.status(200).json({ ok: true, message: "Deleted" });
  } catch (err) {
    await logError({
      name: "deleteActivity_exception",
      file: "controllers/activities/activitiesController.js",
      description: err && err.message ? err.message : String(err),
      section: "activities",
      priority: "high",
    });
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  addActivityOrSubActivity,
  listActivities,
  updateActivity,
  deleteActivity,
};
