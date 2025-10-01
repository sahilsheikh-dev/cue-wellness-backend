const otpService = require("../services/otpService");

const ALLOWED_USER_TYPES = [
  "client",
  "coach",
  "eventOrganizer",
  "productCompany",
];

/**
 * POST /api/otp/send
 * body: { phone: "+97150...", userType: "coach" }
 */
async function sendOtp(req, res) {
  try {
    const { phone, userType, meta } = req.body;
    if (!phone)
      return res.status(400).json({ ok: false, message: "phone required" });

    const ut = userType || "client";
    if (!ALLOWED_USER_TYPES.includes(ut)) {
      return res.status(400).json({ ok: false, message: "Invalid userType" });
    }

    const result = await otpService.createAndSendOtp(phone, {
      userType: ut,
      meta: meta || { ip: req.ip },
    });
    return res.status(201).json({ ok: true, ...result });
  } catch (err) {
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
    if (!otpId || !otp)
      return res
        .status(400)
        .json({ ok: false, message: "otpId and otp required" });

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

    switch (result.reason) {
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
    console.error("verifyOtp error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Verification failed", error: err.message });
  }
}

/**
 * POST /api/otp/resend
 * body: { otpId: "<encrypted>" }
 * validateOtpId middleware will attach req.otpRecord (but service accepts encrypted id)
 */
async function resendOtp(req, res) {
  try {
    const { otpId } = req.body;
    if (!otpId)
      return res.status(400).json({ ok: false, message: "otpId required" });

    const result = await otpService.resendOtp(otpId);
    if (result.ok === true) {
      return res.status(200).json({ ok: true, message: "OTP resent" });
    }
    if (result.otpId) {
      return res.status(200).json({ ok: true, ...result });
    }

    return res.status(400).json({
      ok: false,
      message: "Could not resend OTP",
      reason: result.reason,
    });
  } catch (err) {
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
