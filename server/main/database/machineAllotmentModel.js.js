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
  status: {
    type: String,
    enum: ["active", "expired"]
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("MachineAllotment", MachineAllotmentSchema);