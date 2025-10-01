// src/services/activities/activitiesService.js
const Activity = require("../../models/activities/activitiesModel");
const mongoose = require("mongoose");

/**
 * Create a root activity (layer 1).
 * Prevent duplicate root title (case-insensitive).
 */
async function createRootActivity(title) {
  if (!title) throw new Error("Title is required");

  const existing = await Activity.findOne({
    layer: 1,
    title: { $regex: new RegExp(`^${escapeRegex(title)}$`, "i") },
  });

  if (existing) throw new Error("Activity already exists");

  const activity = new Activity({
    title: title.trim(),
    layer: 1,
    parent_id: null,
    contains_subactivities: false,
  });

  await activity.save();
  return activity;
}

/**
 * Create a sub-activity under parentId.
 * Prevent duplicate sibling title (case-insensitive).
 * Also set parent's contains_subactivities = true.
 */
async function createSubActivity(parentId, title) {
  if (!parentId) throw new Error("parent_id is required");
  if (!title) throw new Error("Title is required");

  if (!mongoose.Types.ObjectId.isValid(parentId))
    throw new Error("Invalid parent_id");

  const parent = await Activity.findById(parentId);
  if (!parent) throw new Error("Parent activity not found");
  if (parent.layer !== 1)
    throw new Error(
      "Sub-activities must be created under a root (layer 1) activity"
    );

  // prevent duplicate title under same parent
  const exists = await Activity.findOne({
    parent_id: parent._id,
    layer: 2,
    title: { $regex: new RegExp(`^${escapeRegex(title)}$`, "i") },
  });

  if (exists)
    throw new Error("Sub-activity already exists under the same parent");

  const subActivity = new Activity({
    title: title.trim(),
    layer: 2,
    parent_id: parent._id,
    contains_subactivities: false,
  });

  // save sub-activity then set parent flag (in parallel-safe way)
  await subActivity.save();

  if (!parent.contains_subactivities) {
    parent.contains_subactivities = true;
    await parent.save();
  }

  return subActivity;
}

/**
 * List root activities (layer 1)
 */
async function listRootActivities({ q, page = 1, limit = 100 } = {}) {
  const filter = { layer: 1 };
  if (q) filter.title = { $regex: q, $options: "i" };
  const skip = (Number(page) - 1) * Number(limit);
  const docs = await Activity.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ title: 1 })
    .lean();
  return docs;
}

/**
 * List children of a parent
 */
async function listSubActivities(parentId) {
  if (!mongoose.Types.ObjectId.isValid(parentId))
    throw new Error("Invalid parent id");
  const docs = await Activity.find({ parent_id: parentId, layer: 2 })
    .sort({ title: 1 })
    .lean();
  return docs;
}

/**
 * Update activity title by id.
 * Prevent duplicates (same layer + same parent)
 */
async function updateActivity(id, title) {
  if (!id) throw new Error("id required");
  if (!title) throw new Error("title required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");

  const doc = await Activity.findById(id);
  if (!doc) throw new Error("Activity not found");

  // check duplicates in same scope
  const scope = {
    layer: doc.layer,
    title: { $regex: new RegExp(`^${escapeRegex(title)}$`, "i") },
  };
  if (doc.layer === 2) scope.parent_id = doc.parent_id;
  else scope.parent_id = null;

  const existing = await Activity.findOne({ ...scope, _id: { $ne: doc._id } });
  if (existing) throw new Error("Another activity with same title exists");

  doc.title = title.trim();
  await doc.save();
  return doc;
}

/**
 * Delete activity by id.
 * If root -> delete children as well.
 * If child -> remove child and update parent.contains_subactivities if needed.
 */
async function deleteActivity(id) {
  if (!id) throw new Error("id required");
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");

  const doc = await Activity.findById(id);
  if (!doc) throw new Error("Activity not found");

  if (doc.layer === 1) {
    // delete root and its children (layer 2)
    await Activity.deleteMany({
      $or: [{ _id: doc._id }, { parent_id: doc._id }],
    });
    return { deletedRootId: doc._id, deletedChildren: true };
  } else {
    // layer 2 - delete child
    await Activity.findByIdAndDelete(doc._id);

    // check if parent still has any children
    const siblingsCount = await Activity.countDocuments({
      parent_id: doc.parent_id,
    });
    if (siblingsCount === 0) {
      await Activity.findByIdAndUpdate(doc.parent_id, {
        contains_subactivities: false,
      });
    }

    return { deletedChildId: doc._id, parentUpdated: siblingsCount === 0 };
  }
}

/* helpers */
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  createRootActivity,
  createSubActivity,
  listRootActivities,
  listSubActivities,
  updateActivity,
  deleteActivity,
};
