const mongoose = require("mongoose");

function connectToDatabase() {
  mongoose.connect("mongodb://localhost:27017/cueWellness", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB server");
  });
}

// function connectToDatabase() {
//   mongoose.connect(
//     "mongodb://cueUser:CueWellness00700@127.0.0.1:27017/cueWellness?authSource=admin",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   );

//   const db = mongoose.connection;
//   db.on("error", console.error.bind(console, "MongoDB connection error:"));
//   db.once("open", () => {
//     console.log("Connected to MongoDB server");
//   });
// }

module.exports = connectToDatabase;
