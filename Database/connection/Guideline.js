const mongoose = require("mongoose");

const Connection_GuidelinesSchema = new mongoose.Schema({
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

const Connection_Guidelines = mongoose.model(
  "Guidelines",
  Connection_GuidelinesSchema
);
module.exports = Connection_Guidelines;
