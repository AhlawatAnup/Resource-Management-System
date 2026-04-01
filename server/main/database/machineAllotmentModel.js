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
  },
  startNotified: {
      type: Boolean,
      default: false
  },
  expiryNotified: {
    type: Boolean,
    default: false
  },
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
  const { includeInactive, includeDeleted } = this.getOptions();

  // 1. Exclude deleted UNLESS explicitly asked
  if (!includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  // 2. Exclude inactive UNLESS explicitly asked
  if (!includeInactive) {
    this.where({ isActive: true });
  }

  next();
});

module.exports = mongoose.model("MachineAllotment", MachineAllotmentSchema);