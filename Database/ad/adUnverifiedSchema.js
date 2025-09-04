const mongoose = require("mongoose");

const AdUnverifiedSchema = new mongoose.Schema(
  {
    event_organizer_id: { type: String, required: true },
    type: {
      type: String,
      required: true,
    },
    company_name: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: false,
    },
    otpId: {
      type: String,
      required: false,
    },
    token: {
      type: String,
      required: false,
    },
    country: { type: String, required: false },
    get_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const AdUnverified = mongoose.model("AdUnverified", AdUnverifiedSchema);
module.exports = AdUnverified;
