const mongoose = require("mongoose");
const UpdateSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Update = mongoose.model("Update", UpdateSchema);
module.exports = Update;
