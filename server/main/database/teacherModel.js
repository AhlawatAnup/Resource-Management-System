const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  // department: { type: String },
  branch: { type: String }, // e.g., ["Physics", "Mathematics"]
  createdAt: { type: Date, default: Date.now },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
  is_verified: { type: Boolean, default: false },
});

module.exports = mongoose.model("Teacher", teacherSchema);
