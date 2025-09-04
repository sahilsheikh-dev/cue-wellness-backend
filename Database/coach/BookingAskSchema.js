const mongoose = require("mongoose");

const BookingAskSchema = new mongoose.Schema(
  {
    booking_id: {
      type: String,
      required: true,
    },
    chat_id: {
      type: String,
      required: true,
    },
    message_number: {
      type: String,
      required: true,
    },
    coach_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    clientLevelTraining: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    slots: [
      {
        date: {
          type: Date,
          required: true,
        },
        time_from: {
          type: String,
          required: true,
        },
        time_to: {
          type: String,
          required: true,
        },
        slot_id: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        discount: {
          type: String,
          required: true,
        },
        finalPrice: {
          type: String,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: String,
      required: true,
    },
    process_at: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const BookingAsk = mongoose.model("BookingAsk", BookingAskSchema);
module.exports = BookingAsk;
