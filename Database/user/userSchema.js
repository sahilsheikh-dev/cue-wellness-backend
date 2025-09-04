// import mongoose from "mongoose";
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pet_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    emailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    mobile: {
      type: String,
      required: true,
      unique: true, // Ensure mobile number uniqueness
    },
    mobileVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    otp: {
      type: String,
      required: false,
    },
    otpId: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    profilePicture: {
      type: String,
      default: "default.png", // Default image path
    },
    token: {
      type: String,
      requried: false,
    },
    referal_code: {
      type: String,
      requried: false,
    },
    stripe_customer_id: {
      type: String,
      requried: false,
    },
    app_subscription: {
      // mode could be - on, off, 3 day free trial, special access
      mode: {
        type: String,
        required: false,
      },
      start: {
        type: Date,
        required: false,
      },
      end: {
        type: Date,
        requried: false,
      },
      checked_on: {
        type: Date,
        requried: false,
      },
    },
    reflection_subscription: {
      // mode could be - on, off, 3 day free trial, special access
      mode: {
        type: String,
        required: false,
      },
      start: {
        type: Date,
        required: false,
      },
      end: {
        type: Date,
        requried: false,
      },
      checked_on: {
        type: Date,
        requried: false,
      },
    },
    awareness: [
      {
        id: {
          type: String,
          required: true,
        },
        main_id: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          required: true,
          default: Date.now,
        },
        marks: [
          {
            id: {
              type: String,
              required: true,
            },
            value: {
              type: Number,
              required: true,
            },
          },
        ],
      },
    ],
    journal: [
      {
        id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          Required: false,
        },
        content: [
          {
            type: {
              type: String,
              required: true,
            },
            content: {
              type: String,
              required: true,
            },
            id: {
              type: String,
              required: true,
            },
          },
        ],
        cue: [
          {
            title: {
              type: String,
              required: true,
            },
            content: [
              {
                id: {
                  type: String,
                  required: true,
                },
                content: {
                  type: String,
                  required: true,
                },
              },
            ],
          },
        ],
        date_of_last_edit: {
          type: Date,
          required: true,
        },
        date_of_creation: {
          type: Date,
          required: true,
        },
      },
    ],
    saved_coaches: [
      {
        type: String,
        required: true,
      },
    ],
    liked_activities: [
      {
        type: String,
        required: true,
      },
    ],
    has_read_awareness_guideline: {
      type: Boolean,
      required: true,
      default: false,
    },
    has_read_connection_guideline: {
      type: Boolean,
      required: true,
      default: false,
    },
    has_read_reflection_guideline: {
      type: Boolean,
      required: true,
      default: false,
    },
    has_read_journal_guideline: {
      type: Boolean,
      required: true,
      default: false,
    },
    has_read_events_guideline: {
      type: Boolean,
      required: true,
      default: false,
    },
    has_read_shop_guideline: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

// Export Model
// export default User; // For ES6
// or
module.exports = User; // For CommonJS
