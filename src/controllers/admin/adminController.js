const adminService = require("../../services/admin/adminService");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const validateInputs = require("../../utils/validateInputs.util");
const ErrorLog = require("../../models/errorModel");

// Add admin/staff
async function addAdmin(req, res) {
  try {
    const {
      name,
      mobile,
      email,
      password,
      dob,
      country,
      gender,
      designation,
      permissions,
      superAdmin,
    } = req.body;

    if (!validateInputs(name, mobile, password)) {
      return res
        .status(400)
        .send({ message: "Name, mobile and password required" });
    }

    const existing = await adminService.checkAdminByMobileOrEmail(
      mobile,
      email
    );
    if (existing) {
      return res.status(409).send({ message: "Admin/Staff already exists" });
    }

    const newAdmin = await adminService.createAdmin({
      name,
      mobile,
      email,
      password,
      dob,
      country,
      gender,
      designation,
      permissions,
      superAdmin,
    });

    res.status(201).send({
      message: "Admin/Staff added successfully",
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        mobile: newAdmin.mobile,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    const log = new ErrorLog({
      name: "add admin",
      file: "controllers/adminController.js",
      description: error,
      dateTime: new Date(),
      section: "admin",
      priority: "high",
    });
    await log.save();
    res.status(500).send({ message: "Error adding admin/staff", error });
  }
}

// Update admin/staff
async function updateAdmin(req, res) {
  try {
    const updatedAdmin = await adminService.updateAdmin(
      req.params.id,
      req.body
    );
    if (!updatedAdmin)
      return res.status(404).send({ message: "Admin/Staff not found" });
    res
      .status(200)
      .send({ message: "Updated successfully", data: updatedAdmin });
  } catch (error) {
    const log = new ErrorLog({
      name: "update admin",
      file: "controllers/adminController.js",
      description: error,
      dateTime: new Date(),
      section: "admin",
      priority: "high",
    });
    await log.save();
    res.status(500).send({ message: "Error updating admin/staff", error });
  }
}

// Delete admin/staff
async function deleteAdmin(req, res) {
  try {
    const deletedAdmin = await adminService.deleteAdmin(req.params.id);
    if (!deletedAdmin)
      return res.status(404).send({ message: "Admin/Staff not found" });
    res.status(200).send({ message: "Deleted successfully" });
  } catch (error) {
    const log = new ErrorLog({
      name: "delete admin",
      file: "controllers/adminController.js",
      description: error,
      dateTime: new Date(),
      section: "admin",
      priority: "high",
    });
    await log.save();
    res.status(500).send({ message: "Error deleting admin/staff", error });
  }
}

// List admins/staff
async function listAdmins(req, res) {
  try {
    const { page, limit } = req.query;
    const data = await adminService.listAdmins({ page, limit });
    res.status(200).send({ message: "Success", data });
  } catch (error) {
    res.status(500).send({ message: "Error listing admins/staff", error });
  }
}

// Get single admin/staff
async function getAdmin(req, res) {
  try {
    const data = await adminService.getAdminById(req.params.id);
    if (!data)
      return res.status(404).send({ message: "Admin/Staff not found" });
    res.status(200).send({ message: "Success", data });
  } catch (error) {
    res.status(500).send({ message: "Error fetching admin/staff", error });
  }
}

// Login
async function login(req, res) {
  try {
    const { mobile, password } = req.body;
    if (!validateInputs(mobile, password))
      return res.status(400).send({ message: "Fill all details" });

    const result = await adminService.login(mobile, password);
    if (!result)
      return res.status(401).send({ message: "Invalid mobile or password" });

    const { admin, token } = result;

    res.cookie("AuthToken", encrypt(token), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    res.status(200).send({
      message: "Login successful",
      data: {
        token: encrypt(token),
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        designation: admin.designation,
        permissions: admin.permissions,
        superAdmin: admin.superAdmin,
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Login failed", error });
  }
}

// Logout
async function logout(req, res) {
  try {
    const token = req.headers.token || req.cookies.AuthToken;
    if (!token) return res.status(400).send({ message: "No token provided" });

    const admin = await adminService.logout(decrypt(token));
    if (!admin)
      return res.status(404).send({ message: "Admin/Staff not found" });

    res.clearCookie("AuthToken");
    res.status(200).send({ message: "Logout successful" });
  } catch (error) {
    res.status(500).send({ message: "Logout failed", error });
  }
}

// Check cookie
async function checkCookie(req, res) {
  try {
    const token = req.cookies.AuthToken;
    if (!token) return res.status(401).send({ message: "No token found" });

    const admin = await adminService.checkToken(decrypt(token));
    if (!admin)
      return res.status(404).send({ message: "Admin/Staff not found" });

    res.status(200).send({
      message: "Token valid",
      data: {
        token: encrypt(admin.token),
        name: admin.name,
        email: admin.email,
        mobile: admin.mobile,
        designation: admin.designation,
        permissions: admin.permissions,
        superAdmin: admin.superAdmin,
      },
    });
  } catch (error) {
    res.status(500).send({ message: "Error checking token", error });
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
  checkCookie,
};
