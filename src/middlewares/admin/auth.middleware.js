const { verifyAccessToken } = require("../../utils/jwt.util");
const Admin = require("../../models/admin/adminModel");
const logger = require("../../utils/logger");

/**
 * protect(requiredPermissions)
 * - requiredPermissions can be array of strings or a single string
 * - If not provided, just ensures valid token
 */
function protect(requiredPermissions) {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token);
      if (!payload || !payload.id) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid or expired token" });
      }

      const admin = await Admin.findById(payload.id).select(
        "-password -refreshTokenHash"
      );
      if (!admin)
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });

      req.admin = admin;

      // superAdmin bypass
      if (admin.superAdmin) return next();

      // If no requiredPermissions specified, allow
      if (!requiredPermissions) return next();

      const permsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // admin.permissions expected to be array
      const has = permsArray.some(
        (p) => admin.permissions && admin.permissions.includes(p)
      );
      if (!has) {
        return res.status(403).json({
          success: false,
          message: `Permission denied. One of [${permsArray.join(
            ", "
          )}] required`,
        });
      }

      next();
    } catch (err) {
      logger.error("Auth middleware error: %o", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}

module.exports = protect;
