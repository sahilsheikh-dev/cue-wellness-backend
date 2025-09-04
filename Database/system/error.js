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
    // this will conatin the priority of the error
  },
});

const Error = mongoose.model("Error", ErrorSchema);
module.exports = Error;
