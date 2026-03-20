const mongoose = require("mongoose");

const machineHistorySchema = new mongoose.Schema({
  studentName:             { type: String },
  studentEmail:            { type: String },
  studentRollNo:           { type: String },
  studentPhone:            { type: String },
  studentBranch:           { type: String },
  studentInstituteName:    { type: String },
  studentInstituteAddress: { type: String },

  teacherName:   { type: String },
  teacherEmail:  { type: String },
  teacherPhone:  { type: String },
  teacherBranch: { type: String },

  requestTitle:       { type: String },
  requestPurpose:     { type: String },
  requestDuration:    { type: String }, 
  requestedAt:        { type: String }, 

  machineMIGID:  { type: String },
  machineGpuRam: { type: String }, 
  machineIp:     { type: String },

  allotmentDate: { type: String }, 
  startTime:     { type: String }, 
  endTime:       { type: String }, 

  archivedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  "MachineHistory",
  machineHistorySchema,
  "machineHistories"
);
