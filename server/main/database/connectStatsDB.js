const mongoose = require("mongoose");

let statsConnection;

async function ensureTimeSeriesCollection(conn) {
  const collections = await conn.db
    .listCollections({ name: "machinestats" })
    .toArray();

  if (collections.length > 0) {
    const isTimeSeries = collections[0].options?.timeseries;

    if (!isTimeSeries) {
      const backupName = `machinestats_old_${Date.now()}`;
      console.log(`⚠️ Renaming non-timeseries collection to ${backupName}`);
      await conn.db.collection("machinestats").rename(backupName);
    }
  }

  const existsAfterDrop = await conn.db
    .listCollections({ name: "machinestats" })
    .toArray();

  if (existsAfterDrop.length === 0) {
    await conn.db.createCollection("machinestats", {
      timeseries: {
        timeField: "timestamp",
        metaField: "metadata",
        granularity: "minutes",
      },
    });

    console.log("✅ Time-series collection created");
  }
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
    console.error("❌ Stats DB connection error:", err);
    process.exit(1);
  }
}

module.exports = { connectStatsDB, statsConnection };