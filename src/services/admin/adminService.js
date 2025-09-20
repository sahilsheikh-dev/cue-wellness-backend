const Admin = require("../../models/admin/adminModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");

// Create admin/staff
async function createAdmin(data) {
  const newAdmin = new Admin({
    ...data,
    password: encrypt(data.password),
    token: getId(12),
  });
  await newAdmin.save();
  return newAdmin;
}

// Find by mobile
async function findAdminByMobile(mobile) {
  return Admin.findOne({ mobile });
}

// Check if mobile/email exists
async function checkAdminByMobileOrEmail(mobile, email) {
  return Admin.findOne({ $or: [{ mobile }, { email }] });
}

// Update admin/staff
async function updateAdmin(adminId, updateData) {
  if (updateData.password) {
    updateData.password = encrypt(updateData.password);
  }
  const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, {
    new: true,
  });
  return updatedAdmin;
}

// Delete admin/staff
async function deleteAdmin(adminId) {
  return Admin.findByIdAndDelete(adminId);
}

// Update token on login
async function updateAdminToken(adminId) {
  const newToken = getId(12);
  await Admin.findByIdAndUpdate(adminId, { token: newToken });
  return newToken;
}

// List admins/staff with optional pagination
async function listAdmins({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  const admins = await Admin.find().skip(skip).limit(limit);
  return admins.map((a) => ({
    id: a._id,
    name: a.name,
    email: a.email,
    mobile: a.mobile,
    designation: a.designation,
    permissions: a.permissions,
    superAdmin: a.superAdmin,
  }));
}

// Get admin/staff by ID
async function getAdminById(id) {
  const admin = await Admin.findById(id);
  if (!admin) return null;
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    mobile: admin.mobile,
    designation: admin.designation,
    permissions: admin.permissions,
    superAdmin: admin.superAdmin,
    dob: admin.dob,
    country: admin.country,
    gender: admin.gender,
    profilePicture: admin.profilePicture,
  };
}

// Login
async function login(mobile, password) {
  const admin = await Admin.findOne({ mobile });
  if (!admin || decrypt(admin.password) !== password) return null;
  const token = getId(12);
  admin.token = token;
  await admin.save();
  return { admin, token };
}

// Logout
async function logout(token) {
  const admin = await Admin.findOne({ token });
  if (!admin) return null;
  admin.token = null;
  await admin.save();
  return admin;
}

// Check token
async function checkToken(token) {
  const admin = await Admin.findOne({ token });
  if (!admin) return null;
  return admin;
}

module.exports = {
  createAdmin,
  updateAdmin,
  deleteAdmin,
  updateAdminToken,
  findAdminByMobile,
  checkAdminByMobileOrEmail,
  listAdmins,
  getAdminById,
  login,
  logout,
  checkToken,
};
