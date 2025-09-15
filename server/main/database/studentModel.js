const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  rollNo: { type: String, required: true, unique: true },
  course: { type: String },
  createdAt: { type: Date, default: Date.now },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  is_verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Student", studentSchema);
