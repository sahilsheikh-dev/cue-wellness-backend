// services/otpService.js
const OtpRequest = require("../models/otpModel");
const { encrypt, decrypt } = require("../utils/cryptography.util");
const getId = require("../utils/getId.util");
const twilio = require("twilio");

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  OTP_EXPIRE_MINUTES,
  OTP_MAX_ATTEMPTS,
} = process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
const DEFAULT_EXPIRE_MINUTES = parseInt(OTP_EXPIRE_MINUTES || "10", 10);
const DEFAULT_MAX_ATTEMPTS = parseInt(OTP_MAX_ATTEMPTS || "5", 10);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an OTP record and send OTP.
 * @param {string} phone
 * @param {object} opts - { userType: 'coach', meta: {} }
 * @returns {Object} { otpId: <encrypted> }
 */
async function createAndSendOtp(phone, opts = {}) {
  const { userType = "client", meta = {} } = opts;
  if (!phone) throw new Error("Phone number required");
  if (!userType) throw new Error("userType required");

  const otp = generateOtp();
  const otpId = getId(12);
  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000);

  const record = new OtpRequest({
    phone,
    userType,
    otpEncrypted: encrypt(otp),
    otpId,
    maxAttempts: DEFAULT_MAX_ATTEMPTS,
    expiresAt,
    meta,
  });

  await record.save();

  // Send via Twilio Verify service if configured, otherwise fallback to messages API
  try {
    if (TWILIO_VERIFY_SERVICE_SID) {
      await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: phone, channel: "sms" });
    } else {
      await client.messages.create({
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Your verification code is ${otp}`,
      });
    }
  } catch (err) {
    // If Twilio fails, still keep record (admin can inspect) and throw to caller
    throw new Error("Failed to send OTP: " + err.message);
  }

  return { otpId: encrypt(otpId) }; // return encrypted otpId to client
}

/**
 * Verify OTP for encrypted otpId
 * @param {string} otpIdEncrypted
 * @param {string} otp
 */
async function verifyOtp(otpIdEncrypted, otp) {
  if (!otpIdEncrypted || !otp) throw new Error("otpId and otp required");

  let otpId;
  try {
    otpId = decrypt(otpIdEncrypted);
  } catch (err) {
    return { ok: false, reason: "invalid_otpId" };
  }

  const record = await OtpRequest.findOne({ otpId });
  if (!record) return { ok: false, reason: "invalid_otpId" };
  if (record.verified) return { ok: false, reason: "already_verified" };
  if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };
  if (record.attempts >= record.maxAttempts)
    return { ok: false, reason: "max_attempts" };

  // Prefer Twilio Verify service for checking if configured
  if (TWILIO_VERIFY_SERVICE_SID) {
    try {
      const verificationCheck = await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: record.phone, code: otp });

      if (verificationCheck.status === "approved") {
        record.verified = true;
        await record.save();
        return { ok: true, record };
      } else {
        record.attempts += 1;
        await record.save();
        return { ok: false, reason: "invalid_code" };
      }
    } catch (err) {
      // Twilio error — don't leak provider errors
      record.attempts += 1;
      await record.save();
      return { ok: false, reason: "invalid_code" };
    }
  }

  // Fallback: local verification using encrypted otp stored
  try {
    const storedOtp = decrypt(record.otpEncrypted);
    if (storedOtp === otp) {
      record.verified = true;
      await record.save();
      return { ok: true, record };
    } else {
      record.attempts += 1;
      await record.save();
      return { ok: false, reason: "invalid_code" };
    }
  } catch (err) {
    record.attempts += 1;
    await record.save();
    return { ok: false, reason: "invalid_code" };
  }
}

/**
 * Resend OTP for provided encrypted otpId.
 * Keeps userType consistent. If expired -> create new record (preserving userType).
 */
async function resendOtp(otpIdEncrypted) {
  if (!otpIdEncrypted) throw new Error("otpId required");

  let otpId;
  try {
    otpId = decrypt(otpIdEncrypted);
  } catch (err) {
    return { ok: false, reason: "invalid_otpId" };
  }

  const record = await OtpRequest.findOne({ otpId });
  if (!record) return { ok: false, reason: "invalid_otpId" };
  if (record.verified) return { ok: false, reason: "already_verified" };

  if (record.expiresAt < new Date()) {
    // expired: create a fresh OTP for same phone & userType
    return await createAndSendOtp(record.phone, {
      userType: record.userType,
      meta: record.meta,
    });
  }

  // otherwise update OTP in-place
  const newOtp = generateOtp();
  record.otpEncrypted = encrypt(newOtp);
  record.attempts = 0;
  record.expiresAt = new Date(Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000);
  await record.save();

  try {
    if (TWILIO_VERIFY_SERVICE_SID) {
      await client.verify.v2
        .services(TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: record.phone, channel: "sms" });
    } else {
      await client.messages.create({
        to: record.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: `Your verification code is ${newOtp}`,
      });
    }
  } catch (err) {
    throw new Error("Failed to resend OTP: " + err.message);
  }

  return { ok: true };
}

module.exports = {
  createAndSendOtp,
  verifyOtp,
  resendOtp,
};
