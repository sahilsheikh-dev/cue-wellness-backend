const mongoose = require("mongoose");

const ProductItemSchema = new mongoose.Schema(
  {
    product_item_id: {
      type: String,
      required: true,
    },
    product_company_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    product_name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    cue_share: {
      type: String,
      required: false,
    },
    company_share: {
      type: String,
      required: false,
    },
    product_img: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      required: true,
      default: false,
    },
    agreement_terms: {
      title: {
        type: String,
        required: false,
      },
      content: [
        {
          type: {
            type: String,
            required: false,
          },
          content: {
            type: String,
            required: false,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

const ProductItem = mongoose.model("ProductItem", ProductItemSchema);
module.exports = ProductItem;
