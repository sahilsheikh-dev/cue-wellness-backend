const mongoose = require("mongoose");
const ConnectionSchema = new mongoose.Schema(
  {
    layer: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    outer_id: {
      type: String,
      required: false,
    },
    contains_subtopic: {
      type: Boolean,
      required: true,
      default: false,
    },
    sub_topics_id: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Connection =
  mongoose.models.Connection || mongoose.model("Connection", ConnectionSchema);

module.exports = Connection;
