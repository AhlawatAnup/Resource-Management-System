const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    student: {
      name: { type: String },
      email: { type: String },
      rollNo: { type: String },
      phone: { type: String },
      branch: { type: String },
      instituteName: { type: String },
      instituteAddress: { type: String },
      teacherId: { type: String }, // just the ID or name if you want
      teacher_verified: { type: Boolean },
      admin_verified: { type: Boolean },
      is_verified: { type: Boolean },
    },

    teacher: {
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      branch: { type: String },
      is_verified: { type: Boolean },
      verification_completed: { type: Boolean },
    },

    resourceRequest: {
      studentId: { type: String }, // for reference
      title: { type: String },
      purpose: { type: String },
      machineId: { type: String },
      duration: { type: Number },
      version: { type: Number },
      teacher_action: { type: Boolean },
      teacher_verified: { type: Boolean },
      admin_action: { type: Boolean },
      admin_verified: { type: Boolean },
      is_verified: { type: Boolean },
      createdAt: { type: Date },
      updatedAt: { type: Date },
      isEdited: { type: Boolean },
    },

    machine: {
      MIGID: { type: String },
      name: { type: String },
      ip: { type: String },
      port: { type: Number },
      user: { type: String },
      gpuRam: { type: Number },
      ram: { type: Number },
      version: { type: Number },
      isAvailable: { type: Boolean },
      isDeleted: { type: Boolean },
    },

    machineAllotment: {
      machineId: { type: String }, // for reference
      resourceRequestId: { type: String }, // for reference
      startTime: { type: Date },
      endTime: { type: Date },
      isActive: { type: Boolean },
      isDeleted: { type: Boolean },
    },

    deletedBy: { type: String }, // 'admin', 'teacher', 'student', etc.
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model('History', historySchema);
