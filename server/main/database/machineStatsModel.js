const mongoose = require('mongoose');

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

function getMachineStatModel(statsConnection) {
  return statsConnection.model('MachineStat', MachineStatSchema);
}

module.exports = { getMachineStatModel };