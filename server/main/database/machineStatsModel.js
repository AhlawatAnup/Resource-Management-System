const mongoose = require('mongoose');

// const statsUri = process.env.STATS_DB_URI;
const statsUri = 'mongodb://localhost:27017/machine_monitoring'
const statsConnection = mongoose.createConnection(statsUri);

statsConnection.on('connected', () => {
  console.log('✅ Connected to Machine Stats DB:', statsUri.split('/').pop());
});

statsConnection.on('error', (err) => {
  console.error('❌ Stats DB Connection Error:', err);
});


// Schema optimized for Time Series, grouping by user (user = machine alias)
const MachineStatSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  user: { type: String, required: true },
  cpuPerc: Number,
  memUseMiB: Number,
  memTotalMiB: Number,
  gpuVramMiB: Number,
  gpuTotalMiB: Number,
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'user',
    granularity: 'minutes'
  },
  autoCreate: true
});

const MachineStat = statsConnection.model('MachineStat', MachineStatSchema);

module.exports = { MachineStat };