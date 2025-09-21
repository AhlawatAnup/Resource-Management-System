const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  rollNo: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  branch: { type: String }, // e.g., ["Physics", "Mathematics"]
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  is_verified: { type: Boolean, default: false },
  verification_completed: { type: Boolean, default: false }, // Track if teacher has taken action
});

module.exports = mongoose.model("Student", studentSchema);
