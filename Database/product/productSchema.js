const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    product_company_id: {
      type: String,
      required: true,
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
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
