const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({
  country: { type: String, required: true },
  code: { type: String, required: true },
  img: { type: String, required: true },
  number_of_digit: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  app_subscription_ios: {
    type: String,
    required: true,
  },
  reflection_subscription_ios: {
    type: String,
    required: true,
  },
  app_subscription_android: {
    type: String,
    required: true,
  },
  reflection_subscription_android: {
    type: String,
    required: true,
  },
});

const Country = mongoose.model("Country", CountrySchema);
module.exports = Country;
