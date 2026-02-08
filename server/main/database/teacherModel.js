const mongoose = require("mongoose");
const Student = require("./studentModel");

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String, required: true },
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
  verification_completed: { type: Boolean, default: false }, 
});

// Cascade delete: when teacher is deleted, delete all associated students
teacherSchema.pre("findOneAndDelete", async function(next) {
  const teacher = await this.model.findOne(this.getFilter());
  if (teacher && teacher.students && teacher.students.length > 0) {
    // Delete all students (their pre-delete hooks will handle resource requests)
    await Student.deleteMany({ _id: { $in: teacher.students } });
  }
  next();
});

teacherSchema.pre("findByIdAndDelete", async function(next) {
  const teacher = await this.model.findById(this.getFilter()._id);
  if (teacher && teacher.students && teacher.students.length > 0) {
    // Delete all students (their pre-delete hooks will handle resource requests)
    await Student.deleteMany({ _id: { $in: teacher.students } });
  }
  next();
});

module.exports = mongoose.model("Teacher", teacherSchema);
