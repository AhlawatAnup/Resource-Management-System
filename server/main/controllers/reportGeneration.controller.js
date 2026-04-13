const { getStatsConnection } = require('../database/connectStatsDB');
const { getMachineStatModel } = require('../database/machineStatsModel');

async function getMachineStats(req, res) {
  try {
    const { migid, startTime, endTime } = req.body;

    const MachineStat = getMachineStatModel(getStatsConnection());
    const stats = await MachineStat.find({
      'metadata.MIGID': migid,
      timestamp: { $gte: new Date(startTime), $lte: new Date(endTime) }
    }).sort({ timestamp: 1 });

    res.json({ migid, startTime, endTime, stats });
  } catch (err) {
    console.error('getMachineStats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { getMachineStats };