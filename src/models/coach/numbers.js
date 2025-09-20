const mongoose = require("mongoose");

const NumbersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: Number, required: true },
});

module.exports = mongoose.model("Numbers", NumbersSchema);
