const { decrypt } = require("../utils/cryptography.util");
const OtpRequest = require("../models/otpModel");

/**
 * validateOtpId middleware:
 * - expects req.body.otpId (encrypted) to exist
 * - decodes and ensures record exists and attaches it to req.otpRecord
 * - optionally, if req.body.userType provided, verifies it matches the record's userType
 */
async function validateOtpId(req, res, next) {
  try {
    const { otpId, userType } = req.body;
    if (!otpId)
      return res.status(400).json({ ok: false, message: "otpId required" });

    const rawId = decrypt(otpId);
    if (!rawId)
      return res.status(400).json({ ok: false, message: "Invalid otpId" });

    const record = await OtpRequest.findOne({ otpId: rawId });
    if (!record)
      return res
        .status(404)
        .json({ ok: false, message: "OTP request not found" });

    if (userType && record.userType !== userType) {
      return res
        .status(400)
        .json({ ok: false, message: "otpId does not match userType" });
    }

    req.otpRecord = record;
    next();
  } catch (err) {
    console.error("validateOtpId error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
}

module.exports = { validateOtpId };
