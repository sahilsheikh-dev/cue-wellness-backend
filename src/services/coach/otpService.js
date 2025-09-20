// service wrapper for Twilio verification and simple OTP generation
const twilio = require("twilio");
const OTPgen = require("../../utils/otp.util");

const accountSid = process.env.TWILIO_SID || "ACc86102fc09260ed1cc341237ddfa2aeb";
const authToken = process.env.TWILIO_AUTH_TOKEN || "59a90ca1dcaf5d17b51e54efd728bb46";
const verifySid = process.env.TWILIO_VERIFY_SID || "VA4a0b9a2e84100362aaf4781ec8faf191";

const client = twilio(accountSid, authToken);

async function sendVerificationSms(phone) {
  return client.verify.v2.services(verifySid).verifications.create({ to: phone, channel: "sms" });
}

async function checkVerification(phone, code) {
  const verificationCheck = await client.verify.v2.services(verifySid).verificationChecks.create({ to: phone, code });
  return verificationCheck.status === "approved";
}

// fallback local OTP generator (keeps same behavior as old code)
function generateLocalOTP(phone) {
  return OTPgen(phone);
}

module.exports = { sendVerificationSms, checkVerification, generateLocalOTP };
