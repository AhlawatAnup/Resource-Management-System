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
    ,
    assignedStudent: {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: false }
    }
    ,
    isAssigned: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Machine', machineSchema);
