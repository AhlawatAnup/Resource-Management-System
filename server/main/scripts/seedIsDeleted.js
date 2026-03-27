// adds isDeleted:false for all machines and all allotmetns
require("dotenv").config();
const mongoose = require("mongoose");

const Machine = require("../database/machineModel"); // adjust path
const MachineAllotment = require("../database/machineAllotmentModel.js"); // adjust path
const connectDB = require("../database/db.js"); // adjust path

async function fixIsDeletedFlags() {
  try {
    await connectDB();

    console.log("🚀 Starting migration...");

    // 1. Fix Machines
    const machineResult = await Machine.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );

    console.log("🖥️ Machines updated:");
    console.log(`Matched: ${machineResult.matchedCount}`);
    console.log(`Modified: ${machineResult.modifiedCount}`);

    // 2. Fix MachineAllotments
    const allotmentResult = await MachineAllotment.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );

    console.log("📦 Allotments updated:");
    console.log(`Matched: ${allotmentResult.matchedCount}`);
    console.log(`Modified: ${allotmentResult.modifiedCount}`);

    console.log("✅ Migration complete");

  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

fixIsDeletedFlags();