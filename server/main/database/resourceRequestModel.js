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
  expiryDate: { 
    type: Date, 
    required: true 
  },
  cpuCores: { 
    type: Number, 
    required: true 
  },
  cpuRam: { 
    type: Number, // in GB
    required: true 
  },
  gpuCount: { 
    type: Number, 
    required: true 
  },
  gpuRam: { 
    type: Number, // per GPU in GB
    required: true 
  },

  // Status tracking
  teacher_action: { type: Boolean, default: false },
  teacher_verified: { type: Boolean, default: false },
  admin_action: { type: Boolean, default: false },
  admin_verified: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ResourceRequest", resourceRequestSchema);
