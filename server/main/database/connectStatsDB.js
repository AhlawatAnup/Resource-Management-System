const mongoose = require("mongoose");

let statsConnection;

async function ensureTimeSeriesCollection(conn) {
  const collections = await conn.db
    .listCollections({ name: "machinestats" })
    .toArray();

  // ✅ Case 1: Collection exists
  if (collections.length > 0) {
    const isTimeSeries = collections[0].options?.timeseries;

    if (!isTimeSeries) {
      // ❌ STOP — do NOT modify existing collection
      throw new Error(
        "❌ 'machinestats' collection already exists and is NOT a time-series collection."
      );
    }

    console.log("✅ Time-series collection already exists");
    return;
  }

  // ✅ Case 2: Collection does NOT exist → create it
  await conn.db.createCollection("machinestats", {
    timeseries: {
      timeField: "timestamp",
      metaField: "metadata",
      granularity: "minutes",
    },
  });

  console.log("✅ Time-series collection created");
}

async function connectStatsDB() {
  try {
    statsConnection = await mongoose
      .createConnection(process.env.STATS_DB_URI)
      .asPromise();

    console.log(
      "✅ Connected to Machine Stats DB:",
      process.env.STATS_DB_URI.split("/").pop()
    );

    await ensureTimeSeriesCollection(statsConnection);

    return statsConnection;
  } catch (err) {
    console.error("❌ Stats DB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectStatsDB;