const mongoose = require("mongoose");

const NumbersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});

const Numbers = mongoose.model("Numbers", NumbersSchema);

module.exports = Numbers;
