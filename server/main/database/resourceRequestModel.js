const mongoose = require('mongoose');

const resourceRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    // max: 15
  },
  version: {
    type: Number,
    required: true,
    default: 2,
  },

  // Status tracking
  teacher_action: { type: Boolean, default: true },
  teacher_verified: { type: Boolean, default: true },
  admin_action: { type: Boolean, default: false },
  admin_verified: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },

  isActive: {
    type: Boolean,
    default: true,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Edit tracking
  isEdited: { type: Boolean, default: false },

  //remarks for revoking
  revoke_remarks: { type: String, default: '' },
});

module.exports = mongoose.model('ResourceRequest', resourceRequestSchema, 'resourceRequests');
