const mongoose = require('mongoose');
const { getStatsConnection } = require('../database/connectStatsDB');
const { getMachineStatModel } = require('../database/machineStatsModel');
const MachineAllotment = require('../database/machineAllotmentModel');

async function getStatsByResReqId(req, res) {
  try {
    const { resourceRequestId } = req.params;

    const allotment = await MachineAllotment.findOne({ resourceRequestId: new mongoose.Types.ObjectId(resourceRequestId) })
      .populate({
        path: 'machineId',
        options: { includeUnavailable: true }
      })
      .setOptions({ includeInactive: true, includeDeleted: true });

    if (!allotment) return res.status(404).json({ message: 'Allotment not found' });

    const migid = allotment.machineId.MIGID;
    const { startTime, endTime } = allotment;

    const MachineStat = getMachineStatModel(getStatsConnection());
    const rawStats = await MachineStat.find({
      'metadata.MIGID': migid,
      timestamp: { $gte: startTime, $lte: endTime }
    })
      .sort({ timestamp: 1 })
      .lean();

    // Convert to % and clean structure
    let formatted = rawStats.map(s => ({
      timestamp: s.timestamp,
      cpu: +(s.cpuPerc * 100).toFixed(2),
      mem: +((s.memUseMiB / s.memTotalMiB) * 100).toFixed(2),
      gpu: +((s.gpuVramMiB / s.gpuTotalMiB) * 100).toFixed(2)
    }));

    res.json({
      migid,
      startTime,
      endTime,
      data: formatted
    });

  } catch (err) {
    console.error('getMachineStats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getStatsByResReqId };