require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../database/db.js"); // adjust path if needed

async function cleanupCollections() {
  try {
    await connectDB();
    console.log("📂 Connected to database for cleanup...");

    // Get a reference to the native MongoDB connection
    const connection = mongoose.connection.db;

    // List of collections to delete
    const collectionsToDrop = [ "histories", "resourceRequests", "machineallotments", "machines", "sessions"];

    for (const collectionName of collectionsToDrop) {
      // Check if the collection exists before trying to drop it
      const collections = await connection.listCollections({ name: collectionName }).toArray();
      
      if (collections.length > 0) {
        await connection.dropCollection(collectionName);
        console.log(`✅ Collection dropped: ${collectionName}`);
      } else {
        console.log(`ℹ️ Collection not found (skipped): ${collectionName}`);
      }
    }

    console.log("✨ Cleanup process finished successfully.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

cleanupCollections();