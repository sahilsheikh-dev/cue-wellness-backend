const mongoose = require("mongoose");

const Banner1Schema = new mongoose.Schema(
  {
    event_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Banner1 = mongoose.model("Banner1", Banner1Schema);
module.exports = Banner1;
