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

  ram: {
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

  user: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  token: {
    type: String,
    required: true
  },

  version: {
    type: Number,
    required: true,
    default: 2
  },
  
  isAvailable: {
  type: Boolean,
  default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

machineSchema.pre(/^find/, function (next) {
  // If the 'ignoreDeleteFilter' option is true, skip the filter (for Admin use)
  if (this.getOptions().ignoreDeleteFilter) {
    return next();
  }

  // Otherwise, automatically filter out deleted documents
  this.where({ isDeleted: { $ne: true } });
  next();
});


module.exports = mongoose.model('Machine', machineSchema);
