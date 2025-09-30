const mongoose = require("mongoose");
const ResourceRequest = require("./resourceRequestModel");

const studentSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  rollNo: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  branch: { type: String }, // e.g., ["Physics", "Mathematics"]
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  resourceRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ResourceRequest"
  }],
  teacher_verified: { type: Boolean, default: false },
  teacher_action: { type: Boolean, default: false },
  admin_verified: { type: Boolean, default: false },
  admin_action: { type: Boolean, default: false },
  is_verified: { type: Boolean, default: false }
});

// Middleware to cascade delete ResourceRequests
studentSchema.pre("findOneAndDelete", async function(next) {
  const student = await this.model.findOne(this.getFilter());
  if (student) {
    await ResourceRequest.deleteMany({ _id: { $in: student.resourceRequests } });
  }
  next();
});

module.exports = mongoose.model("Student", studentSchema);
