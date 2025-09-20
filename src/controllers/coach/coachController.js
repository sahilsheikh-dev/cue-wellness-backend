// controllers/coach/coachController.js
const coachService = require("../../services/coach/coachService");
const otpService = require("../../services/otpService");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");
const Coach = require("../../models/coach/coachModel");

// Signup — create unverified coach and send OTP (userType=coach)
async function signup(req, res) {
  try {
    const { name, mobile, password, email } = req.body;
    if (!name || !mobile || !password) {
      return res
        .status(400)
        .json({ server: true, res: false, alert: "Please fill all fields" });
    }

    // create coach record (unverified)
    const newCoach = await coachService.createUnverifiedCoach({
      name,
      mobile,
      password,
      email,
    });

    // send OTP for this phone + userType=coach; include coachId in meta so we can map after verification
    const otpResult = await otpService.createAndSendOtp(mobile, {
      userType: "coach",
      meta: { coachId: newCoach._id.toString() },
    });

    return res.status(201).json({
      server: true,
      res: true,
      otpId: otpResult.otpId, // encrypted otpId to be used in verify step
      message: "Signup created, OTP sent",
    });
  } catch (err) {
    console.error("signup error:", err);
    return res.status(400).json({
      server: true,
      res: false,
      alert: err.message || "Signup failed",
    });
  }
}

