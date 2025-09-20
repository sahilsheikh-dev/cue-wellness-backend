const { decrypt } = require("../../utils/cryptography.util");
const Admin = require("../../models/admin/adminModel");

const verifyAdmin = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.token || req.cookies.AuthToken;
      if (!token) {
        return res.status(403).send({ res: false, alert: "Unauthorized" });
      }

      const admin = await Admin.findOne({ token: decrypt(token) });
      if (!admin) {
        return res.status(403).send({ res: false, alert: "Unauthorized" });
      }

      req.admin = admin;

      // Super-admin or "*" permission bypass
      if (
        admin.superAdmin ||
        admin.permissions.includes("*") ||
        admin.permissions.includes("all")
      ) {
        return next();
      }

      if (requiredPermissions) {
        const permissionsArray = Array.isArray(requiredPermissions)
          ? requiredPermissions
          : [requiredPermissions];

        const hasPermission = permissionsArray.some((perm) =>
          admin.permissions.includes(perm)
        );

        if (!hasPermission) {
          return res.status(403).send({
            res: false,
            alert: `Permission denied: One of [${permissionsArray.join(
              ", "
            )}] required`,
          });
        }
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(500).send({ res: false, alert: "Internal server error" });
    }
  };
};

module.exports = verifyAdmin;
