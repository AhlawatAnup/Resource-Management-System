const mongoose = require("mongoose");
const MachineAllotmentSchema = new mongoose.Schema(
{
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true
  },
  resourceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ResourceRequest",
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
    isDeleted: {
    type: Boolean,
    default: false
  }
},
{ timestamps: true }
);

MachineAllotmentSchema.index(
  { machineId: 1, startTime: 1, endTime: 1 },
  {
    partialFilterExpression: { isDeleted: false }
  }
);

MachineAllotmentSchema.pre(/^find|^findOneAndUpdate/, function (next) {
  // 1. ALWAYS exclude deleted
  this.where({ isDeleted: { $ne: true } });

  // 2. ONLY show active if not explicitly opted out
  const { includeInactive } = this.getOptions();
  if (!includeInactive) {
    this.where({ isActive: true });
  }

  next();
});

module.exports = mongoose.model("MachineAllotment", MachineAllotmentSchema);