const { decrypt } = require("../../utils/cryptography.util");
const Admin = require("../../models/admin/adminModel");

const verifyAdmin = async (req, res, next) => {
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
    next();
  } catch (error) {
    res.status(500).send({ res: false, alert: "Internal server error" });
  }
};

module.exports = verifyAdmin;
