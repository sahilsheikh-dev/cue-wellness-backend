// const mongoose = require("mongoose");
// const
// const TopicSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   subtopics: { type: [SubTopicSchema], required: true },
// });

// const Topic = mongoose.model("Topic", TopicSchema);

// module.exports = TopicSchema;

const mongoose = require("mongoose");
const QuestionnaireSchemaOld = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  subTopics: [
    {
      id: {
        type: String,
        required: true,
      },
      topic: {
        type: String,
        required: true,
      },
      meaning: [
        {
          id: { type: String, required: true },
          content: { type: String, required: true },
        },
      ],
      guide: [
        {
          id: { type: String, required: true },
          title: { type: String, required: true },
          content: { type: String, requried: true },
        },
      ],
      questions: [
        {
          id: { type: String, required: true },
          content: {
            type: String,
            required: true,
          },
        },
      ],
    },
  ],
});

const QuestionnaireOld = mongoose.model(
  "QuestionnaireOld",
  QuestionnaireSchemaOld
);
module.exports = QuestionnaireOld;
