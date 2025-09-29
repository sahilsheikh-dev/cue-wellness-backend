const activities = require("../../models/activities/activitiesModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");
const fs = require("fs");

async function addActivityService(title) {
  if (!title) {
    throw new Error("Mobile number already registered");
  }

  const existing = await activities.findOne({ 
    title: { $regex: new RegExp(`^${title}$`, "i") },
    layer:1
  });
  if (existing) {
    throw new Error("Activity already exists");
  }
  const newActivity = new activities({
    title: title,
    layer: 1, // default value for now
    contains_subtopic: false, // default
  });

  await newActivity.save();

  return newActivity;
}

async function addSubActivity(parentId, title) {
  // check parent exists
  const parent = await activities.findById(parentId);
  if (!parent) {
    throw new Error("Parent activity not found");
  }

  // check for duplicates (case-insensitive)
  const exists = await activities.findOne({
    title: { $regex: new RegExp(`^${title}$`, "i") }, // ignore case
    parent_id: parentId,
    layer: 2,
  });

  if (exists) {
    throw new Error("This sub-activity already exists under the same parent");
  }

  // create sub-activity
  const subActivity = new activities({
    layer: 2, // always 2
    title,
    parent_id: parentId,
    contains_subtopic: false,
  });
  // mark parent as containing subtopics
  if (!parent.contains_subtopic) {
    parent.contains_subtopic = true;
    await parent.save();
  }

  await subActivity.save();
  return subActivity;
}

module.exports = {
  addActivityService,
  addSubActivity
};
