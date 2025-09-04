const mongoose = require("mongoose");

// Main Coache Schema
const StaffSchema = new mongoose.Schema({
  staff_id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: false },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: Date, required: false },
  country: { type: String, required: false },
  gender: { type: String, required: false },
  profilePicture: { type: String, required: false },
  token: { type: String, required: false },
  designation: {
    type: String,
    required: false,
  },
  permissions: [
    {
      type: String,
      required: true,
    },
  ],
});

const Staff = mongoose.model("Staff", StaffSchema);

module.exports = Staff;
