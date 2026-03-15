const mongoose = require("mongoose");
const Machine = require("../database/machineModel");

exports.isValidDuration = function (duration) {
  return Number.isInteger(duration) && duration >= 1 && duration <= 30;
};

const fetchMachineById = async (machineId) => {
  if (!mongoose.Types.ObjectId.isValid(machineId)) return null;
  return Machine.findById(machineId)
    .select("_id MIGID gpuRam")
    .lean();
};

module.exports = { fetchMachineById };