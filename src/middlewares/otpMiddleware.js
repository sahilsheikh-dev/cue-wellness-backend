const { decrypt } = require("../utils/cryptography.util");
const OtpRequest = require("../models/otpModel");
const { logError } = require("../utils/errorLogger.util");

/**
 * validateOtpId middleware:
 * - expects req.body.otpId (encrypted) to exist
 * - decodes and ensures record exists and attaches it to req.otpRecord
 * - optionally, if req.body.userType provided, verifies it matches the record's userType
 */
async function validateOtpId(req, res, next) {
  try {
    const { otpId, userType } = req.body;
    if (!otpId) {
      await logError({
        name: "validateOtpId_missing",
        file: "middlewares/otpMiddleware.js",
        description: "otpId missing from request body",
        section: "otp",
        priority: "low",
      });
      return res.status(400).json({ ok: false, message: "otpId required" });
    }

    const rawId = decrypt(otpId);
    if (!rawId) {
      await logError({
        name: "validateOtpId_decrypt_failed",
        file: "middlewares/otpMiddleware.js",
        description: "Invalid otpId - decrypt failed or null",
        section: "otp",
        priority: "medium",
      });
      return res.status(400).json({ ok: false, message: "Invalid otpId" });
    }

    const record = await OtpRequest.findOne({ otpId: rawId });
    if (!record) {
      await logError({
        name: "validateOtpId_not_found",
        file: "middlewares/otpMiddleware.js",
        description: `OTP request not found for otpId: ${String(rawId).slice(
          0,
          60
        )}`,
        section: "otp",
        priority: "medium",
      });
      return res
        .status(404)
        .json({ ok: false, message: "OTP request not found" });
    }

    if (userType && record.userType !== userType) {
      await logError({
        name: "validateOtpId_userType_mismatch",
        file: "middlewares/otpMiddleware.js",
        description: `otpId userType mismatch. expected ${userType} got ${record.userType}`,
        section: "otp",
        priority: "low",
      });
      return res
        .status(400)
        .json({ ok: false, message: "otpId does not match userType" });
    }

    req.otpRecord = record;
    next();
  } catch (err) {
    // Log full exception with stack
    await logError({
      name: "validateOtpId_exception",
      file: "middlewares/otpMiddleware.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    console.error("validateOtpId error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
}

module.exports = { validateOtpId };
