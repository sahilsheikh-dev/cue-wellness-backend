const mongoose = require("mongoose");

const ErrorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  file: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
    default: Date.now, // auto-set timestamp if not provided
  },
  section: {
    type: String,
    required: false,
  },
  remark: {
    type: String,
    required: false,
  },
  priority: {
    type: String,
    required: false,
    enum: ["low", "medium", "high"], // optional: restrict values
    default: "low",
  },
});

// Use a clear model name to avoid shadowing built-in "Error"
const ErrorModel = mongoose.model("Error", ErrorSchema);

module.exports = ErrorModel;
