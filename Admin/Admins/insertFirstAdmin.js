const admins = require("express").Router();
const Admin = require("../../Database/admin/adminSchema.js");
const VerifyToken = require("../Auth/VerifyToken");
const Numbers = require("../../Database/app/Numbers.js");
const { encrypt, decrypt } = require("../../essentials/cryptography.js");
const mongoose = require("mongoose");

async function insertFirstAdmin() {
  await mongoose.connect(
    "mongodb://cuewellness:Cuewellness00700@97.74.94.169:27017/cueWellness?authSource=admin",
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  // Replace these with actual permission ObjectIds from your DB
  const permissions = [
    new mongoose.Types.ObjectId("64fa1234a1b2c3d4e5f67890"),
    new mongoose.Types.ObjectId("64fa2345b2c3d4e5f6789011"),
  ];

  let admin = new Admin({
    staff_id: "ST-001-2025",
    name: encrypt("Super Admin"),
    email: "admin@example.com",
    mobile: "9999999999",
    password: encrypt("SuperSecurePassword123"),
    designation: "Administrator",
    permissions: permissions,
    superAdmin: true,
  });

  await admin.save();
  console.log("First admin inserted successfully!");
  mongoose.connection.close();
}

insertFirstAdmin().catch(console.error);
