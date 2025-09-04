const mongoose = require("mongoose");

// Main Coache Schema
const AdminSchema = new mongoose.Schema({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: false,
    },
  ],
  superAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
