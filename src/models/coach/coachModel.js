const mongoose = require("mongoose");

const CoachSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, index: true, sparse: true },
    nick_name: { type: String },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date },
    country: { type: String },
    gender: { type: String },

    profilePicture: { type: String }, // relative path or URL
    certificates: [String],
    workImages: [
      {
        type: { type: String }, // image / video
        path: String,
      },
    ],

    token: { type: String },
    status: {
      type: String,
      enum: ["unverified", "semiverified", "verified"],
      default: "unverified",
    },
    verified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },

    category: [
      {
        id: { type: String, required: true },
        coach_experties_level: [{ type: String, required: true }],
        session: [
          {
            client_experties_level: String,
            session_type: String,
            avg_time: String,
            avg_price: String,
            currency: String,
            slots: [
              {
                date: { type: Date, required: true },
                time: [
                  {
                    from: String,
                    to: String,
                    booking_status: { type: String, default: "false" },
                    booked: String,
                    booking_id: String,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],

    // professional info
    experience_since_date: { type: Date },
    cue_share_percentage: { type: Number },
    coach_share_percentage: { type: Number },
    story: {type:String},

    // awareness, journal, etc
    awareness: [
      {
        id: String,
        position: String,
        marks: [{ id: String, value: Number }],
      },
    ],
    journal: [
      {
        id: String,
        type: String,
        title: String,
        content: [{ type: String, content: String, id: String }],
        cue: [{ title: String, content: [{ content: String }] }],
        date_of_last_edit: Date,
        date_of_creation: Date,
      },
    ],

    agreement_terms: {
      type: String
    },

    reflection_subscription: {
      mode: String,
      start: Date,
      end: Date,
      checked_on: Date,
    },

    saved_coaches: [String],
    liked_activities: [String],

    has_read_awareness_guideline: { type: Boolean, default: false },
    has_read_connection_guideline: { type: Boolean, default: false },
    has_read_reflection_guideline: { type: Boolean, default: false },
    has_read_journal_guideline: { type: Boolean, default: false },
    has_read_client_guideline: { type: Boolean, default: false },
    has_read_coach_guideline: { type: Boolean, default: false },
    has_read_event_organizer_guideline: { type: Boolean, default: false },
    has_read_product_company_guideline: { type: Boolean, default: false },

    agree_certification: { type: Boolean, default: false },
    agree_experience: { type: Boolean, default: false },
    agree_refund: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coach", CoachSchema);