// Verify OTP — verifies via otpService, then sets token on coach and marks mobileVerified
async function verifyOtp(req, res) {
  try {
    const { otp, otpId } = req.body;
    if (!otp || !otpId)
      return res
        .status(400)
        .json({ res: false, message: "otp and otpId required" });

    const result = await otpService.verifyOtp(otpId, otp);
    if (!result.ok) {
      // map reasons
      switch (result.reason) {
        case "expired":
          return res.status(410).json({ ok: false, message: "OTP expired" });
        case "max_attempts":
          return res
            .status(429)
            .json({ ok: false, message: "Max attempts exceeded" });
        default:
          return res.status(401).json({ ok: false, message: "Invalid OTP" });
      }
    }

    const record = result.record; // OtpRequest doc
    // Prefer meta.coachId (set at signup); otherwise find coach by phone and status unverified
    let coach;
    if (record.meta && record.meta.coachId) {
      coach = await Coach.findById(record.meta.coachId);
    } else {
      coach = await Coach.findOne({ mobile: record.phone });
    }
    if (!coach)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    // set token and mobileVerified
    const { token } = await coachService.setTokenForCoachById(coach._id);
    coach.mobileVerified = true;
    coach.status =
      coach.status === "unverified" ? "semiverified" : coach.status; // optionally bump to semiverified
    await coach.save();

    return res.json({
      server: true,
      res: true,
      token: encrypt(token),
      message: "Verified and logged in",
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    return res
      .status(500)
      .json({ server: true, res: false, error: err.message });
  }
}

// Login
async function login(req, res) {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res.status(400).json({ message: "Provide mobile and password" });

    const result = await coachService.login(mobile, password);
    if (!result)
      return res.status(401).json({ message: "Invalid mobile or password" });

    const { coach, token } = result;
    res.cookie("CoachAuthToken", encrypt(token), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    return res.json({
      message: "Login successful",
      token: encrypt(token),
      coach: {
        id: coach._id,
        name: (() => {
          try {
            return decrypt(coach.name);
          } catch (e) {
            return coach.name;
          }
        })(),
        mobile: coach.mobile,
        status: coach.status,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    return res
      .status(500)
      .json({ message: "Login failed", error: err.message });
  }
}

// Logout
async function logout(req, res) {
  try {
    const rawToken = req.headers.token || req.cookies?.CoachAuthToken;
    if (!rawToken)
      return res.status(400).json({ message: "No token provided" });

    let token;
    try {
      token = decrypt(rawToken);
    } catch (e) {
      token = rawToken;
    }
    const coach = await coachService.logout(token);
    if (!coach) return res.status(404).json({ message: "Coach not found" });

    res.clearCookie("CoachAuthToken");
    return res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("logout error:", err);
    return res
      .status(500)
      .json({ message: "Logout failed", error: err.message });
  }
}

// Get personal/profile info
async function getPersonalInfo(req, res) {
  try {
    const coach = req.coach;
    const formatted = await coachService.getCoachById(coach._id);
    return res.json({ server: true, res: true, supply: formatted });
  } catch (err) {
    console.error("getPersonalInfo:", err);
    return res
      .status(500)
      .json({ server: true, res: false, error: err.message });
  }
}

// Update profile
async function updateProfile(req, res) {
  try {
    const coachId = req.coach?._id || req.params.id;
    const updated = await coachService.updateCoach(coachId, req.body);
    if (!updated)
      return res
        .status(404)
        .json({ server: true, res: false, message: "Coach not found" });
    return res.json({
      server: true,
      res: true,
      message: "Profile updated",
      data: updated,
    });
  } catch (err) {
    console.error("updateProfile:", err);
    return res
      .status(500)
      .json({ server: true, res: false, error: err.message });
  }
}

// Admin: change status
async function changeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await coachService.changeCoachStatus(id, status);
    if (!updated) return res.status(404).json({ message: "Coach not found" });
    return res.json({ message: "Status updated", data: updated });
  } catch (err) {
    console.error("changeStatus:", err);
    return res.status(400).json({ message: err.message });
  }
}

// Upload certificates
async function uploadCertificates(req, res) {
  try {
    const coachId = req.coach?._id || req.body.coachId;
    if (!coachId) return res.status(400).json({ message: "coachId required" });
    const updated = await coachService.addCertificates(
      coachId,
      req.files || []
    );
    return res.json({
      server: true,
      res: true,
      uploaded: (req.files || []).map((f) => f.filename),
      data: updated,
    });
  } catch (err) {
    console.error("uploadCertificates:", err);
    return res
      .status(500)
      .json({ server: true, res: false, error: err.message });
  }
}

// Save agreement
async function saveAgreement(req, res) {
  try {
    const coachId = req.coach?._id || req.body.coachId;
    const { title, content } = req.body;
    const updated = await coachService.saveAgreement(
      coachId,
      title,
      content || []
    );
    return res.json({ server: true, res: true, data: updated });
  } catch (err) {
    console.error("saveAgreement:", err);
    return res
      .status(500)
      .json({ server: true, res: false, error: err.message });
  }
}

// Save pricing & slots
async function savePricingSlots(req, res) {
  try {
    const coachId = req.coach?._id || req.body.coachId;
    const { categoryId, sessionKey, level, payload } = req.body;
    const updated = await coachService.saveSessionSlots(
      coachId,
      categoryId,
      sessionKey,
      level,
      payload
    );
    return res.json({ server: true, res: true, data: updated });
  } catch (err) {
    console.error("savePricingSlots:", err);
    return res
      .status(500)
      .json({ server: true, res: false, error: err.message });
  }
}

// List, get, like/dislike, save/unsave re-used unchanged from prior
const { list, getById, likeActivity, dislikeActivity, saveCoach, unsaveCoach } =
  {
    list: async (req, res) => {
      try {
        const { page, limit, status, q } = req.query;
        const docs = await coachService.listCoaches({
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          status,
          q,
        });
        return res.json({ server: true, res: true, supply: docs });
      } catch (err) {
        console.error("list error:", err);
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
    getById: async (req, res) => {
      try {
        const d = await coachService.getCoachById(req.params.id);
        if (!d)
          return res
            .status(404)
            .json({ server: true, res: false, message: "Not found" });
        return res.json({ server: true, res: true, supply: d });
      } catch (err) {
        console.error("getById:", err);
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
    likeActivity: async (req, res) => {
      try {
        const coachId = req.coach?._id;
        const { id } = req.body;
        const updated = await coachService.toggleLikeActivity(
          coachId,
          id,
          "add"
        );
        return res.json({
          server: true,
          res: true,
          supply: updated.liked_activities,
        });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
    dislikeActivity: async (req, res) => {
      try {
        const coachId = req.coach?._id;
        const { id } = req.body;
        const updated = await coachService.toggleLikeActivity(
          coachId,
          id,
          "remove"
        );
        return res.json({
          server: true,
          res: true,
          supply: updated.liked_activities,
        });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
    saveCoach: async (req, res) => {
      try {
        const coachId = req.coach?._id;
        const { id } = req.body;
        const updated = await coachService.toggleSaveCoach(coachId, id, "add");
        return res.json({
          server: true,
          res: true,
          supply: updated.saved_coaches,
        });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
    unsaveCoach: async (req, res) => {
      try {
        const coachId = req.coach?._id;
        const { id } = req.body;
        const updated = await coachService.toggleSaveCoach(
          coachId,
          id,
          "remove"
        );
        return res.json({
          server: true,
          res: true,
          supply: updated.saved_coaches,
        });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
  };

// Upload Profile Picture
async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const updated = await coachService.setProfilePicture(
      req.coach._id,
      req.file.filename
    );
    res.json({ server: true, res: true, path: updated.profilePicture });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error uploading profile picture", error: err.message });
  }
}

// Upload Work Images
async function uploadWorkImages(req, res) {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No files uploaded" });
    if (req.files.length > 3)
      return res.status(400).json({ message: "Maximum 3 files allowed" });

    // Validate types
    const allowedImages = ["image/jpeg", "image/png", "image/jpg"];
    const allowedVideos = ["video/mp4", "video/mkv", "video/avi"];
    if (!allowedImages.includes(req.files[0].mimetype)) {
      return res
        .status(400)
        .json({ message: "First file must be an image (jpeg/png)" });
    }

    const updated = await coachService.setWorkImages(req.coach._id, req.files);
    res.json({ server: true, res: true, workImages: updated.workImages });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error uploading work images", error: err.message });
  }
}

module.exports = {
  signup,
  verifyOtp,
  login,
  logout,
  getPersonalInfo,
  updateProfile,
  changeStatus,
  uploadCertificates,
  saveAgreement,
  savePricingSlots,
  list: list,
  getById: getById,
  likeActivity: likeActivity,
  dislikeActivity: dislikeActivity,
  saveCoach: saveCoach,
  unsaveCoach: unsaveCoach,
  uploadProfilePicture,
  uploadWorkImages,
};
