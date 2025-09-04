const mongoose = require("mongoose");

const GuidelineAwarenessSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineAwareness = mongoose.model(
  "GuidelineAwareness",
  GuidelineAwarenessSchema
);

const GuidelineConnectionClientSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineConnectionClient = mongoose.model(
  "GuidelineConnectionClient",
  GuidelineConnectionClientSchema
);

const GuidelineConnectionCoachSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineConnectionCoach = mongoose.model(
  "GuidelineConnectionCoach",
  GuidelineConnectionCoachSchema
);

const GuidelineReflectionSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineReflection = mongoose.model(
  "GuidelineReflection",
  GuidelineReflectionSchema
);

const GuidelineJournalSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineJournal = mongoose.model(
  "GuidelineJournal",
  GuidelineJournalSchema
);

const GuidelineEventSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineEvent = mongoose.model("GuidelineEvent", GuidelineEventSchema);

const GuidelineShopSchema = new mongoose.Schema({
  id: {
    required: true,
    type: String,
  },
  guidelines: [
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

const GuidelineShop = mongoose.model("GuidelineShop", GuidelineShopSchema);

module.exports = {
  GuidelineAwareness,
  GuidelineConnectionClient,
  GuidelineConnectionCoach,
  GuidelineReflection,
  GuidelineJournal,
  GuidelineEvent,
  GuidelineShop,
};
