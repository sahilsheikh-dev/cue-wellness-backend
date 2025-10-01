const Admin = require("../../models/admin/adminModel");
const { hashPassword, comparePassword } = require("../../utils/password.util");
const {
  signAccessToken,
  generateRefreshTokenPlain,
  hashRefreshToken,
} = require("../../utils/jwt.util");
const logger = require("../../utils/logger");

// Create admin
async function createAdmin(data, createdById = null) {
  const passwordHash = await hashPassword(data.password);
  const newAdmin = new Admin({
    ...data,
    password: passwordHash,
    createdBy: createdById,
    // token fields left empty; will be set on login
  });
  await newAdmin.save();
  return newAdmin;
}

async function findAdminByMobile(mobile) {
  return Admin.findOne({ mobile });
}

async function checkAdminByMobileOrEmail(mobile, email) {
  const q = { $or: [] };
  if (mobile) q.$or.push({ mobile });
  if (email) q.$or.push({ email });
  if (q.$or.length === 0) return null;
  return Admin.findOne(q);
}

async function updateAdmin(adminId, updateData, updatedById = null) {
  const update = { ...updateData };
  if (update.password) {
    update.password = await hashPassword(update.password);
  }
  if (updatedById) update.updatedBy = updatedById;
  const updatedAdmin = await Admin.findByIdAndUpdate(adminId, update, {
    new: true,
    runValidators: true,
  }).select("-password -refreshTokenHash");
  return updatedAdmin;
}

async function deleteAdmin(adminId) {
  return Admin.findByIdAndDelete(adminId);
}

async function listAdmins({ page = 1, limit = 20 } = {}) {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const admins = await Admin.find()
    .select("-password -refreshTokenHash")
    .skip(skip)
    .limit(parseInt(limit, 10))
    .lean();
  return admins.map((a) => ({
    id: a._id,
    name: a.name,
    email: a.email,
    mobile: a.mobile,
    designation: a.designation,
    permissions: a.permissions,
    superAdmin: a.superAdmin,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));
}

async function getAdminById(id) {
  const admin = await Admin.findById(id).select("-password -refreshTokenHash");
  if (!admin) return null;
  return admin;
}

async function login(mobile, password) {
  const admin = await Admin.findOne({ mobile });
  if (!admin) return null;

  const ok = await comparePassword(password, admin.password);
  if (!ok) return null;

  // generate access + refresh tokens
  const accessToken = signAccessToken({ id: admin._id, mobile: admin.mobile });
  const refreshPlain = generateRefreshTokenPlain();
  const refreshHash = hashRefreshToken(refreshPlain);

  // store hashed refresh token and lastLogin
  admin.refreshTokenHash = refreshHash;
  admin.lastLoginAt = new Date();
  await admin.save();

  return {
    admin,
    accessToken,
    refreshToken: refreshPlain,
  };
}

async function rotateRefreshToken(adminId, newRefreshPlain) {
  const newHash = hashRefreshToken(newRefreshPlain);
  await Admin.findByIdAndUpdate(adminId, { refreshTokenHash: newHash });
}

async function logoutByRefreshToken(refreshPlain) {
  const hash = hashRefreshToken(refreshPlain);
  const admin = await Admin.findOne({ refreshTokenHash: hash });
  if (!admin) return null;
  admin.refreshTokenHash = null;
  await admin.save();
  return admin;
}

async function findByRefreshTokenHash(hash) {
  return Admin.findOne({ refreshTokenHash: hash });
}

module.exports = {
  createAdmin,
  findAdminByMobile,
  checkAdminByMobileOrEmail,
  updateAdmin,
  deleteAdmin,
  listAdmins,
  getAdminById,
  login,
  rotateRefreshToken,
  logoutByRefreshToken,
  findByRefreshTokenHash,
};
