const OtpRequest = require("../models/otpModel");
const { encrypt, decrypt } = require("../utils/cryptography.util");
const getId = require("../utils/getId.util");
const { logError } = require("../utils/errorLogger.util");

// Env / defaults
const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SERVICE_SID,
  TWILIO_PHONE_NUMBER,
  OTP_EXPIRE_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_INTERVAL_SECONDS,
  OTP_MAX_RESENDS,
} = process.env;

const DEFAULT_EXPIRE_MINUTES = parseInt(OTP_EXPIRE_MINUTES || "10", 10);
const DEFAULT_MAX_ATTEMPTS = parseInt(OTP_MAX_ATTEMPTS || "5", 10);
const DEFAULT_RESEND_INTERVAL_MS =
  parseInt(OTP_RESEND_INTERVAL_SECONDS || "30", 10) * 1000;
const DEFAULT_MAX_RESENDS = parseInt(OTP_MAX_RESENDS || "5", 10);

let client = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  const twilio = require("twilio");
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// helper to normalize phone (best-effort). For production use libphonenumber-js/E.164
function normalizePhone(phone) {
  if (!phone) return phone;
  const trimmed = phone.replace(/\s+/g, "");

  // Basic E.164 validation
  const e164 = /^\+[1-9]\d{6,14}$/;
  if (!e164.test(trimmed)) {
    throw new Error(`Invalid phone number format: ${trimmed}`);
  }

  return trimmed;
}

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an OTP record and send OTP.
 * @param {string} phoneRaw
 * @param {object} opts - { userType: 'coach', meta: {}, operation: 'login' }
 * @returns {Object} { otpId: <encrypted> }
 */
