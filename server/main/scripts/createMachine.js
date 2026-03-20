require("dotenv").config(); // Must be at the top to load MONGO_URI
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../database/db.js"); // Adjust path to where your connectDB function lives
const Machine = require("../database/machineModel.js"); // Adjust path to your Schema file

async function run() {
  try {
    // 1. Establish Connection
    await connectDB();

    // 2. Define the machine data
    const machineData = {
      MIGID: "MIG-99234-AB",
      gpuRam: 24,
      ip: "192.168.1.50",
      port: 2222,
      username: "admin",
      sshPassword: "super-secure-password-123" // Will be hashed below
    };

    // 3. Hash the password (Security Best Practice)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(machineData.sshPassword, saltRounds);

    // 4. Create and Save the Machine
    const newMachine = new Machine({
      ...machineData,
      sshPassword: hashedPassword,
      version: 2 // Explicitly setting as per your schema
    });

    const result = await newMachine.save();
    
    console.log("------------------------------------------");
    console.log("✅ SUCCESS: Machine added to database.");
    console.log(`ID: ${result._id}`);
    console.log(`MIGID: ${result.MIGID}`);
    console.log("------------------------------------------");

  } catch (error) {
    if (error.code === 11000) {
      console.error("❌ ERROR: A machine with this MIGID already exists.");
    } else {
      console.error("❌ ERROR during script execution:", error.message);
    }
  } finally {
    // 5. Always close the connection or the script will never exit
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed.");
    process.exit(0);
  }
}

run();