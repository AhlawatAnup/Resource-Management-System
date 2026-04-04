require("dotenv").config(); // Must be at the top to load MONGO_URI
const mongoose = require("mongoose");
const ResReq = require("../database/resourceRequestModel.js"); // Adjust path if needed
const connectDB = require("../database/db.js"); // Adjust path if needed

async function addIsActiveFlag() {
  try {
    await connectDB();
    console.log("🔌 Connected to MongoDB");

    // Update all documents by setting isActive:true
    const result = await ResReq.updateMany(
      {},                // Match all documents
      { $set: { isActive: true } } // Add/update the isActive field
    );

    console.log(`🎯 Updated ${result.modifiedCount} documents with isActive:true`);
  } catch (error) {
    console.error("❌ Error updating resReq documents:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

addIsActiveFlag();