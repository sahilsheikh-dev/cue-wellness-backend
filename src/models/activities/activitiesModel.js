// src/models/activities/activitiesModel.js
const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    layer: {
      type: Number,
      enum: [1, 2],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: false,
      default: null,
    },
    contains_subactivities: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure fast lookup for children and uniqueness checks can be done in code
ActivitySchema.index({ parent_id: 1, title: 1 });

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);

module.exports = Activity;
