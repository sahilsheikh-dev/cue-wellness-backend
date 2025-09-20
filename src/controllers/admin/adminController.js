const Admin = require("../../models/admin/adminModel");
const adminService = require("../../services/admin/adminService");
const validateInputs = require("../../utils/validateInputs.util");
const { decrypt, encrypt } = require("../../utils/cryptography.util");
const ErrorLog = require("../../models/errorModel");

// Add new admin
const addAdmin = async (req, res) => {
  try {
    const headers = req.headers;
    const adminData = await adminService.findAdminByToken(headers.token);
    if (!adminData) {
      return res.status(400).send({
        message: "Admin Not Found",
        timestamp: new Date().toISOString(),
        error: "Not Found",
      });
    }
    console.log("found the token");
    // TODO: implement add admin logic
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong during add admin, please try again",
      timestamp: new Date().toISOString(),
      error: "Internal Server Error",
    });
  }
};

// Admin login
const login = async (req, res) => {
  const { mobile, password } = req.body;

  if (!validateInputs(mobile, password)) {
    return res.status(400).send({
      message: "Please fill all the details",
      timestamp: new Date().toISOString(),
      error: "Bad Request",
    });
  }

  try {
    const adminData = await adminService.findAdminByMobile(mobile);

    if (!adminData) {
      return res.status(401).send({
        message: "Mobile number or password is incorrect",
        timestamp: new Date().toISOString(),
        error: "Unauthorized",
      });
    }

    if (password === decrypt(adminData.password)) {
      const newToken = await adminService.updateAdminToken(adminData._id);

      res.cookie("AuthToken", encrypt(newToken), {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        secure: true,
        sameSite: "None",
      });

      return res.status(200).send({
        timestamp: new Date().toISOString(),
        message: "Login Success",
        data: { token: encrypt(newToken) },
      });
    }

    res.status(401).send({
      message: "Mobile number or password is incorrect",
      timestamp: new Date().toISOString(),
      error: "Unauthorized",
    });
  } catch (error) {
    const newError = new ErrorLog({
      name: "admin login",
      file: "controllers/adminController.js",
      description: "Error while login: " + error,
      dateTime: new Date(),
      section: "admin",
      priority: "low",
    });
    newError.save();

    res.status(500).send({
      message: "Something went wrong during login, please try again",
      timestamp: new Date().toISOString(),
      error: error,
    });
  }
};

// Check cookie
const checkCookie = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!validateInputs(cookies.AuthToken)) {
      return res.status(401).send({
        message: "Not a valid token",
        timestamp: new Date().toISOString(),
        error: "Uauthorized",
      });
    }

    const result = await Admin.findOne({
      token: decrypt(cookies.AuthToken),
    });

    if (!result) {
      return res.status(404).send({
        message: "Admin Not found",
        timestamp: new Date().toISOString(),
        error: "Not Found",
      });
    }

    res.status(200).send({
      message: "Check Cookie successfull",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).send({
      message: "Something went wrong while checking cookie, please try again",
      timestamp: new Date().toISOString(),
      error: error,
    });
  }
};

module.exports = {
  addAdmin,
  login,
  checkCookie,
};
