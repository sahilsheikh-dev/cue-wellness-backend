const mongoose = require("mongoose");
const Connection = require("../../Database/connection/Connections"); // Adjust path as needed
const { encrypt } = require("../../essentials/cryptography"); // Adjust path as needed
const connectToDatabase = require("../../Database/connection/Connections"); // Adjust path as needed

async function addRealWorldTopicsAndSubtopics() {
  connectToDatabase();

  mongoose.connection.once("open", async () => {
    try {
      // Real-world topics (layer 1)
      const topicsData = [
        {
          title: "Health & Fitness",
          subtopics: ["Cardiovascular Training", "Strength Conditioning", "Flexibility Exercises"],
        },
        {
          title: "Nutrition & Diet",
          subtopics: ["Macros and Micros", "Hydration", "Supplements"],
        },
        {
          title: "Mental Wellness",
          subtopics: ["Stress Reduction", "Mindfulness", "Sleep Hygiene"],
        },
      ];

      for (const topic of topicsData) {
        const newTopic = new Connection({
          title: encrypt(topic.title),
          layer: 1,
          contains_subtopic: true,
        });

        await newTopic.save();

        for (const subtopic of topic.subtopics) {
          const newSubTopic = new Connection({
            title: encrypt(subtopic),
            layer: 2,
            outer_id: newTopic._id.toString(),
            contains_subtopic: false,
          });

          await newSubTopic.save();
        }
      }
      console.log("Successfully added real-world topics and subtopics.");
    } catch (error) {
      console.error("Error adding topics/subtopics:", error);
    } finally {
      mongoose.disconnect();
    }
  });
}

if (require.main === module) {
  addRealWorldTopicsAndSubtopics();
}

module.exports = Connection;
