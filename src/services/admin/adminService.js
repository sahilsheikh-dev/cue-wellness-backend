const Admin = require("../../models/admin/adminModel");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");

async function findAdminByToken(token) {
  return Admin.findOne({ token });
}

async function findAdminByMobile(mobile) {
  return Admin.findOne({ mobile });
}

async function updateAdminToken(adminId) {
  const newToken = getId(12);
  await Admin.findByIdAndUpdate(adminId, { token: newToken });
  return newToken;
}

module.exports = {
  findAdminByToken,
  findAdminByMobile,
  updateAdminToken,
};
