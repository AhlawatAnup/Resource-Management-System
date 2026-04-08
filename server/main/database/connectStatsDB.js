const mongoose = require("mongoose");

let statsConnection;

async function ensureTimeSeriesCollection(conn) {
  const collectionName = "machinestats";
  
  // Check if it already exists
  const collections = await conn.db.listCollections({ name: collectionName }).toArray();

  if (collections.length === 0) {
    try {
      await conn.db.createCollection(collectionName, {
        timeseries: {
          timeField: "timestamp",
          metaField: "metadata", 
          granularity: "minutes",
        },
      });
      console.log(`🚀 Fresh Time-Series collection "${collectionName}" created.`);
    } catch (err) {
      if (err.codeName !== 'NamespaceExists') throw err;
    }
  } else {
    console.log(`✅ Time-Series collection "${collectionName}" verified.`);
  }
}

async function connectStatsDB() {
  try {
    statsConnection = await mongoose
      .createConnection(process.env.STATS_DB_URI)
      .asPromise();

    console.log("✅ Connected to Stats DB");

    await ensureTimeSeriesCollection(statsConnection);

    return statsConnection;
  } catch (err) {
    console.error("❌ Stats DB connection error:", err);
    process.exit(1);
  }
}

module.exports = { connectStatsDB, statsConnection };