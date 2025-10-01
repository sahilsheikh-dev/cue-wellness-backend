// models/activities/activitiesModel.js
const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    layer: { type: Number, required: true }, // 1 (root) or 2 (child)
    title: { type: String, required: true },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: false,
    },
    contains_subtopic: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);
module.exports = Activity;
