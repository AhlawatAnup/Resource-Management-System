const mongoose = require('mongoose');
const Machine = require('../../database/machineModel');
const MachineAllotment = require('../../database/machineAllotmentModel.js');
const resourceRequestModel = require('../../database/resourceRequestModel.js');

exports.getMachineByMigid = async (migid) => {
  const machine = await Machine.findOne({ MIGID: migid }, { user: 1, ip: 1, port: 1, _id: 0 })
    .setOptions({ includeUnavailable: true })
    .lean();
  if (!machine) {
    throw new Error('Machine not found for MIGID: ' + migid);
  }
  return machine;
};

exports.getActiveAllotment = async (resourceObjectId) => {
  const now = new Date();

  const allotment = await MachineAllotment.findOne({
    resourceRequestId: resourceObjectId,
    isActive: true,
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).lean();

  return allotment; // return null if not found (controller decides)
};

exports.isResourceRequestVerified = async (requestId) => {
  if (!mongoose.Types.ObjectId.isValid(requestId)) return false;
  const req = await resourceRequestModel.findById(requestId).select('is_verified').lean();
  return !!(req && req.is_verified);
};
