const mongoose = require("mongoose");

const EventUnverifiedSchema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
    },
    advertiser_id: {
      type: String,
      resquired: true,
    },
    banner_space: {
      type: Number,
      required: true,
    },
    creative_pick: {
      type: Boolean,
      required: true,
    },
    event_banner: {
      type: String,
      required: true,
    },
    event_name: {
      type: String,
      required: true,
    },
    event_host: {
      type: String,
      required: true,
    },
    event_type: [
      {
        type: String,
        required: true,
      },
    ],
    event_date: {
      type: String,
      required: true,
    },
    event_time_from: {
      type: String,
      required: true,
    },
    event_time_to: {
      type: String,
      required: true,
    },
    event_virtual_inperson: {
      type: String,
      required: true,
    },
    event_location: {
      type: String,
      required: false,
    },
    early_bird_price: {
      type: String,
      required: false,
    },
    early_bird_discount: {
      type: Number,
      required: false,
    },
    early_bird_final_price: {
      type: String,
      required: false,
    },
    early_bird_date_from: {
      type: String,
      required: false,
    },
    early_bird_date_to: {
      type: String,
      required: false,
    },
    regular_price: {
      type: String,
      required: true,
    },
    regular_discount: {
      type: Number,
      required: false,
    },
    regular_final_price: {
      type: String,
      required: false,
    },
    regular_date_from: {
      type: String,
      required: true,
    },
    regular_date_to: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: [
      {
        type: String,
        required: false,
      },
    ],
    special_note: {
      type: String,
      required: false,
    },
    daily_charges: {
      type: String,
      required: true,
    },
    licences: [
      {
        type: String,
        required: true,
      },
    ],
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
    get_verified: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const EventUnverified = mongoose.model(
  "EventUnverified",
  EventUnverifiedSchema
);
module.exports = EventUnverified;
