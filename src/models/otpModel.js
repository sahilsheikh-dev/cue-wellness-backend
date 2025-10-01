const mongoose = require("mongoose");
const { Schema } = mongoose;

const OtpSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    userType: {
      type: String,
      required: true,
      enum: ["client", "coach", "eventOrganizer", "productCompany"],
      index: true,
    },
    otpEncrypted: { type: String }, // optional if using provider-only
    otpId: { type: String, required: true, unique: true }, // raw otpId stored; we return encrypted to client
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true }, // TTL index below
    lastSentAt: { type: Date, default: Date.now }, // for throttling/resend
    resendCount: { type: Number, default: 0 }, // useful for rate limiting
    provider: {
      type: String,
      enum: ["twilio", "twilio-sms", "local"],
      default: "local",
    },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// TTL index to remove doc when expiresAt reached
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// useful compound index for queries
OtpSchema.index({ phone: 1, userType: 1, verified: 1, expiresAt: 1 });

module.exports = mongoose.model("OtpRequest", OtpSchema);