async function createAndSendOtp(phoneRaw, opts = {}) {
  try {
    const phone = normalizePhone(phoneRaw);
    const { userType = "client", meta = {}, operation } = opts;

    if (!phone) throw new Error("Phone required");

    // throttle: check for very recent send
    const existingActive = await OtpRequest.findOne({
      phone,
      userType,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (existingActive) {
      const lastSent = existingActive.lastSentAt
        ? new Date(existingActive.lastSentAt).getTime()
        : 0;
      if (Date.now() - lastSent < DEFAULT_RESEND_INTERVAL_MS) {
        throw new Error("OTP just sent. Please wait a moment before retrying.");
      }
      // optional: we could reuse/update existingActive instead of creating new doc
    }

    const otpPlain = generateOtp();
    const otpId = getId(12);
    const expiresAt = new Date(Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000);

    const provider =
      client && TWILIO_VERIFY_SERVICE_SID
        ? "twilio"
        : client && TWILIO_PHONE_NUMBER
        ? "twilio-sms"
        : "local";

    const doc = new OtpRequest({
      phone,
      userType,
      operation: operation || undefined,
      otpEncrypted: provider === "local" ? encrypt(otpPlain) : undefined,
      otpId,
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
      expiresAt,
      lastSentAt: new Date(),
      resendCount: 0,
      meta,
      provider,
    });

    await doc.save();

    // Send via provider or fallback to local SMS
    try {
      if (provider === "twilio" && client && TWILIO_VERIFY_SERVICE_SID) {
        await client.verify.v2
          .services(TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({ to: phone, channel: "sms" });
      } else if (provider === "twilio-sms" && client && TWILIO_PHONE_NUMBER) {
        await client.messages.create({
          to: phone,
          from: TWILIO_PHONE_NUMBER,
          body: `Your verification code is ${otpPlain}`,
        });
      } else if (provider === "local") {
        // No SMS transport configured — keep record but inform caller
        // Log as error because OTP not delivered
        await logError({
          name: "otp_send_no_provider",
          file: "services/otpService.js",
          description: `No SMS provider configured; otpId=${String(otpId).slice(
            0,
            60
          )}`,
          section: "otp",
          priority: "high",
        });
        throw new Error("No SMS provider configured to send OTP");
      }
    } catch (err) {
      // If sending fails we delete the record to avoid orphaned unverified entries
      try {
        await OtpRequest.findByIdAndDelete(doc._id);
      } catch (e) {
        /* ignore */
      }

      await logError({
        name: "otp_send_failed",
        file: "services/otpService.js",
        description: err && err.message ? err.message : String(err),
        stack: err && err.stack ? err.stack : undefined,
        section: "otp",
        priority: "high",
      });

      throw new Error("Failed to send OTP: " + (err.message || String(err)));
    }

    return { otpId: encrypt(otpId) };
  } catch (err) {
    // Log unexpected errors
    await logError({
      name: "createAndSendOtp_exception",
      file: "services/otpService.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    throw err;
  }
}

/**
 * Verify OTP for encrypted otpId
 * @param {string} otpIdEncrypted
 * @param {string} otp
 */
async function verifyOtp(otpIdEncrypted, otp) {
  try {
    if (!otpIdEncrypted || !otp) throw new Error("otpId and otp required");

    const otpId = decrypt(otpIdEncrypted);
    if (!otpId) return { ok: false, reason: "invalid_otpId" };

    const record = await OtpRequest.findOne({ otpId });
    if (!record) return { ok: false, reason: "invalid_otpId" };
    if (record.verified) return { ok: false, reason: "already_verified" };
    if (record.expiresAt < new Date()) return { ok: false, reason: "expired" };
    if (record.attempts >= record.maxAttempts)
      return { ok: false, reason: "max_attempts" };

    // If Twilio verify used, delegate to provider
    if (record.provider === "twilio" && client && TWILIO_VERIFY_SERVICE_SID) {
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
        record.attempts += 1;
        await record.save();

        await logError({
          name: "otp_verify_provider_error",
          file: "services/otpService.js",
          description: err && err.message ? err.message : String(err),
          stack: err && err.stack ? err.stack : undefined,
          section: "otp",
          priority: "high",
        });

        return { ok: false, reason: "invalid_code" };
      }
    }

    // Fallback: local decrypt and compare
    const storedOtp = decrypt(record.otpEncrypted);
    if (!storedOtp) {
      record.attempts += 1;
      await record.save();
      return { ok: false, reason: "invalid_code" };
    }

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
    await logError({
      name: "verifyOtp_exception",
      file: "services/otpService.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    throw err;
  }
}

/**
 * Resend OTP for provided encrypted otpId.
 * Keeps userType consistent. If expired -> create new record (preserving userType).
 */
async function resendOtp(otpIdEncrypted) {
  try {
    if (!otpIdEncrypted) throw new Error("otpId required");

    const otpId = decrypt(otpIdEncrypted);
    if (!otpId) return { ok: false, reason: "invalid_otpId" };

    const record = await OtpRequest.findOne({ otpId });
    if (!record) return { ok: false, reason: "invalid_otpId" };
    if (record.verified) return { ok: false, reason: "already_verified" };

    const lastSent = record.lastSentAt
      ? new Date(record.lastSentAt).getTime()
      : 0;
    if (Date.now() - lastSent < DEFAULT_RESEND_INTERVAL_MS) {
      return { ok: false, reason: "too_many_requests" };
    }
    if ((record.resendCount || 0) >= DEFAULT_MAX_RESENDS) {
      return { ok: false, reason: "resend_limit_reached" };
    }

    // if expired, create new OTP (preserving userType)
    if (record.expiresAt < new Date()) {
      return await createAndSendOtp(record.phone, {
        userType: record.userType,
        meta: record.meta,
        operation: record.operation,
      });
    }

    // otherwise update OTP in-place
    const newOtp = generateOtp();
    record.otpEncrypted =
      record.provider === "local" ? encrypt(newOtp) : record.otpEncrypted;
    record.attempts = 0;
    record.expiresAt = new Date(
      Date.now() + DEFAULT_EXPIRE_MINUTES * 60 * 1000
    );
    record.lastSentAt = new Date();
    record.resendCount = (record.resendCount || 0) + 1;
    await record.save();

    try {
      if (record.provider === "twilio" && client && TWILIO_VERIFY_SERVICE_SID) {
        // Twilio Verify will generate and send a new code
        await client.verify.v2
          .services(TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({ to: record.phone, channel: "sms" });
      } else if (
        record.provider === "twilio-sms" &&
        client &&
        TWILIO_PHONE_NUMBER
      ) {
        await client.messages.create({
          to: record.phone,
          from: TWILIO_PHONE_NUMBER,
          body: `Your verification code is ${newOtp}`,
        });
      } else if (record.provider === "local") {
        await logError({
          name: "otp_resend_no_provider",
          file: "services/otpService.js",
          description: `No SMS provider configured for resend; otpId=${String(
            otpId
          ).slice(0, 60)}`,
          section: "otp",
          priority: "high",
        });
        throw new Error("No SMS provider configured to send OTP");
      } else {
        throw new Error("No SMS provider configured");
      }
    } catch (err) {
      await logError({
        name: "otp_resend_send_failed",
        file: "services/otpService.js",
        description: err && err.message ? err.message : String(err),
        stack: err && err.stack ? err.stack : undefined,
        section: "otp",
        priority: "high",
      });
      throw new Error("Failed to resend OTP: " + (err.message || String(err)));
    }

    return { ok: true };
  } catch (err) {
    await logError({
      name: "resendOtp_exception",
      file: "services/otpService.js",
      description: err && err.message ? err.message : String(err),
      stack: err && err.stack ? err.stack : undefined,
      section: "otp",
      priority: "high",
    });
    throw err;
  }
}

module.exports = {
  createAndSendOtp,
  verifyOtp,
  resendOtp,
};
