const mongoose = require("mongoose");
const QuestionnaireSchema = new mongoose.Schema(
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
    meaning: [
      {
        id: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    guide: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        content: { type: String, requried: true },
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

const Questionnaire = mongoose.model("Questionnaire", QuestionnaireSchema);
module.exports = Questionnaire;
