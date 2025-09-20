// server.js
const app = require("./app");
const connectToDatabase = require("./configs/dbConfig");

const PORT = process.env.PORT || 9000;

async function startServer() {
  try {
    // Connect to MongoDB
    connectToDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
}

module.exports = { startServer };
