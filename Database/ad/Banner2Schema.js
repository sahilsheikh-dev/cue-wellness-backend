const mongoose = require("mongoose");

const Banner2Schema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Banner2 = mongoose.model("Banner2", Banner2Schema);
module.exports = Banner2;
