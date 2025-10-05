// Machine model for cluster resource sharing
// Fields: MIGID, number of CPU cores, CPU RAM, GPU RAM

const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema({
    MIGID: {
        type: String,
        required: true,
        unique: true
    },
    cpuCores: {
        type: Number,
        required: true
    },
    cpuRam: {
        type: Number,
        required: true // in GB
    },
    gpuRam: {
        type: Number,
        required: true // in GB
    }
});

module.exports = mongoose.model('Machine', machineSchema);
