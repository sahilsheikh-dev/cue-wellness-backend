const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hash
    dob: { type: Date },
    country: { type: String },
    gender: { type: String },
    profilePicture: { type: String },
    // We'll store hashed refresh token for rotation/invalidation
    refreshTokenHash: { type: String },
    designation: { type: String },
    permissions: [{ type: String }], // not required: superAdmin can have empty array
    superAdmin: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);
