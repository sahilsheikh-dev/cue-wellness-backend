const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date },
    country: { type: String },
    gender: { type: String },
    profilePicture: { type: String },
    token: { type: String },
    designation: { type: String },
    permissions: [{ type: String, required: true }],
    superAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
