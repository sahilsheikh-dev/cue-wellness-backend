const mongoose = require("mongoose");

const LanguagesSchema = new mongoose.Schema({
  name: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Languages", LanguagesSchema);
