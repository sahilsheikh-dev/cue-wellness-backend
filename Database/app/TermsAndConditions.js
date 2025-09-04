const mongoose = require("mongoose");

const TermsAndConditionsSchemaClient = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  termsAndConditions: [
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

const TermsAndConditionsClient = mongoose.model(
  "TermsAndConditionsClient",
  TermsAndConditionsSchemaClient
);

const TermsAndConditionsSchemaCoach = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  termsAndConditions: [
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

const TermsAndConditionsCoach = mongoose.model(
  "TermsAndConditionsCoach",
  TermsAndConditionsSchemaCoach
);

const TermsAndConditionsSchemaAd = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  termsAndConditions: [
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

const TermsAndConditionsAd = mongoose.model(
  "TermsAndConditionsAd",
  TermsAndConditionsSchemaAd
);

const TermsAndConditionsSchemaShop = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  termsAndConditions: [
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

const TermsAndConditionsShop = mongoose.model(
  "TermsAndConditionsShop",
  TermsAndConditionsSchemaShop
);

module.exports = {
  TermsAndConditionsClient,
  TermsAndConditionsCoach,
  TermsAndConditionsAd,
  TermsAndConditionsShop,
};
