// src/models/coach/coachModel.js
const mongoose = require("mongoose");

const RefreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  userAgent: { type: String },
  ip: { type: String },
});

const CertificateSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
  },
  { timestamps: true }
);

const WorkAssetSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    path: { type: String, required: true },
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // referential id from frontend/category list
    levelOfExpertise: [{ type: String }],
    session: { type: mongoose.Schema.Types.Mixed }, // store flexible payload
  },
  { timestamps: true }
);

const CoachSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    email: { type: String, index: true, sparse: true },
    nick_name: { type: String },
    mobile: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    dob: { type: Date },
    country: { type: String },
    gender: { type: String },
    city: { type: String },
    address: { type: String },
    pincode: { type: Number },

    profilePicture: { type: String },
    certificates: [CertificateSchema],
    workAssets: [WorkAssetSchema],

    token: { type: String, index: true },

    refreshTokens: [RefreshTokenSchema],

    status: {
      type: String,
      enum: ["unverified", "pending", "verified", "deleted", "blocked"],
      default: "unverified",
    },
    isBlocked: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },

    my_activities: [String],
    accepted_genders: [String],
    accepted_languages: [String],

    experience_since_date: { type: Date },
    cue_share_percentage: { type: Number },
    coach_share_percentage: { type: Number },
    story: { type: String },

    agreement_terms: { type: mongoose.Schema.Types.Mixed },

    saved_coaches: [String],
    liked_activities: [String],

    has_read_awareness_guideline: { type: Boolean, default: false },

    agree_terms_conditions: { type: Boolean, required: true },
    agree_privacy_policy: { type: Boolean, required: true },

    agree_certification: { type: Boolean, default: false },
    agree_experience: { type: Boolean, default: false },
    agree_refund: { type: Boolean, default: false },

    // --- NEW: category pricing storage ---
    category: [CategorySchema],
  },
  { timestamps: true }
);

CoachSchema.index({ mobile: 1 });
CoachSchema.index({ token: 1 });
CoachSchema.index({ status: 1 });

module.exports = mongoose.model("Coach", CoachSchema);
