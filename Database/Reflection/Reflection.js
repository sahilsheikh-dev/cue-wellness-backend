const mongoose = require("mongoose");
const ReflectionSchema = new mongoose.Schema(
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
    contain_guide: {
      type: Boolean,
      required: false,
      default: false,
    },
    contain_questions: {
      type: Boolean,
      required: false,
      default: false,
    },
    guide: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        content: [
          {
            type: String,
            requried: true,
          },
        ],
      },
    ],
    questions: [
      {
        id: { type: String, required: true },
        content: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Reflection = mongoose.model("Reflection", ReflectionSchema);
module.exports = Reflection;
