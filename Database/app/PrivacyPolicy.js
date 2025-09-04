const mongoose = require("mongoose");

const PrivacyPolicySchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  privacyPolicy: [
    {
      id: {
        required: true,
        type: String,
      },
      type: {
        type: String,
        required: true,
      },
      content: {
        required: true,
        type: String,
      },
    },
  ],
});

const PrivacyPolicy = mongoose.model("PrivacyPolicy", PrivacyPolicySchema);
module.exports = PrivacyPolicy;
