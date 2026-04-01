const mongoose = require("mongoose");

let statsConnection;

async function connectStatsDB() {
  try {
    statsConnection = await mongoose.createConnection(process.env.STATS_DB_URI);
    console.log("✅ Connected to Machine Stats DB:", process.env.STATS_DB_URI.split('/').pop());
    return statsConnection;
  } catch (err) {
    console.error("❌ Stats DB connection error:", err);
    process.exit(1);
  }
}

module.exports = { connectStatsDB, statsConnection };