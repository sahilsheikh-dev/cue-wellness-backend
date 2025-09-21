// controllers/coach/coachController.js
const coachService = require("../../services/coach/coachService");
const otpService = require("../../services/otpService");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const getId = require("../../utils/getId.util");
const validateInputs = require("../../utils/validateInputs.util");
const Error = require("../../models/errorModel");
const Coach = require("../../models/coach/coachModel");

// Signup — create unverified coach and send OTP (userType=coach)
async function signup(req, res) {
  try {
    const { name, mobile, password, email } = req.body;
    if (!name || !mobile || !password) {
      return res.status(400).send({ message: "Please fill all fields", error:"Bad Request" });
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

    return res.status(201).send({
      otpId: otpResult.otpId,
      message: "Signup successful, OTP sent",
      error:"Created"
    });
  } catch (err) {
    console.error("signup error:", err);
    const newError = new Error({
          name: "singnup error",
          file: "controllers/coach/coachController",
          description: "error while sign up" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res.status(500).send({
      message:"Internal Server Error",
      error:err.message
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
        .send({ message: "otp and otpId required", error:"Bad Request" });

    const result = await otpService.verifyOtp(otpId, otp);
    if (!result.ok) {
      // map reasons
      switch (result.reason) {
        case "expired":
          return res.status(410).json({ message: "OTP expired", error:"The requested resource has been permanently removed" });
        case "max_attempts":
          return res
            .status(429)
            .send({ message: "Max attempts exceeded", error:"Too Many Requests" });
        default:
          return res.status(401).json({ message: "Invalid OTP", error:"Unauthorized" });
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
      return res.status(404).json({ message: "Coach not found", error:"Not found" });

    // set token and mobileVerified
    const { token } = await coachService.setTokenForCoachById(coach._id);
    coach.mobileVerified = true;
    coach.status === "unverified" ? "semiverified" : coach.status; // optionally bump to semiverified
    await coach.save();
    return res.status(200).send({
      message: "Verified and logged in",
      token: encrypt(token)
    });
  } catch (err) {
    console.error("verifyOtp error:", err);
    const newError = new Error({
          name: "verify OTP error",
          file: "controllers/coach/coachController",
          description: "error while verifying OTP" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message:"internal Server Error", error: err.message });
  }
}

// Login
async function login(req, res) {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res.status(400).send({ message: "Provide mobile and password", error:"Bad Request" });

    const result = await coachService.login(mobile, password);
    if (!result)
      return res.status(401).send({ message: "Invalid mobile or password", error:"Unauthorized" });

    const { coach, token } = result;
    res.cookie("CoachAuthToken", encrypt(token), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).send({
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
    const newError = new Error({
          name: "log in error",
          file: "controllers/coach/coachController",
          description: "error while logging in" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
}

// Logout
async function logout(req, res) {
  try {
    const rawToken = req.headers.token || req.cookies?.CoachAuthToken;
    if (!rawToken)
      return res.status(400).json({ message: "No token provided", error:"Bad Request" });
    let token;
    try {
      token = decrypt(rawToken);
    } catch (e) {
      token = rawToken;
    }
    const coach = await coachService.logout(token);
    if (!coach) return res.status(404).json({ message: "Coach not found", error:"Not found" });
    res.clearCookie("CoachAuthToken");
    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("logout error:", err);
    const newError = new Error({
          name: "logout error",
          file: "controllers/coach/coachController",
          description: "error while logging out" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
}

// Get personal/profile info
async function getPersonalInfo(req, res) {
  try {
    const coach = req.coach;
    const coachInfo = await coachService.getCoachById(coach._id);
    if(!coachInfo) 
    return res.status(200).send({ message:"personal info found", data: coachInfo });
  } catch (err) {
    console.error("getPersonalInfo:", err);
    const newError = new Error({
          name: "get prsonal info error",
          file: "controllers/coach/coachController",
          description: "error while fetching personal info" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message:"Internal Server Error", error: err.message });
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
        .send({ message: "Coach not found",error:"Not found" });
    return res.status(200).json({
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("updateProfile:", err);
    const newError = new Error({
          name: "update profile error",
          file: "controllers/coach/coachController",
          description: "error while updating profile" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message:"Internal Server Error", error: err.message });
  }
}

// Admin: change status
async function changeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await coachService.changeCoachStatus(id, status);
    if (!updated) return res.status(404).send({ message: "Coach not found", error:"Not found"});
    return res.status(200).send({ message: "Status updated", data: updated });
  } catch (err) {
    console.error("changeStatus:", err);
    const newError = new Error({
          name: "change status error",
          file: "controllers/coach/coachController",
          description: "error while changing status" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res.status(500).send({ message:"Internal Server Error",error:err.message });
  }
}

// Upload certificates
async function uploadCertificates(req, res) {
  try {
    const coachId = req.coach?._id || req.body.coachId;
    if (!coachId) return res.status(400).json({ message: "coachId required", error:"Bad Request" });
    const updated = await coachService.addCertificates(
      coachId,
      req.files || []
    );
    return res.status(200).send({
      message:"Certificate uploaded successfully",
      uploaded: (req.files || []).map((f) => f.filename),
      data: updated,
    });
  } catch (err) {
    console.error("uploadCertificates:", err);
    const newError = new Error({
          name: "upload certificate error",
          file: "controllers/coach/coachController",
          description: "error while uploading certificate" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message:"Intenal Server Error", error: err.message });
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
    return res.status(200).send({ message:"Agreement saved successfully", data: updated });
  } catch (err) {
    console.error("saveAgreement:", err);
    const newError = new Error({
          name: "save agreement error",
          file: "controllers/coach/coachController",
          description: "error while saving agreement" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message:"Internal Server Error", error: err.message });
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
    return res.status(200).send({ message:"Pricing slots saved successfully", data: updated });
  } catch (err) {
    console.error("savePricingSlots:", err);
    const newError = new Error({
          name: "save pricing slots error",
          file: "controllers/coach/coachController",
          description: "error while saving pricing slots" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message:"Internal Server Error", error: err.message });
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
        return res.status(200).send({ message:"found list of all the coaches", data: docs });
      } catch (err) {
        console.error("list error:", err);
        const newError = new Error({
          name: "error while fetching all the coaches",
          file: "controllers/coach/coachController",
          description: "error while fetching list of all the coaches" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
        await newError.save();
        return res
          .status(500)
          .json({ server: true, res: false, error: err.message });
      }
    },
    getById: async (req, res) => {
      try {
        const coach = await coachService.getCoachById(req.params.id);
        if (!d)
          return res
            .status(404)
            .send({message: "Coach Not found", erro:"Not found" });
        return res.status(200).send({ message:"Coach fetched successfully", data: coach });
      } catch (err) {
        console.error("getById:", err);
        const newError = new Error({
          name: "get coach error",
          file: "controllers/coach/coachController",
          description: "error while fetching the coach" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
        await newError.save();
        return res
          .status(500)
          .send({ message:"Internal Server Error", error: err.message });
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
        return res.status(200).send({
          message:"Coach liked successfully",
          data: updated.liked_activities,
        });
      } catch (err) {
        console.error(err);
        const newError = new Error({
          name: "like coach error",
          file: "controllers/coach/coachController",
          description: "error while liking the coach" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
        await newError.save();
        return res
          .status(500)
          .send({ message:"Internal Server Error", error: err.message });
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
        return res.status(200).send({
          message:"Caoch disliked successfully",
          data: updated.liked_activities,
        });
      } catch (err) {
        console.error(err);
        const newError = new Error({
          name: "dislike coach error",
          file: "controllers/coach/coachController",
          description: "error while disliking the coach" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
        await newError.save();
        return res
          .status(500)
          .send({ message:"Internal Server Error", error: err.message });
      }
    },
    saveCoach: async (req, res) => {
      try {
        const coachId = req.coach?._id;
        const { id } = req.body;
        const updated = await coachService.toggleSaveCoach(coachId, id, "add");
        return res.status(200).send({
          messgae:"Coach saved successfully",
          data: updated.saved_coaches,
        });
      } catch (err) {
        console.error(err);
        const newError = new Error({
          name: "save coach error",
          file: "controllers/coach/coachController",
          description: "error while saving the coach" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
        await newError.save();
        return res
          .status(500)
          .send({ message:"Internal Server Error",error: err.message });
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
        return res.status(200).send({
          message:"coach unsaved successfully",
          data: updated.saved_coaches,
        });
      } catch (err) {
        console.error(err);
        const newError = new Error({
          name: "unsave coach error",
          file: "controllers/coach/coachController",
          description: "error while unsaving the coach" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
    await newError.save();
        return res
          .status(500)
          .send({ message:"Internal server error", error: err.message });
      }
    },
  };

// Upload Profile Picture
async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) return res.status(400).send({ message: "No file uploaded", error:"Bad Request" });
    const updated = await coachService.setProfilePicture(
      req.coach._id,
      req.file.filename
    );
    res.status(200).send({
     message: "profile picture uploaded successfully",
     data: updated.profilePicture
    });
  } catch (err) {
    console.error(err);
    const newError = new Error({
          name: "profile picture error",
          file: "controllers/coach/coachController",
          description: "error while uploading profile picture" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
    await newError.save();
    res.status(500).json({
     message: "Error uploading profile picture",
     error: err.message
});
  }
}

// Upload Work Images
async function uploadWorkAssets(req, res) {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).send({ message: "No files uploaded", error:"Bad Request" });
    if (req.files.length > 3)
      return res.status(400).send({ message: "Maximum 3 files allowed", error: "Bad Request"});

    // Validate types
    const allowedImages = ["image/jpeg", "image/png", "image/jpg","video/mp4", "video/mkv", "video/avi"];
    if (!allowedImages.includes(req.files[0].mimetype)) {
      return  res.status(415).send({
    message: "First file must be an image/video (jpeg/png/jpg/mp4/mkv/avi)",
    error: "Invalid file type"
  });
    }
    const updated = await coachService.setWorkAssets(req.coach._id, req.files);
    res.status(200).send({message:"Work image/video updated successfully", workImages: updated.workImages});
  } catch (err) {
    console.error(err);
    const newError = new Error({
          name: "work asset error",
          file: "controllers/coach/coachController",
          description: "error while uploading work asset" + err,
          dateTime: new Date(),
          section: "coach",
          priority: "high",
        });
    await newError.save();
    res.status(500).send({ message: "Error uploading work assets", error:err.message });
  }
}

const checkCookie = async (req, res) => {
  try {
    const rawToken =
      req.headers.token ||
      req.cookies?.CoachAuthToken ||
      (req.headers.authorization &&
        req.headers.authorization.split(" ")[1]);

    if (!rawToken) {
      return res.status(401).send({
        message: "Unauthorized: No token provided",
        error: "Unauthorized",
      });
    }

    let token;
    try {
      token = decrypt(rawToken);
    } catch (e) {
      token = rawToken; // fallback if token is plain
    }

    const coach = await Coach.findOne({ token });
    if (!coach) {
      return res.status(401).send({
        message: "Unauthorized: Coach not found",
        error: "Unauthorized",
      });
    }

    // Optional: decrypt fields safely
    const coachData = {
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
    };

    // Set cookie again (refresh)
    res.cookie("CoachAuthToken", encrypt(token), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: true,
      sameSite: "None",
    });

    return res.status(200).send({
      message: "Token verified successfully",
      token: encrypt(token),
      coach: coachData,
    });
  } catch (err) {
    console.error("checkCookie error:", err);
    const newError = new Error({
      name: "checkCookie error",
      file: "controllers/coach/coachController",
      description: "Error verifying token: " + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();

    return res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const buildProfile = async (req, res) => {
  try {
    // Parse DOB from MM-DD-YYYY
    let [month, day, year] = req.body.dob.split("-").map(Number);
    let dob = new Date(year, month - 1, day);

    // Validate required fields
    if (
      validateInputs(
        req.body.email,
        req.body.dob,
        req.body.gender,
        req.body.pin_code,
        req.body.country,
        req.body.city,
        req.body.address,
        req.body.experience,
        req.body.category,
        req.body.token,
        req.body.languages,
        req.body.client_gender
      )
    ) {
      const updatedCoach = await Coach.findOneAndUpdate(
        { token: decrypt(req.body.token) }, // find coach by decrypted token
        {
          email: encrypt(req.body.email),
          dob: dob,
          gender: encrypt(req.body.gender),
          pinCode: encrypt(req.body.pin_code),
          country: req.body.country,
          city: encrypt(req.body.city),
          address: encrypt(req.body.address),
          experience_year: encrypt(req.body.experience.year),
          experience_months: encrypt(req.body.experience.months),

          category: req.body.category.map((item) => ({
            id: item.id,
            coach_experties_level: item.coach_experties_level, // e.g. ["Beginner", "Advanced"]
            session: item.session.map((s) => ({
              client_experties_level: s.client_experties_level,
              session_type: s.session_type,
              avg_time: s.avg_time,
              avg_price: s.avg_price,
              currency: s.currency,
              slots: s.slots || [],
            })),
          })),

          client_gender: req.body.client_gender.map((g) => encrypt(g)),
          languages: req.body.languages.map((l) => l._id),
          verified: false,
        },
        { new: true }
      );

      if (!updatedCoach) {
        return res.status(404).send({
          message:"Coach not found",
          error:"Not found",
        });
      }

      res.send({ server: true, res: true, data: updatedCoach });
    } else {
      res.status(400).send({
        message:"Please fill all the details",
        error:"Bad Request",
      });
    }
  } catch (err) {
    console.error("Error in build-profile:", err);
    const newError = new ErrorLog({
      name: "build coach profile error",
      file: "controllers/coach/coachController",
      description: "Error while building coach profile: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "low",
    });
    await newError.save();
    res.status(500).send({
      message:"Internal Server Error",
      error:err.message,
    });
  }
};

const deleteCoach = async (req, res) => {
  try {
    const coachId = req.params.id;

    const deletedCoach = await Coach.findByIdAndDelete(coachId);

    if (!deletedCoach) {
      return res.status(404).json({
        message: "Coach not found",
        error:"Not found"
      });
    }

    res.status(200).json({
      message: "Coach deleted successfully",
      data: deletedCoach,
    });
  } catch (err) {
    console.error("Error deleting coach:", err);
    const newError = new ErrorLog({
      name: "delete coach profile error",
      file: "controllers/coach/coachController",
      description: "Error while building coach profile: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "low",
    });
    await newError.save();
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const coachId = req.params.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: "Old password and new password are required",
        error:"Bad Request",
      });
    }

    // Find coach
    const coach = await Coach.findById(coachId);
    if (!coach) {
      return res.status(404).json({
        message: "Coach not found",
        error:"Not found",

      });
    }

    // Decrypt stored password and compare
    const currentPassword = decrypt(coach.password);
    if (currentPassword !== oldPassword) {
      return res.status(401).json({
        message: "Old password is incorrect",
        error:"Not found",
      });
    }

    // Encrypt and save new password
    coach.password = encrypt(newPassword);
    await coach.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("Error updating password:", err);
    const newError = new ErrorLog({
      name: "update password error",
      file: "controllers/coach/coachController",
      description: "Error while updating the password: " + err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "low",
    });
    await newError.save();
    res.status(500).json({
      message: "Internal Server Error",
      error:err.message,
    });
  }
};


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
  uploadWorkAssets,
  checkCookie,
  buildProfile,
  deleteCoach,
  updatePassword,
};
