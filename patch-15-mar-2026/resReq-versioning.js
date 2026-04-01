const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;

  const result = await db.collection("resourceRequests").updateMany(
    { version: { $exists: false } },
    { $set: { version: 1 } }
  );

  console.log("Matched:", result.matchedCount);
  console.log("Updated:", result.modifiedCount);

  await mongoose.disconnect();
}

migrate();