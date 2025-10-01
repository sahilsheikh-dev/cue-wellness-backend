const coachService = require("../../services/coach/coachService");
const otpService = require("../../services/otpService");
const { encrypt, decrypt } = require("../../utils/cryptography.util");
const validateInputs = require("../../utils/validateInputs.util");
const { logError } = require("../../utils/errorLogger.util");
const path = require("path");

const COOKIE_REFRESH_NAME = "CoachRefreshToken";
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000 * 30; // ~30 days (cookie expiry mirrors refresh token expiry)
/**
 * Helper to set refresh token cookie
 */
function setRefreshCookie(res, refreshTokenPlain) {
  res.cookie(COOKIE_REFRESH_NAME, refreshTokenPlain, {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: process.env.COOKIE_SAMESITE || "Lax",
  });
}

/**
 * Helper to clear refresh cookie
 */
function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_REFRESH_NAME);
}

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

    if (!name || !password || !mobile) {
      return res.status(400).json({
        ok: false,
        message: "Please provide name, password, and mobile",
      });
    }

    if (!agree_terms_conditions || !agree_privacy_policy) {
      return res.status(400).json({
        ok: false,
        message: "You must agree to Terms & Conditions and Privacy Policy",
      });
    }

    const newCoach = await coachService.createUnverifiedCoach({
      name,
      password,
      mobile,
      mobileVerified,
      agree_terms_conditions,
      agree_privacy_policy,
    });

    // Do not auto-login on signup; return created coach and legacy token encrypted for interim flows
    const legacyToken = newCoach.token || null;
    const encryptedLegacyToken = legacyToken ? encrypt(legacyToken) : null;

    return res.status(201).json({
      ok: true,
      message: "Signup successful — verify OTP to finish signup",
      data: {
        id: newCoach._id,
        name: newCoach.name,
        mobile: newCoach.mobile,
        mobileVerified: newCoach.mobileVerified,
        agree_terms_conditions: newCoach.agree_terms_conditions,
        agree_privacy_policy: newCoach.agree_privacy_policy,
        legacyToken: encryptedLegacyToken,
      },
    });
  } catch (err) {
    await logError({
      name: "signup_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("signup error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function verifyOtp(req, res) {
  try {
    const { otp, otpId } = req.body;
    if (!otp || !otpId)
      return res
        .status(400)
        .json({ ok: false, message: "otp and otpId required" });

    const result = await otpService.verifyOtp(otpId, otp);
    if (!result.ok) {
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

    // Accept optional metadata (userAgent, ip) for refresh token record
    const reqMeta = { userAgent: req.get("User-Agent"), ip: req.ip };

    const { accessToken, refreshTokenPlain, coach } =
      await coachService.processOtpVerification(result.record, reqMeta);
    if (!coach)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    setRefreshCookie(res, refreshTokenPlain);

    return res.status(200).json({
      ok: true,
      message: "Verified and logged in",
      accessToken, // JWT - client should store in memory / Authorization header
      coach,
    });
  } catch (err) {
    await logError({
      name: "verifyOtp_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("verifyOtp error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function login(req, res) {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password)
      return res
        .status(400)
        .json({ ok: false, message: "Provide mobile and password" });

    const reqMeta = { userAgent: req.get("User-Agent"), ip: req.ip };
    const result = await coachService.login(mobile, password, reqMeta);
    if (!result)
      return res
        .status(401)
        .json({ ok: false, message: "Invalid mobile or password" });

    setRefreshCookie(res, result.refreshTokenPlain);

    return res.status(200).json({
      ok: true,
      message: "Login successful",
      accessToken: result.accessToken,
      coach: result.coach,
    });
  } catch (err) {
    await logError({
      name: "login_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("login error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/**
 * Refresh endpoint
 * Reads refresh token from cookie (CoachRefreshToken) or body.refreshToken
 * If valid, rotates refresh token and returns a new access token (and sets new refresh cookie).
 */
async function refreshToken(req, res) {
  try {
    const refreshTokenPlain =
      req.cookies?.[COOKIE_REFRESH_NAME] || req.body?.refreshToken;
    if (!refreshTokenPlain)
      return res
        .status(401)
        .json({ ok: false, message: "No refresh token provided" });

    const reqMeta = { userAgent: req.get("User-Agent"), ip: req.ip };
    const refreshed = await coachService.refreshAccessToken(
      refreshTokenPlain,
      reqMeta
    );
    if (!refreshed.ok) {
      // Clear cookie if invalid / expired
      clearRefreshCookie(res);
      return res
        .status(401)
        .json({ ok: false, message: "Invalid or expired refresh token" });
    }

    // If rotated a new refresh token, set it as cookie
    if (refreshed.refreshTokenPlain)
      setRefreshCookie(res, refreshed.refreshTokenPlain);

    return res.status(200).json({
      ok: true,
      accessToken: refreshed.accessToken,
      coach: refreshed.coach,
    });
  } catch (err) {
    await logError({
      name: "refreshToken_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("refreshToken error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function logout(req, res) {
  try {
    // try to read refresh token cookie to revoke
    const refreshTokenPlain =
      req.cookies?.[COOKIE_REFRESH_NAME] || req.body?.refreshToken;
    const coachId = req.coach?._id || null;

    // if refresh token provided, revoke only that one; else if coachId present => clear all
    const ok = await coachService.logout(refreshTokenPlain, coachId);
    clearRefreshCookie(res);
    return res.status(200).json({ ok: true, message: "Logout successful" });
  } catch (err) {
    await logError({
      name: "logout_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("logout error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/* --- checkCookie now validates access JWT (if provided) and returns coach info --- */
async function checkCookie(req, res) {
  try {
    // Accept Authorization: Bearer <token> OR cookie 'accessToken' OR we can try refresh flow
    const authHeader = req.headers.authorization;
    const accessFromHeader =
      (authHeader && authHeader.split && authHeader.split(" ")[1]) || null;
    // fallback to refresh flow: exchange refresh token for access token
    if (!accessFromHeader) {
      // try cookie refresh
      const refreshTokenPlain = req.cookies?.[COOKIE_REFRESH_NAME];
      if (!refreshTokenPlain)
        return res
          .status(401)
          .json({ ok: false, message: "No token provided" });
      const refreshed = await coachService.refreshAccessToken(
        refreshTokenPlain,
        { userAgent: req.get("User-Agent"), ip: req.ip }
      );
      if (!refreshed.ok) {
        clearRefreshCookie(res);
        return res.status(401).json({ ok: false, message: "Invalid tokens" });
      }
      if (refreshed.refreshTokenPlain)
        setRefreshCookie(res, refreshed.refreshTokenPlain);
      return res.status(200).json({
        ok: true,
        message: "Token verified",
        accessToken: refreshed.accessToken,
        coach: refreshed.coach,
      });
    }

    // If access token provided, simply verify and return coach info
    const accessToken = accessFromHeader;
    // We'll rely on the verifyCoach middleware in typical flows; here we just show an endpoint that can validate tokens via middleware elsewhere.
    // For simplicity, call verify middleware logic by decoding and fetching coach
    const { verifyAccessToken } = require("../../utils/jwt.util");
    const decoded = verifyAccessToken(accessToken);
    if (!decoded || !decoded.sub)
      return res
        .status(401)
        .json({ ok: false, message: "Invalid access token" });

    const coach = await coachService.getCoachById(decoded.sub);
    if (!coach)
      return res.status(401).json({ ok: false, message: "Coach not found" });

    return res
      .status(200)
      .json({ ok: true, message: "Token verified", accessToken, coach });
  } catch (err) {
    await logError({
      name: "checkCookie_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("checkCookie error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/* ---------- Remaining controller functions are unchanged and will continue to use coachService ---------- */
/* ... keep the rest of your controller functions (getPersonalInfo, updateProfile, uploadCertificates, etc.) as they were.
   For brevity I will include them below unchanged — they still work because verifyCoach middleware sets req.coach. */

async function getPersonalInfo(req, res) {
  try {
    const coach = req.coach;
    if (!coach)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const coachInfo = await coachService.getCoachById(coach._id);
    if (!coachInfo)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res
      .status(200)
      .json({ ok: true, message: "Personal info found", data: coachInfo });
  } catch (err) {
    await logError({
      name: "getPersonalInfo_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("getPersonalInfo error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function updateProfile(req, res) {
  try {
    const coachId = req.coach?._id || req.params.id;
    const updated = await coachService.updateCoach(coachId, req.body);
    if (!updated)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: "Profile updated successfully",
      data: updated,
    });
  } catch (err) {
    await logError({
      name: "updateProfile_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("updateProfile error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function changeStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await coachService.changeCoachStatus(id, status);
    if (!updated)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res
      .status(200)
      .json({ ok: true, message: "Status updated", data: updated });
  } catch (err) {
    await logError({
      name: "changeStatus_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("changeStatus error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function blockUnblockCoach(req, res) {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    if (typeof isBlocked !== "boolean")
      return res
        .status(400)
        .json({ ok: false, message: "isBlocked must be boolean" });

    const updated = await coachService.toggleBlockStatus(id, isBlocked);
    if (!updated)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: isBlocked
        ? "Coach blocked successfully"
        : "Coach unblocked successfully",
      data: updated,
    });
  } catch (err) {
    await logError({
      name: "blockUnblockCoach_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("blockUnblockCoach error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/**
 * Upload / update / delete a certificate
 * - form-data: file (single, optional), certificateId (optional)
 * - If certificateId + file => update that certificate subdoc (replace file on disk)
 * - If certificateId + no file => delete certificate subdoc + disk file
 * - If no certificateId + file => create new certificate subdoc for the coach
 */
async function uploadCertificates(req, res) {
  try {
    const coachId = req.coach?._id;
    if (!coachId)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    // Allow certificateId to be passed either as form field 'certificateId' or body
    const certificateId = req.body.certificateId || req.body.id || null;
    const file = req.file || null; // single file upload 'file'
    const result = await coachService.uploadCertificateSingle(
      coachId,
      certificateId,
      file
    );

    return res.status(200).json({
      ok: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await logError({
      name: "uploadCertificates_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("uploadCertificates error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

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
      .json({ ok: true, message: "Agreement saved", data: updated });
  } catch (err) {
    await logError({
      name: "saveAgreement_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("saveAgreement error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

// Save session slots for a coach and a specific category and sessionKey.
async function savePricingSlots(req, res) {
  try {
    const coachId = req.coach?._id || req.body.coachId;
    if (!coachId)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const { categoryId, sessionKey, level, payload } = req.body;

    if (!categoryId || !sessionKey || !payload) {
      return res.status(400).json({
        ok: false,
        message:
          "categoryId, sessionKey and payload are required. payload should contain selectedLevels, sessions and discounts.",
      });
    }

    // basic structural validation
    if (
      typeof payload !== "object" ||
      (!payload.sessions && !payload.selectedLevels && !payload.discounts)
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Invalid payload shape. Expected payload to contain sessions and/or discounts and selectedLevels.",
      });
    }

    const updated = await coachService.saveSessionSlots(
      coachId,
      categoryId,
      sessionKey,
      level,
      payload
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res
      .status(200)
      .json({ ok: true, message: "Pricing slots saved", data: updated });
  } catch (err) {
    await logError({
      name: "savePricingSlots_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("savePricingSlots error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/**
 * Get session slots for coach and categoryId
 * Returns the category object or null
 */
async function getPricingSlots(req, res) {
  try {
    const coachId = req.coach?._id;
    if (!coachId)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const categoryId = req.params.categoryId;
    if (!categoryId)
      return res
        .status(400)
        .json({ ok: false, message: "categoryId required" });

    const category = await coachService.getSessionSlots(coachId, categoryId);
    if (!category)
      return res.status(404).json({ ok: false, message: "Not found" });

    return res.status(200).json({ ok: true, data: category });
  } catch (err) {
    await logError({
      name: "getPricingSlots_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("getPricingSlots error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/* List/get/like/dislike/save/unsave unchanged but wrapped with logError on exceptions for consistency */
const list = async (req, res) => {
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
      .json({ ok: true, message: "Coaches fetched", data: docs });
  } catch (err) {
    await logError({
      name: "list_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("list error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const getById = async (req, res) => {
  try {
    const coach = await coachService.getCoachById(req.params.id);
    if (!coach)
      return res.status(404).json({ ok: false, message: "Coach not found" });
    return res
      .status(200)
      .json({ ok: true, message: "Coach fetched", data: coach });
  } catch (err) {
    await logError({
      name: "getById_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("getById error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const likeActivity = async (req, res) => {
  try {
    const coachId = req.coach?._id;
    const { id } = req.body;
    const updated = await coachService.toggleLikeActivity(coachId, id, "add");
    return res.status(200).json({
      ok: true,
      message: "Activity liked",
      data: updated.liked_activities,
    });
  } catch (err) {
    await logError({
      name: "likeActivity_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("likeActivity error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const dislikeActivity = async (req, res) => {
  try {
    const coachId = req.coach?._id;
    const { id } = req.body;
    const updated = await coachService.toggleLikeActivity(
      coachId,
      id,
      "remove"
    );
    return res.status(200).json({
      ok: true,
      message: "Activity disliked",
      data: updated.liked_activities,
    });
  } catch (err) {
    await logError({
      name: "dislikeActivity_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("dislikeActivity error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const saveCoach = async (req, res) => {
  try {
    const coachId = req.coach?._id;
    const { id } = req.body;
    const updated = await coachService.toggleSaveCoach(coachId, id, "add");
    return res
      .status(200)
      .json({ ok: true, message: "Coach saved", data: updated.saved_coaches });
  } catch (err) {
    await logError({
      name: "saveCoach_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("saveCoach error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const unsaveCoach = async (req, res) => {
  try {
    const coachId = req.coach?._id;
    const { id } = req.body;
    const updated = await coachService.toggleSaveCoach(coachId, id, "remove");
    return res.status(200).json({
      ok: true,
      message: "Coach unsaved",
      data: updated.saved_coaches,
    });
  } catch (err) {
    await logError({
      name: "unsaveCoach_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("unsaveCoach error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

/**
 * Upload or update profile picture
 * - This expects req.file (single) and uses req.coach._id
 * - If req.file present: replace profile picture (delete old file)
 */
async function uploadProfilePicture(req, res) {
  try {
    const coachId = req.coach?._id;
    if (!coachId)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const file = req.file || null;
    if (!file) {
      return res.status(400).json({ ok: false, message: "file required" });
    }

    const updated = await coachService.setProfilePicture(
      coachId,
      file.path || file.filename
    );
    if (!updated)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: "Profile picture uploaded",
      data: updated.profilePicture,
    });
  } catch (err) {
    await logError({
      name: "uploadProfilePicture_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("uploadProfilePicture error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

/**
 * Upload / update / delete a work asset
 * - form-data: file (single, optional), assetId (optional)
 * - If assetId + file => update existing asset
 * - If assetId + no file => delete existing asset
 * - If no assetId + file => create new asset
 */
async function uploadWorkAssets(req, res) {
  try {
    const coachId = req.coach?._id;
    if (!coachId)
      return res.status(401).json({ ok: false, message: "Unauthorized" });

    const assetId = req.body.assetId || req.body.id || null;
    const file = req.file || null;
    const result = await coachService.uploadWorkAssetSingle(
      coachId,
      assetId,
      file
    );

    return res.status(200).json({
      ok: true,
      message: result.message,
      data: result.data,
    });
  } catch (err) {
    await logError({
      name: "uploadWorkAssets_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      section: "coach",
      priority: "high",
    });
    console.error("uploadWorkAssets error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function checkCookie(req, res) {
  try {
    const rawToken =
      req.headers.token ||
      req.cookies?.[COOKIE_NAME] ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!rawToken)
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized: No token provided" });

    let token = decrypt(rawToken) || rawToken;

    const coach = await coachService.getCoachByToken(token);
    if (!coach)
      return res
        .status(401)
        .json({ ok: false, message: "Unauthorized: Coach not found" });

    // refresh cookie
    res.cookie(COOKIE_NAME, encrypt(token), {
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: process.env.COOKIE_SAMESITE || "Lax",
    });

    return res.status(200).json({
      ok: true,
      message: "Token verified",
      token: encrypt(token),
      coach,
    });
  } catch (err) {
    await logError({
      name: "checkCookie_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("checkCookie error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function coachProfileSetup(req, res) {
  try {
    const payload = { ...req.body, id: req.body.id };
    if (!payload.id)
      return res.status(400).json({ ok: false, message: "id is required" });

    const updatedCoach = await coachService.coachProfileSetupService(payload);
    if (!updatedCoach)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: "Profile updated successfully",
      data: updatedCoach,
    });
  } catch (err) {
    await logError({
      name: "coachProfileSetup_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("coachProfileSetup error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function saveStory(req, res) {
  try {
    const { id, story } = req.body;
    if (!id || !story)
      return res
        .status(400)
        .json({ ok: false, message: "Id and story required" });

    const savedStory = await coachService.saveStoryService({ id, story });
    if (!savedStory)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: "Story saved",
      data: { story: savedStory.story },
    });
  } catch (err) {
    await logError({
      name: "saveStory_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("saveStory error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

async function coachAgreementTerms(req, res) {
  try {
    const { id, agreement_terms } = req.body;
    if (!validateInputs(id))
      return res
        .status(400)
        .json({ ok: false, message: "Coach ID is required" });
    if (!validateInputs(agreement_terms))
      return res
        .status(400)
        .json({ ok: false, message: "Agreement terms required" });

    const coachAgreement = await coachService.coachAgreementTermsService({
      id,
      agreement_terms,
    });
    if (!coachAgreement)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: "Agreement terms updated",
      data: { agreement_terms: coachAgreement.agreement_terms },
    });
  } catch (err) {
    await logError({
      name: "coachAgreementTerms_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("coachAgreementTerms error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
}

const deleteCoach = async (req, res) => {
  try {
    const deletedCoach = await coachService.deleteCoach(req.params.id);
    if (!deletedCoach)
      return res.status(404).json({ ok: false, message: "Coach not found" });

    return res.status(200).json({
      ok: true,
      message: "Coach deleted successfully",
      data: deletedCoach,
    });
  } catch (err) {
    await logError({
      name: "deleteCoach_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("deleteCoach error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res
        .status(400)
        .json({ ok: false, message: "Old and new password required" });

    const result = await coachService.updatePassword(
      req.params.id,
      oldPassword,
      newPassword
    );
    if (!result)
      return res.status(404).json({ ok: false, message: "Coach not found" });
    if (result.error)
      return res.status(401).json({ ok: false, message: result.error });

    return res
      .status(200)
      .json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    await logError({
      name: "updatePassword_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "high",
    });
    console.error("updatePassword error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const checkMobileAvailability = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile)
      return res
        .status(400)
        .json({ ok: false, message: "Mobile number is required" });
    const available = await coachService.isMobileAvailable(mobile);
    return res.status(200).json({
      ok: true,
      message: available ? "Mobile available" : "Mobile already registered",
      available,
    });
  } catch (err) {
    await logError({
      name: "checkMobileAvailability_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "medium",
    });
    console.error("checkMobileAvailability error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { mobile, newPassword } = req.body;
    if (!mobile || !newPassword)
      return res
        .status(400)
        .json({ ok: false, message: "Mobile and new password required" });
    if (newPassword.length < 6)
      return res
        .status(400)
        .json({ ok: false, message: "Password must be at least 6 characters" });

    const updatedCoach = await coachService.forgetPasswordService(
      mobile,
      newPassword
    );
    if (!updatedCoach)
      return res
        .status(404)
        .json({ ok: false, message: "Coach not found with this mobile" });

    return res
      .status(200)
      .json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    await logError({
      name: "forgetPassword_exception",
      file: "controllers/coach/coachController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "coach",
      priority: "medium",
    });
    console.error("forgetPassword error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal Server Error" });
  }
};

module.exports = {
  signup,
  coachProfileSetup,
  saveStory,
  coachAgreementTerms,
  verifyOtp,
  login,
  refreshToken,
  logout,
  getPersonalInfo,
  updateProfile,
  changeStatus,
  blockUnblockCoach,
  saveAgreement,
  savePricingSlots,
  getPricingSlots,
  list,
  getById,
  likeActivity,
  dislikeActivity,
  saveCoach,
  unsaveCoach,
  uploadProfilePicture,
  uploadCertificates,
  uploadWorkAssets,
  checkCookie,
  deleteCoach,
  updatePassword,
  checkMobileAvailability,
  forgetPassword,
};
