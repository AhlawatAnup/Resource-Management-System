require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const Student = require("../server/main/database/studentModel");
const ResourceRequest = require("../server/main/database/resourceRequestModel");

async function runMigration() {
  await mongoose.connect(process.env.MONGO_URI);

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

  await mongoose.disconnect();
}

runMigration().catch(console.error);
