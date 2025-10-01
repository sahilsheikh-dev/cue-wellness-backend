// services/activities/activitiesService.js
const Activity = require("../../models/activities/activitiesModel");

/**
 * Add root activity
 */
async function addActivityService(title) {
  if (!title) throw new Error("title required");
  const exists = await Activity.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") },
    layer: 1,
  });
  if (exists) throw new Error("Activity already exists");
  const a = new Activity({ title, layer: 1, contains_subtopic: false });
  await a.save();
  return a;
}

/**
 * Add sub activity under parentId
 */
async function addSubActivity(parentId, title) {
  const parent = await Activity.findById(parentId);
  if (!parent) throw new Error("Parent activity not found");

  const exists = await Activity.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") },
    parent_id: parentId,
    layer: 2,
  });
  if (exists)
    throw new Error("This sub-activity already exists under the same parent");

  const subActivity = new Activity({
    layer: 2,
    title,
    parent_id: parentId,
    contains_subtopic: false,
  });

  // mark parent contains_subtopic
  if (!parent.contains_subtopic) {
    parent.contains_subtopic = true;
    await parent.save();
  }

  await subActivity.save();
  return subActivity;
}

/**
 * Add either root or sub depending on parent_id param
 */
async function addActivityOrSubActivity(title, parent_id) {
  if (parent_id) return addSubActivity(parent_id, title);
  return addActivityService(title);
}

/**
 * List root activities
 */
async function listRootActivities() {
  return Activity.find({ layer: 1 }).sort({ title: 1 }).lean();
}

/**
 * List children for a parent
 */
async function listChildren(parentId) {
  return Activity.find({ parent_id: parentId }).sort({ title: 1 }).lean();
}

/**
 * Update activity title by id
 */
async function updateActivity(id, title) {
  const updated = await Activity.findByIdAndUpdate(
    id,
    { $set: { title } },
    { new: true }
  );
  return updated;
}

/**
 * Delete activity and cascade delete children (if root)
 */
async function deleteActivity(id) {
  const doc = await Activity.findById(id);
  if (!doc) return null;

  if (doc.layer === 1) {
    // delete children
    await Activity.deleteMany({ parent_id: doc._id });
  }
  await Activity.findByIdAndDelete(id);

  // if the parent had siblings and now zero children remain, update parent contains_subtopic false
  if (doc.parent_id) {
    const siblings = await Activity.countDocuments({
      parent_id: doc.parent_id,
    });
    if (siblings === 0) {
      await Activity.findByIdAndUpdate(doc.parent_id, {
        $set: { contains_subtopic: false },
      });
    }
  }
  return true;
}

module.exports = {
  addActivityService,
  addSubActivity,
  addActivityOrSubActivity,
  listRootActivities,
  listChildren,
  updateActivity,
  deleteActivity,
};
