require("dotenv").config(); // Must be at the top to load MONGO_URI
const mongoose = require("mongoose");
const Machine = require("../database/machineModel"); // adjust path if needed
const connectDB = require("../database/db.js"); // adjust path if needed

async function addMachine() {
  try {
    await connectDB();

    const machine = new Machine({
      MIGID: "MIG-2c4ed16b-e9e0-5f86-a16e-cbc0a49fdfeb",
      gpuRam: 10,
      ram: 32,
      ip: "172.16.10.24",
      port: 8908,
      user: "user8",
      name: "A100",
    });

    const saved = await machine.save();

    console.log("🎉 Machine added:");
    console.log(saved);
  } catch (error) {
    console.error("❌ Error adding machine:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

addMachine();