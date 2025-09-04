const mongoose = require("mongoose");
const LanguagesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Languages = mongoose.model("Languages", LanguagesSchema);
module.exports = Languages;
