const mongoose = require("mongoose");

// Main Coache Schema
const CoacheUnverifiedSchema = new mongoose.Schema({
  coach_id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, index: true, required: false },
  pet_name: { type: String, required: false },
  mobile: { type: String, required: true }, // Changed to String
  password: { type: String, required: true },
  dob: { type: Date, required: false }, // Changed to Date
  country: { type: String, required: false },
  gender: { type: String, required: false },
  profilePicture: { type: String, required: false }, // `required: false` omitted
  token: { type: String, required: false }, // `required: false` omitted
  category: [
    {
      id: {
        type: String,
        required: true,
      },
      levelOfExpertise: [{ type: String, required: true }],
      session: {
        beginner_virtual_private_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                  booking_id: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        beginner_virtual_group_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        beginner_inperson_private_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        beginner_inperson_group_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        intermediate_virtual_private_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        intermediate_virtual_group_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        intermediate_inperson_private_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        intermediate_inperson_group_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        advanced_virtual_private_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        advanced_virtual_group_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
        advanced_inperson_private_session: {
          avg_time: {
            type: String,
            required: false,
          },
          avg_price: {
            type: String,
            required: false,
          },
          currency: {
            type: String,
            required: false,
          },
          slots: [
            {
              date: {
                type: Date,
                required: true,
              },
              time: [
                {
                  from: {
                    type: String,
                    required: true,
                  },
                  to: {
                    type: String,
                    required: true,
                  },
                  booking_status: {
                    type: String,
                    required: true,
                    default: "false",
                  },
                  booked: {
                    type: String,
                    required: false,
                  },
                },
              ],
            },
          ],
        },
      },
    },
  ],
  client_gender: [
    {
      type: String,
      required: true,
    },
  ],
  languages: [
    {
      type: String,
      required: true,
    },
  ],
  address: { type: String, required: false },
  city: { type: String, required: false },
  pinCode: { type: String, required: false },
  verified: { type: Boolean, default: false }, // `required: true` implied with default
  card_holder_name: { type: String, required: false },
  card_holder_number: { type: String, required: false },
  card_number: { type: String, required: false },
  expiry_date: { type: String, required: false },
  cvv: { type: String, required: false },
  otp: { type: String, required: false },
  otpId: { type: String, required: false },
  experience_year: { type: String, required: false },
  experience_months: { type: String, required: false },
  cue_share: { type: String, required: false },
  coach_share: { type: String, required: false },
  certificates: [
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
  agree_certification: {
    type: Boolean,
    required: true,
    default: false,
  },
  agree_experience: {
    type: Boolean,
    required: true,
    default: false,
  },
  agree_refund: {
    type: Boolean,
    required: true,
    default: false,
  },
});

// Export Model
const CoachUnverified = mongoose.model(
  "CoachUnverified",
  CoacheUnverifiedSchema
);
// export default Coache; // For ES6
// or
module.exports = CoachUnverified; // For CommonJS
