const otpService = require("../services/otpService");
const { logError } = require("../utils/errorLogger.util");

const ALLOWED_USER_TYPES = [
  "client",
  "coach",
  "eventOrganizer",
  "productCompany",
];
/**
 * POST /api/otp/send
 * body: { phone: "+97150...", userType: "coach", operation: "login" }
 */
async function sendOtp(req, res) {
  try {
    const { phone, userType, meta, operation } = req.body;
    if (!phone) {
      await logError({
        name: "sendOtp_missing_phone",
        file: "controllers/otpController.js",
        description: "phone missing from request body",
        section: "otp",
        priority: "low",
      });
      return res.status(400).json({ ok: false, message: "phone required" });
    }

    const ut = userType || "client";
    if (!ALLOWED_USER_TYPES.includes(ut)) {
      await logError({
        name: "sendOtp_invalid_userType",
        file: "controllers/otpController.js",
        description: `Invalid userType ${ut}`,
        section: "otp",
        priority: "low",
      });
      return res.status(400).json({ ok: false, message: "Invalid userType" });
    }

    const result = await otpService.createAndSendOtp(phone, {
      userType: ut,
      meta: meta || { ip: req.ip },
      operation: operation || "login",
    });
    return res.status(201).json({ ok: true, ...result });
  } catch (err) {
    await logError({
      name: "sendOtp_exception",
      file: "controllers/otpController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    console.error("sendOtp error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error sending OTP", error: err.message });
  }
}

/**
 * POST /api/otp/verify
 * body: { otpId: "<encrypted>", otp: "123456" }
 */
async function verifyOtp(req, res) {
  try {
    const { otpId, otp } = req.body;
    if (!otpId || !otp) {
      await logError({
        name: "verifyOtp_missing_fields",
        file: "controllers/otpController.js",
        description: "otpId and/or otp missing",
        section: "otp",
        priority: "low",
      });
      return res
        .status(400)
        .json({ ok: false, message: "otpId and otp required" });
    }

    const result = await otpService.verifyOtp(otpId, otp);
    if (result.ok) {
      return res.status(200).json({
        ok: true,
        message: "Verified",
        recordId: result.record._id,
        userType: result.record.userType,
        phone: result.record.phone,
      });
    }

    // Log verification failure with different priorities
    const reason = result.reason || "unknown";
    const priority =
      reason === "invalid_otpId" || reason === "expired"
        ? "medium"
        : reason === "max_attempts"
        ? "high"
        : "low";
    await logError({
      name: `verifyOtp_${reason}`,
      file: "controllers/otpController.js",
      description: `verifyOtp failed: reason=${reason}`,
      section: "otp",
      priority,
    });

    switch (reason) {
      case "expired":
        return res.status(410).json({ ok: false, message: "OTP expired" });
      case "max_attempts":
        return res
          .status(429)
          .json({ ok: false, message: "Maximum attempts exceeded" });
      case "invalid_code":
      case "invalid_otpId":
      default:
        return res
          .status(401)
          .json({ ok: false, message: "Invalid OTP or OTP ID" });
    }
  } catch (err) {
    await logError({
      name: "verifyOtp_exception",
      file: "controllers/otpController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    console.error("verifyOtp error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Verification failed", error: err.message });
  }
}

/**
 * POST /api/otp/resend
 * body: { otpId: "<encrypted>" }
 */
async function resendOtp(req, res) {
  try {
    const { otpId } = req.body;
    if (!otpId) {
      await logError({
        name: "resendOtp_missing_otpId",
        file: "controllers/otpController.js",
        description: "otpId missing from request body",
        section: "otp",
        priority: "low",
      });
      return res.status(400).json({ ok: false, message: "otpId required" });
    }

    const result = await otpService.resendOtp(otpId);
    if (result.ok === true) {
      return res.status(200).json({ ok: true, message: "OTP resent" });
    }
    if (result.otpId) {
      return res.status(200).json({ ok: true, ...result });
    }

    // log resend failure
    await logError({
      name: `resendOtp_${result.reason || "failed"}`,
      file: "controllers/otpController.js",
      description: `resendOtp failed: reason=${result.reason || "unknown"}`,
      section: "otp",
      priority: result.reason === "resend_limit_reached" ? "medium" : "low",
    });

    return res.status(400).json({
      ok: false,
      message: "Could not resend OTP",
      reason: result.reason,
    });
  } catch (err) {
    await logError({
      name: "resendOtp_exception",
      file: "controllers/otpController.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    console.error("resendOtp error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Error resending OTP", error: err.message });
  }
}

module.exports = {
  sendOtp,
  verifyOtp,
  resendOtp,
};
