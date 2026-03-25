const mongoose = require("mongoose");

const resourceRequestSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Student", 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  purpose: { 
    type: String, 
    required: true 
  },
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 30
  },
  version: {
    type: Number,
    required: true,
    default: 2
  },

  // Status tracking
  teacher_action: { type: Boolean, default: false },
  teacher_verified: { type: Boolean, default: false },
  admin_action: { type: Boolean, default: false },
  admin_verified: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },

  // VM access credentials (provided when admin finally verifies)
  // vmCredentials: {
  //   // username: { type: String },
  //   password: { type: String },
  //   ip: { type: String },
  //   migId: { type: String }
  // },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // Edit tracking
  isEdited: { type: Boolean, default: false },

  // Notification flags for expiry emails (7 and 2 days)
  notified: {
    type: {
      day7: { type: Boolean, default: false },
      day2: { type: Boolean, default: false }
    },
    default: () => ({ day7: false, day2: false })
  }
});

module.exports = mongoose.model("ResourceRequest", resourceRequestSchema, "resourceRequests");
