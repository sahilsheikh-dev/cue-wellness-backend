const mongoose = require("mongoose");
const ActivitySchema = new mongoose.Schema(
  {
    layer: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    parent_id: {
      type: String,
      required: false,
    },
    contains_subtopic: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Activity =
  mongoose.models.Activity || mongoose.model("Activity", ActivitySchema);

module.exports = Activity;
