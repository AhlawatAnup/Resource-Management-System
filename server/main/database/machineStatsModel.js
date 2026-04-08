const mongoose = require('mongoose');

const MachineStatSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  
  // The Metadata Object
  metadata: {
    MIGID: { type: String, required: true },  
    user: { type: String, required: true },
    parentMachine: { type: String, required: true },
  },

  // Measurements (data that changes)
  cpuPerc: Number,
  memUseMiB: Number,
  memTotalMiB: Number,
  gpuVramMiB: Number,
  gpuTotalMiB: Number,
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'metadata', 
    granularity: 'minutes'
  },
  autoCreate: true
});

// Index the specific field you query most
MachineStatSchema.index({ 'metadata.MIGID': 1, timestamp: -1 });

function getMachineStatModel(statsConnection) {
  return statsConnection.model('MachineStat', MachineStatSchema);
}

module.exports = { getMachineStatModel };