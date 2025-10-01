const mongoose = require("mongoose");

const ErrorSchema = new mongoose.Schema({
  name: { type: String },
  file: { type: String, required: true },
  description: { type: String, required: true }, // sanitized string message
  stack: { type: String },
  dateTime: { type: Date, required: true, default: Date.now },
  section: { type: String },
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
});

module.exports = mongoose.model("Error", ErrorSchema);
