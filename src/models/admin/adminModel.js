const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: Date },
  country: { type: String },
  gender: { type: String },
  profilePicture: { type: String },
  token: { type: String },
  designation: { type: String },
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
    },
  ],
  superAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("Admin", AdminSchema);
