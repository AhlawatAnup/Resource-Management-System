const mongoose = require("mongoose");
const Machine = require("../database/machineModel");

exports.isValidDuration = function (duration) {
  return Number.isInteger(duration) && duration >= 1 && duration <= 30;
};

exports.fetchMachineById = async (machineId) => {
  if (!mongoose.Types.ObjectId.isValid(machineId)) return null;
  return Machine.findById(machineId)
    .select("_id MIGID gpuRam")
    .lean();
};

// IST offset in ms
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

// Convert UTC date → IST date parts (year, month, day)
const getISTDateParts = (date) => {
  const istTime = new Date(date.getTime() + IST_OFFSET);

  return {
    year: istTime.getUTCFullYear(),
    month: istTime.getUTCMonth(),
    day: istTime.getUTCDate()
  };
};

// Create UTC Date from IST time
const createUTCFromIST = (year, month, day, hour, minute) => {
  // IST → UTC (subtract 5:30)
  return new Date(Date.UTC(year, month, day, hour - 5, minute - 30));
};

// Get next IST day (based on a UTC date)
const getNextISTDay = (date) => {
  const { year, month, day } = getISTDateParts(date);

  return {
    year,
    month,
    day: day + 1
  };
};

// Main function: calculate start & end time
exports.calculateAllotmentWindow = (lastEndTime, durationDays) => {
  const baseDate = lastEndTime ? new Date(lastEndTime) : new Date();

  // Step 1: next IST day
  const { year, month, day } = getNextISTDay(baseDate);

  // Step 2: start → 00:30 IST
  const startTime = createUTCFromIST(year, month, day, 0, 30);

  // Step 3: end → duration days later at 23:30 IST
  const endDay = day + (durationDays - 1);

  const endTime = createUTCFromIST(year, month, endDay, 23, 30);

  return { startTime, endTime };
};