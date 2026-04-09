const mongoose = require('mongoose');

const MachineStatSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  
  metadata: { MIGID: { type: String, required: true }},

  cpuPerc: { type: Number },
  memUseMiB: { type: Number },
  memTotalMiB: { type: Number },
  gpuVramMiB: { type: Number },
  gpuTotalMiB: { type: Number }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata',
    granularity: 'minutes'
  },
  autoCreate: true
});

function getMachineStatModel(statsConnection) {
  return statsConnection.model('MachineStat', MachineStatSchema);
}

module.exports = { getMachineStatModel };