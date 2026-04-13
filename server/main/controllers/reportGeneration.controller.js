const mongoose = require('mongoose');
const { getStatsConnection } = require('../database/connectStatsDB');
const { getMachineStatModel } = require('../database/machineStatsModel');
const MachineAllotment = require('../database/machineAllotmentModel');

async function getMachineStats(req, res) {
  try {
    const { resourceRequestId } = req.body;

    const allotment = await MachineAllotment.findOne({ resourceRequestId: new mongoose.Types.ObjectId(resourceRequestId) })
      .populate('machineId')
      .setOptions({ includeInactive: true });

    if (!allotment) return res.status(404).json({ message: 'Allotment not found' });

    const migid = allotment.machineId.MIGID;
    const { startTime, endTime } = allotment;

    const MachineStat = getMachineStatModel(getStatsConnection());
    const stats = await MachineStat.find({
      'metadata.MIGID': migid,
      timestamp: { $gte: startTime, $lte: endTime }
    }).sort({ timestamp: 1 });

    res.json({ migid, startTime, endTime, stats });
  } catch (err) {
    console.error('getMachineStats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getMachineStats };