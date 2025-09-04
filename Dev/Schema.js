const mongoose = requrie("mongoose");

const AdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Ad = mongoose.model("Ad", AdSchema);
module.exports = Ad;
