const mongoose = require("mongoose");

const AdSchema = new mongoose.Schema(
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
    banner_1_daily_charge: {
      type: String,
      required: false,
      default: "2",
    },
    banner_2_daily_charge: {
      type: String,
      required: false,
      default: "1",
    },
    country: { type: String, required: false },
    verified: { type: Boolean, default: false }, // `required: true` implied with default
  },
  { timestamps: true }
);

const Ad = mongoose.model("Ad", AdSchema);
module.exports = Ad;
