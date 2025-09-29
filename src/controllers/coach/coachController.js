// controllers/coach/coachController.js
const coachService = require("../../services/coach/coachService");
const otpService = require("../../services/otpService");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const validateInputs = require("../../utils/validateInputs.util");
const Error = require("../../models/errorModel");
const getId = require("../../utils/getId.util");

// Signup — create unverified coach and send OTP (userType=coach)
async function signup(req, res) {
  try {
    const {
      name,
      password,
      mobile,
      mobileVerified,
      agree_terms_conditions,
      agree_privacy_policy,
    } = req.body;

    let token = getId(12);
    // validate required fields
    if (!name || !password || !mobile) {
      return res.status(400).send({
        message: "Please provide name, password, and mobile",
        error: "Bad Request",
      });
    }

    if (agree_terms_conditions !== true || agree_privacy_policy !== true) {
      return res.status(400).send({
        message:
          "You must agree to Terms & Conditions and Privacy Policy to signup",
        error: "Bad Request",
      });
    }

    const newCoach = await coachService.createUnverifiedCoach({
      name,
      password,
      mobile,
      mobileVerified,
      agree_terms_conditions,
      agree_privacy_policy,
      token,
    });
    let encryptedtoken = encrypt(token);
    return res.status(201).send({
      message: "Signup successful",
      data: {
        id: newCoach._id,
        name: newCoach.name,
        mobile: newCoach.mobile,
        mobileVerified: newCoach.mobileVerified,
        agree_terms_conditions: newCoach.agree_terms_conditions,
        agree_privacy_policy: newCoach.agree_privacy_policy,
        token: encryptedtoken,
      },
    });
  } catch (err) {
    console.error("signup error:", err);
    const newError = new Error({
      name: "signup error",
      file: "controllers/coach/coachController",
      description: "error while signup" + err,
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
}

// Verify OTP — verifies via otpService, then sets token on coach and marks mobileVerified
async function verifyOtp(req, res) {
  try {
    const { otp, otpId } = req.body;
    if (!otp || !otpId)
      return res
        .status(400)
        .send({ message: "otp and otpId required", error: "Bad Request" });

    const result = await otpService.verifyOtp(otpId, otp);
    if (!result.ok) {
      // map reasons
      switch (result.reason) {
        case "expired":
          return res.status(410).json({
            message: "OTP expired",
            error: "The requested resource has been permanently removed",
          });
        case "max_attempts":
          return res.status(429).send({
            message: "Max attempts exceeded",
            error: "Too Many Requests",
          });
        default:
          return res
            .status(401)
            .json({ message: "Invalid OTP", error: "Unauthorized" });
      }
    }

    // delegate all DB & formatting logic to service
    const { token, coach } = await coachService.processOtpVerification(
      result.record
    );
    if (!coach) {
      return res
        .status(404)
        .json({ message: "Coach not found", error: "Not found" });
    }

    return res.status(200).send({
      message: "Verified and logged in",
      token: encrypt(token),
      coach,
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
      .send({ message: "internal Server Error", error: err.message });
  }
}

// Login
async function login(req, res) {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res
        .status(400)
        .send({ message: "Provide mobile and password", error: "Bad Request" });

    const result = await coachService.login(mobile, password);
    if (!result)
      return res
        .status(401)
        .send({ message: "Invalid mobile or password", error: "Unauthorized" });

    // result is a formatted coach object which includes token
    const coach = result;

    // Set cookie with encrypted token
    res.cookie("CoachAuthToken", encrypt(coach.token), {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).send({
      message: "Login successful",
      token: encrypt(coach.token),
      coach,
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
      return res
        .status(400)
        .json({ message: "No token provided", error: "Bad Request" });
    let token;
    try {
      token = decrypt(rawToken);
    } catch (e) {
      token = rawToken;
    }
    const coach = await coachService.logout(token);
    if (!coach)
      return res
        .status(404)
        .json({ message: "Coach not found", error: "Not found" });
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
    if (!coachInfo) {
      return res
        .status(404)
        .send({ message: "Coach not found", error: "Not found" });
    }

    return res.status(200).send({
      message: "Personal info found",
      data: coachInfo,
    });
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
      .send({ message: "Internal Server Error", error: err.message });
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
        .send({ message: "Coach not found", error: "Not found" });
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
      .send({ message: "Internal Server Error", error: err.message });
  }
}

// Admin: change status
async function changeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await coachService.changeCoachStatus(id, status);
    if (!updated)
      return res
        .status(404)
        .send({ message: "Coach not found", error: "Not found" });
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
    return res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
}

// Upload certificates
async function uploadCertificates(req, res) {
  try {
    const coachId = req.body.id;
    if (!coachId) {
      return res.status(400).json({ message: "coachId required" });
    }

    // Expect indexes as array in body (same order as files)
    let indexes = req.body.index;

    if (!indexes) {
      return res.status(400).json({ message: "Indexes required" });
    }

    if (!Array.isArray(indexes)) {
      indexes = [indexes]; // make it an array if only one
    }

    indexes = indexes.map(Number);
    if (indexes.some(isNaN)) {
      return res
        .status(400)
        .json({ message: "Invalid certificate index provided" });
    }

    // files may be empty if user wants to delete a certificate
    const files = req.files || [];

    const updated = await coachService.addCertificates(coachId, indexes, files);

    if (!updated) {
      return res.status(404).json({ message: "Coach not found" });
    }

    // Prepare response: separate uploaded and deleted certificates
    const uploaded = [];
    const deleted = [];

    for (let i = 0; i < indexes.length; i++) {
      const idx = indexes[i];
      const file = files.find((f, fIndex) => indexes[fIndex] === idx);
      if (file) uploaded.push({ index: idx, filename: file.filename });
      else deleted.push({ index: idx });
    }

    return res.status(200).json({
      message: "Certificates processed successfully",
      uploaded,
      deleted,
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
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
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
    return res
      .status(200)
      .send({ message: "Agreement saved successfully", data: updated });
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
      .send({ message: "Internal Server Error", error: err.message });
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
    return res
      .status(200)
      .send({ message: "Pricing slots saved successfully", data: updated });
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
      .send({ message: "Internal Server Error", error: err.message });
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
        return res
          .status(200)
          .send({ message: "found list of all the coaches", data: docs });
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
        if (!coach)
          return res
            .status(404)
            .send({ message: "Coach Not found", erro: "Not found" });
        return res
          .status(200)
          .send({ message: "Coach fetched successfully", data: coach });
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
          .send({ message: "Internal Server Error", error: err.message });
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
          message: "Coach liked successfully",
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
          .send({ message: "Internal Server Error", error: err.message });
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
          message: "Caoch disliked successfully",
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
          .send({ message: "Internal Server Error", error: err.message });
      }
    },
    saveCoach: async (req, res) => {
      try {
        const coachId = req.coach?._id;
        const { id } = req.body;
        const updated = await coachService.toggleSaveCoach(coachId, id, "add");
        return res.status(200).send({
          messgae: "Coach saved successfully",
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
          .send({ message: "Internal Server Error", error: err.message });
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
          message: "coach unsaved successfully",
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
          .send({ message: "Internal server error", error: err.message });
      }
    },
  };

// Upload Profile Picture
async function uploadProfilePicture(req, res) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .send({ message: "No file uploaded", error: "Bad Request" });
    }

    // Use full path for storing in DB
    const fullFilePath = req.file.path;

    const updated = await coachService.setProfilePicture(
      req.coach._id,
      fullFilePath
    );

    res.status(200).send({
      message: "Profile picture uploaded successfully",
      data: updated.profilePicture,
    });
  } catch (err) {
    console.error(err);
    const newError = new Error({
      name: "profile picture error",
      file: "controllers/coach/coachController",
      description: "Error while uploading profile picture: " + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    res.status(500).json({
      message: "Error uploading profile picture",
      error: err.message,
    });
  }
}

// Upload Work Images
async function uploadWorkAssets(req, res) {
  try {
    const coachId = req.body.id;
    if (!coachId) return res.status(400).json({ message: "coachId required" });

    let indexes = req.body.index;
    if (!indexes) return res.status(400).json({ message: "Indexes required" });

    if (!Array.isArray(indexes)) indexes = [indexes];
    indexes = indexes.map(Number);
    if (indexes.some(isNaN))
      return res.status(400).json({ message: "Invalid index" });

    const files = req.files || [];

    // Validate file types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "video/mp4",
      "video/mkv",
      "video/avi",
      "video/quicktime",
      "application/octet-stream",
    ];
    for (const f of files) {
      if (!allowedTypes.includes(f.mimetype)) {
        return res.status(415).json({
          message: "Invalid file type. Only images and videos allowed",
        });
      }
    }

    const updatedCoach = await coachService.setWorkAssets(
      coachId,
      indexes,
      files
    );
    if (!updatedCoach)
      return res.status(404).json({ message: "Coach not found" });

    const uploaded = [];
    const deleted = [];
    for (let i = 0; i < indexes.length; i++) {
      const idx = indexes[i];
      const file = files.find((f, fIndex) => indexes[fIndex] === idx);
      if (file) uploaded.push({ index: idx, filename: file.filename });
      else deleted.push({ index: idx });
    }

    res.status(200).json({
      message: "Work assets processed successfully",
      uploaded,
      deleted,
      data: updatedCoach.workAssets,
    });
  } catch (err) {
    console.error("uploadWorkAssets:", err);
    const newError = new Error({
      name: "work asset error",
      file: "controllers/coach/coachController",
      description: "error while uploading work asset" + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}

const checkCookie = async (req, res) => {
  try {
    const rawToken =
      req.headers.token ||
      req.cookies?.CoachAuthToken ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

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

    const coach = await coachService.getCoachByToken(token);
    if (!coach) {
      return res.status(401).send({
        message: "Unauthorized: Coach not found",
        error: "Unauthorized",
      });
    }

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
      coach,
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

async function coachProfileSetup(req, res) {
  try {
    const {
      email,
      dob,
      gender,
      country,
      city,
      address,
      pincode,
      experience_since_date,
      agree_certification,
      agree_experience,
      agree_refund,
      my_activities,
      accepted_genders,
      accepted_languages,
      id,
    } = req.body;

    if (!id) {
      return res.status(400).send({
        message: "id is required",
        error: "Bad Request",
      });
    }

    const updatedCoach = await coachService.coachProfileSetupService({
      email,
      dob,
      gender,
      country,
      city,
      address,
      pincode,
      experience_since_date,
      agree_certification,
      agree_experience,
      agree_refund,
      my_activities,
      accepted_genders,
      accepted_languages,
      id,
    });

    if (!updatedCoach) {
      return res
        .status(404)
        .send({ message: "Coach not found", error: "Not Found" });
    }

    return res
      .status(200)
      .send({ message: "Profile updated successfully", data: updatedCoach });
  } catch (err) {
    console.error("coachProfileSetup error:", err);
    const newError = new Error({
      name: "coach profile setup error",
      file: "controllers/coach/coachController",
      description: "Error while setting up coach profile: " + err,
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

async function saveStory(req, res) {
  try {
    const { id, story } = req.body;

    if (!id || !story) {
      return res.status(400).json({
        message: "Id or Story cannot be empty",
        error: "Bad Request",
      });
    }

    const savedStory = await coachService.saveStoryService({ id, story });

    if (!savedStory) {
      return res
        .status(404)
        .send({ message: "Coach not found", error: "Not Found" });
    }

    return res.status(200).json({
      message: "Story saved successfully",
      data: { story: savedStory.story },
    });
  } catch (err) {
    console.error("saveStory error:", err);
    const newError = new Error({
      name: "save story error",
      file: "controllers/coach/coachController",
      description: "Error while saving the story: " + err,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

async function coachAgreementTerms(req, res) {
  try {
    const { id, agreement_terms } = req.body; // both come from body

    if (!validateInputs(id)) {
      return res.status(400).json({
        message: "Coach ID is required",
        error: "Bad Request",
      });
    }

    if (!validateInputs(agreement_terms)) {
      return res.status(400).json({
        message: "Agreement terms (HTML) are required",
        error: "Bad Request",
      });
    }

    const coachAgreement = await coachService.coachAgreementTermsService({
      id,
      agreement_terms,
    });

    if (!coachAgreement) {
      return res.status(404).json({
        message: "Coach not found",
        error: "Not Found",
      });
    }

    return res.status(200).json({
      message: "Agreement terms updated successfully",
      data: { agreement_terms: coachAgreement.agreement_terms },
    });
  } catch (err) {
    console.error("updateAgreementTerms error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

const deleteCoach = async (req, res) => {
  try {
    const deletedCoach = await coachService.deleteCoach(req.params.id);
    if (!deletedCoach)
      return res
        .status(404)
        .send({ message: "Coach not found", error: "Not found" });

    return res
      .status(200)
      .send({ message: "Coach deleted successfully", data: deletedCoach });
  } catch (err) {
    console.error("deleteCoach error:", err);
    const newError = new Error({
      name: "delete coach error",
      file: "controllers/coach/coachController",
      description: err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        message: "Old and new password required",
        error: "Bad Request",
      });
    }

    const result = await coachService.updatePassword(
      req.params.id,
      oldPassword,
      newPassword
    );
    if (!result) {
      return res
        .status(404)
        .send({ message: "Coach not found", error: "Not found" });
    }
    if (result.error) {
      return res
        .status(401)
        .send({ message: result.error, error: "Unauthorized" });
    }

    return res.status(200).send({ message: "Password updated successfully" });
  } catch (err) {
    console.error("updatePassword error:", err);
    const newError = new Error({
      name: "update password error",
      file: "controllers/coach/coachController",
      description: err.message,
      dateTime: new Date(),
      section: "coach",
      priority: "high",
    });
    await newError.save();
    return res
      .status(500)
      .send({ message: "Internal Server Error", error: err.message });
  }
};

// Check Mobile Number
async function checkMobileAvailability(req, res) {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      return res.status(400).send({
        message: "Mobile number is required",
        error: "Bad Request",
      });
    }

    const available = await coachService.isMobileAvailable(mobile);

    return res.status(200).send({
      message: available
        ? "Mobile number is available"
        : "Mobile number is already registered",
      available,
    });
  } catch (err) {
    console.error("checkMobileAvailability error:", err);
    const newError = new Error({
      name: "check mobile availability error",
      file: "controllers/coach/coachController",
      description: "Error while checking mobile availability: " + err,
      dateTime: new Date(),
      section: "coach",
      priority: "medium",
    });
    await newError.save();
    return res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

// Forget Password (by mobile number instead of id)
async function forgetPassword(req, res) {
  try {
    const { mobile, newPassword } = req.body;

    // Basic validation
    if (!mobile || !newPassword) {
      return res.status(400).send({
        message: "Mobile number and new password are required",
        error: "Bad Request",
      });
    }

    // Extra validation for password strength
    if (newPassword.length < 6) {
      return res.status(400).send({
        message: "Password must be at least 6 characters long",
        error: "Bad Request",
      });
    }

    const updatedCoach = await coachService.forgetPasswordService(
      mobile,
      newPassword
    );

    if (!updatedCoach) {
      return res.status(404).send({
        message: "Coach not found with this mobile",
        error: "Not Found",
      });
    }

    return res.status(200).send({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error("forgetPassword error:", err);
    const newError = new Error({
      name: "forget password error",
      file: "controllers/coach/coachController",
      description: "Error while changing password: " + err,
      dateTime: new Date(),
      section: "coach",
      priority: "medium",
    });
    await newError.save();
    return res.status(500).send({
      message: "Internal Server Error",
      error: err.message,
    });
  }
}

module.exports = {
  signup,
  coachProfileSetup,
  saveStory,
  coachAgreementTerms,
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
  deleteCoach,
  updatePassword,
  checkMobileAvailability,
  forgetPassword,
};
