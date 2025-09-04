const mongoose = require("mongoose");

const ProductUnverifiedSchema = new mongoose.Schema(
  {
    product_company_id: {
      type: String,
      required: true,
    },
    name: {
      // brand name
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

const ProductUnverified = mongoose.model(
  "ProductUnverified",
  ProductUnverifiedSchema
);
module.exports = ProductUnverified;
