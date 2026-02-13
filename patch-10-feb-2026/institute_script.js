require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const Student = require("../server/main/database/studentModel");
const ResourceRequest = require("../server/main/database/resourceRequestModel");

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // 1️⃣ Update Student documents
    const studentResult = await Student.updateMany(
      {
        $or: [
          { instituteName: { $exists: false } },
          { instituteAddress: { $exists: false } }
        ]
      },
      {
        $set: {
          instituteName: "U.I.E.T",
          instituteAddress: "Chandigarh"
        }
      }
    );

    console.log(`Updated ${studentResult.modifiedCount} students`);

    // 2️⃣ Update ResourceRequest documents
    const resourceResult = await ResourceRequest.updateMany(
      { isEdited: { $exists: false } },
      { $set: { isEdited: false } }
    );

    console.log(`Updated ${resourceResult.modifiedCount} resource requests`);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exitCode = 1; // important for scripts / CI
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

runMigration();
