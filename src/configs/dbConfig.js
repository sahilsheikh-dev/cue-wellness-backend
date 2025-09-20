const mongoose = require("mongoose");
require("dotenv").config();

function connectToDatabase() {
  const dbMode = process.env.DB_MODE || "local";

  let uri;

  if (dbMode === "remote") {
    uri = `mongodb://${process.env.REMOTE_DB_USER}:${process.env.REMOTE_DB_PASS}@${process.env.REMOTE_DB_IP}:27017/${process.env.REMOTE_DB_NAME}?authSource=admin`;
  } else {
    uri = process.env.MONGO_URI_LOCAL;
  }

  mongoose.connect(uri);

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log(`✅ Connected to MongoDB (${dbMode})`);
  });
}

module.exports = connectToDatabase;
