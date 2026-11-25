const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  rollNo: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  branch: { type: String }, // e.g., ["Physics", "Mathematics"]
  instituteName: { type: String, required: true },
  instituteAddress: { type: String, required: true },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  resourceRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResourceRequest',
    },
  ],
  resourceUtilizationScore: { type: Number, default: 5 },
  totalAllotmentsDuration: { type: Number, default: 0 },
  teacher_verified: { type: Boolean, default: false },
  teacher_action: { type: Boolean, default: false },
  admin_verified: { type: Boolean, default: false },
  admin_action: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false },
});

module.exports = mongoose.model('Student', studentSchema);
