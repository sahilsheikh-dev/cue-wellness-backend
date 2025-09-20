// models/otpModel.js
const mongoose = require("mongoose");

/**
 * OTP requests. Each OTP is tied to:
 *  - phone: the phone number
 *  - userType: the account type this OTP is for (client|coach|eventOrganizer|productCompany)
 *  - otpId: internal id (we give client encrypted form)
 *  - otpEncrypted: encrypted OTP code
 */
const OtpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    userType: {
      type: String,
      required: true,
      enum: ["client", "coach", "eventOrganizer", "productCompany"],
      index: true,
    },
    otpEncrypted: { type: String, required: true },
    otpId: { type: String, required: true, unique: true }, // raw otpId stored; we return encrypted to client
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
    createdAt: {
      type: Date,
      default: Date.now,
      index: { expires: 60 * 60 * 24 }, // auto TTL after 24h (optional)
    },
    meta: { type: Object }, // optional metadata: ip, ref, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("OtpRequest", OtpSchema);
