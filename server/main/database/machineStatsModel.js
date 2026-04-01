const mongoose = require('mongoose');

const MachineStatSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  MIGID: { type: String, required: true },  
  user: { type: String, required: true },
  parentMachine: { type: String, required: true },
  cpuPerc: Number,
  memUseMiB: Number,
  memTotalMiB: Number,
  gpuVramMiB: Number,
  gpuTotalMiB: Number,
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'MIGID',
    granularity: 'minutes'
  },
  autoCreate: true
});

function getMachineStatModel(statsConnection) {
  return statsConnection.model('MachineStat', MachineStatSchema);
}

module.exports = { getMachineStatModel };