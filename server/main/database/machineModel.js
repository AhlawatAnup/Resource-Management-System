const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const machineSchema = new mongoose.Schema({
  MIGID: {
    type: String,
    required: true,
    unique: true
  },

  gpuRam: {
    type: Number,
    required: true // in GB
  },

  ip: {
    type: String,
    required: true
  },

  port: {
    type: Number,
    default: 22
  },

  username: {
    type: String,
    required: true
  },

  sshPassword: {
    type: String,
    required: true
  }

}, { timestamps: true });


module.exports = mongoose.model('Machine', machineSchema);
