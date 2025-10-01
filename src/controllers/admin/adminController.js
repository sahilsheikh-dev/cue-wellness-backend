const adminService = require("../../services/admin/adminService");
const {
  signAccessToken,
  generateRefreshTokenPlain,
  hashRefreshToken,
} = require("../../utils/jwt.util");

const {
  addAdminSchema,
  loginSchema,
  updateAdminSchema,
} = require("../../validators/admin.validator");
const logger = require("../../utils/logger");

// Standard response helper
function send(res, status, payload) {
  return res
    .status(status)
    .json({ success: payload.success !== false, ...payload });
}

// Add admin (only accessible to superAdmin or permitted)
async function addAdmin(req, res) {
  try {
    const { error, value } = addAdminSchema.validate(req.body);
    if (error)
      return send(res, 400, { success: false, message: error.message });

    // Only superAdmin can create another superAdmin or set permissions
    if (value.superAdmin && !req.admin?.superAdmin) {
      return send(res, 403, {
        success: false,
        message: "Only superAdmin can create superAdmin",
      });
    }

    // Create
    const existing = await adminService.checkAdminByMobileOrEmail(
      value.mobile,
      value.email
    );
    if (existing)
      return send(res, 409, {
        success: false,
        message: "Admin already exists",
      });

    const newAdmin = await adminService.createAdmin(
      value,
      req.admin?._id || null
    );
    const result = {
      id: newAdmin._id,
      name: newAdmin.name,
      mobile: newAdmin.mobile,
      email: newAdmin.email,
    };
    return send(res, 201, {
      success: true,
      message: "Admin added",
      data: result,
    });
  } catch (err) {
    logger.error("addAdmin error: %o", err);
    return send(res, 500, { success: false, message: "Error adding admin" });
  }
}

async function updateAdmin(req, res) {
  try {
    const { error, value } = updateAdminSchema.validate(req.body);
    if (error)
      return send(res, 400, { success: false, message: error.message });

    // Prevent modifications to sensitive fields via this endpoint
    // Only superAdmin can update permissions/superAdmin - enforce at route-level if needed
    const updated = await adminService.updateAdmin(
      req.params.id,
      value,
      req.admin?._id || null
    );
    if (!updated)
      return send(res, 404, { success: false, message: "Admin not found" });
    return send(res, 200, { success: true, message: "Updated", data: updated });
  } catch (err) {
    logger.error("updateAdmin error: %o", err);
    return send(res, 500, { success: false, message: "Error updating admin" });
  }
}

async function deleteAdmin(req, res) {
  try {
    // prevent self-delete
    if (
      req.admin &&
      req.admin._id &&
      req.admin._id.toString() === req.params.id
    ) {
      return send(res, 400, {
        success: false,
        message: "Admins cannot delete themselves",
      });
    }
    const deleted = await adminService.deleteAdmin(req.params.id);
    if (!deleted)
      return send(res, 404, { success: false, message: "Admin not found" });
    return send(res, 200, { success: true, message: "Deleted" });
  } catch (err) {
    logger.error("deleteAdmin error: %o", err);
    return send(res, 500, { success: false, message: "Error deleting admin" });
  }
}

async function listAdmins(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await adminService.listAdmins({ page, limit });
    return send(res, 200, { success: true, message: "Success", data });
  } catch (err) {
    logger.error("listAdmins error: %o", err);
    return send(res, 500, { success: false, message: "Error listing admins" });
  }
}

async function getAdmin(req, res) {
  try {
    const data = await adminService.getAdminById(req.params.id);
    if (!data)
      return send(res, 404, { success: false, message: "Admin not found" });
    return send(res, 200, { success: true, message: "Success", data });
  } catch (err) {
    logger.error("getAdmin error: %o", err);
    return send(res, 500, { success: false, message: "Error fetching admin" });
  }
}

async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ success: false, message: error.message });

    const result = await adminService.login(value.mobile, value.password);
    if (!result)
      return res
        .status(401)
        .json({ success: false, message: "Invalid mobile or password" });

    // set secure cookie for refresh token (httpOnly)
    const refreshTokenPlain = result.refreshToken;
    const secureCookie = process.env.NODE_ENV === "production";

    res.cookie("RefreshToken", refreshTokenPlain, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: secureCookie ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // return access token and minimal admin info
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken: result.accessToken,
        admin: {
          id: result.admin._id,
          name: result.admin.name,
          email: result.admin.email,
          mobile: result.admin.mobile,
          designation: result.admin.designation,
          permissions: result.admin.permissions,
          superAdmin: result.admin.superAdmin,
        },
      },
    });
  } catch (err) {
    logger.error("login error: %o", err);
    return res.status(500).json({ success: false, message: "Login failed" });
  }
}

async function logout(req, res) {
  try {
    // prefer cookie, fallback to body/header
    const refreshPlain =
      req.cookies?.RefreshToken || req.body.refreshToken || null;
    if (!refreshPlain) {
      return res
        .status(400)
        .json({ success: false, message: "No refresh token provided" });
    }
    const admin = await adminService.logoutByRefreshToken(refreshPlain);
    if (!admin)
      return res.status(404).json({ success: false, message: "Invalid token" });

    // clear cookie
    res.clearCookie("RefreshToken");
    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (err) {
    logger.error("logout error: %o", err);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
}

async function refreshAccessToken(req, res) {
  try {
    const refreshPlain = req.cookies?.RefreshToken || req.body.refreshToken;
    if (!refreshPlain)
      return res
        .status(400)
        .json({ success: false, message: "No refresh token" });

    const refreshHash = hashRefreshToken(refreshPlain);
    const admin = await adminService.findByRefreshTokenHash(refreshHash);
    if (!admin)
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });

    // issue new access token and rotate refresh token
    const accessToken = require("../../utils/jwt.util").signAccessToken({
      id: admin._id,
      mobile: admin.mobile,
    });
    const newRefreshPlain =
      require("../../utils/jwt.util").generateRefreshTokenPlain();
    await adminService.rotateRefreshToken(admin._id, newRefreshPlain);

    res.cookie("RefreshToken", newRefreshPlain, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    logger.error("refreshAccessToken error: %o", err);
    return res
      .status(500)
      .json({ success: false, message: "Could not refresh token" });
  }
}

module.exports = {
  addAdmin,
  updateAdmin,
  deleteAdmin,
  listAdmins,
  getAdmin,
  login,
  logout,
  refreshAccessToken,
};
