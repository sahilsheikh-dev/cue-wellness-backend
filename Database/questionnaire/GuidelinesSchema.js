const mongoose = require("mongoose");

const Questionnaire_GuidelinesSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guideline: [
    {
      id: {
        required: true,
        type: String,
      },
      type: {
        type: String,
        required: true,
      },
      content: {
        required: true,
        type: String,
      },
    },
  ],
});

const Questionnaire_Guidelines = mongoose.model(
  "Guidelines",
  Questionnaire_GuidelinesSchema
);
module.exports = Questionnaire_Guidelines;
