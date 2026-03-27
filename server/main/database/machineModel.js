const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const machineSchema = new mongoose.Schema({
  MIGID: {
    type: String,
    required: true,
    unique: false
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

machineSchema.index(
  { MIGID: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { isDeleted: false } 
  }
);

machineSchema.pre(/^find/, function (next) {
  // 1. ALWAYS filter out deleted documents (No way to bypass)
  this.where({ isDeleted: { $ne: true } });

  // 2. Only return available machines by default; set `includeUnavailable: true` in options to bypass this filter
  const { includeUnavailable } = this.getOptions();
  if (!includeUnavailable) {
    this.where({ isAvailable: true });
  }

  next();
});

module.exports = mongoose.model('Machine', machineSchema);
