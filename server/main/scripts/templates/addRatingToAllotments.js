require('dotenv').config();
const connectDB = require('../../database/db.js');
const { connectStatsDB, getStatsConnection } = require('../../database/connectStatsDB.js');
const { getMachineStatModel } = require('../../database/machineStatsModel.js');
const MachineAllotment = require('../../database/machineAllotmentModel');
require('../../database/machineModel.js');

async function addRatingToAllotments() {
  const now = new Date();

  connectDB();
  connectStatsDB();

  const allotmentsToProcess = await MachineAllotment.find({
    isActive: false,
    isDeleted: true,
  })
    .setOptions({ includeInactive: true, includeDeleted: true })
    .populate({
      path: 'machineId',
      options: { includeDeleted: true, includeUnavailable: true },
    });

  if (!allotmentsToProcess.length) {
    console.log(`[${new Date().toISOString()}] No allotments to process`);
    return;
  }

  let i = 1;
  for (const allotment of allotmentsToProcess) {
    const machine = allotment.machineId;

    if (!machine || !machine.user || !machine.ip) {
      console.warn(
        `[${new Date().toISOString()}] Skipping allotment ${allotment._id} - missing machine/user/ip`,
      );
      continue;
    }

    const machineStats = getMachineStatModel(getStatsConnection());
    const allotmentStats = await machineStats.find({
      'metadata.MIGID': machine.MIGID,
      timestamp: {
        $gt: allotment.startTime,
        $lt: allotment.endTime,
      },
    });

    // console.log('allotmentStats: ', allotmentStats);
    if (allotmentStats.length > 0) {
      let utilizationScore;
      let netComputeUtilization;
      let netMemoryUtilization;
      let percentageUtilization;
      let sumMemoryUtilization = 0;

      for (const stat of allotmentStats) {
        sumMemoryUtilization += stat.memUseMiB;
      }
      netMemoryUtilization =
        sumMemoryUtilization / (allotmentStats.length * allotmentStats[0].memTotalMiB);

      let sumComputeUtilization = 0;
      if (allotmentStats[0].gpuTotalMiB == 0) {
        for (const stat of allotmentStats) {
          sumComputeUtilization += stat.cpuPerc;
        }
        netComputeUtilization = sumComputeUtilization / (allotmentStats.length * 100);
      } else {
        for (const stat of allotmentStats) {
          sumComputeUtilization += stat.gpuVramMiB;
        }
        netComputeUtilization =
          sumComputeUtilization / (allotmentStats.length * allotmentStats[0].gpuTotalMiB);
      }

      const COMPUTE_WEIGHT = 0.7;
      const MEMORY_WEIGHT = 0.3;

      percentageUtilization =
        (netComputeUtilization * COMPUTE_WEIGHT + netMemoryUtilization * MEMORY_WEIGHT) * 100;

      if (percentageUtilization >= 80) {
        utilizationScore = 5;
      } else if (percentageUtilization >= 60) {
        utilizationScore = 4;
      } else if (percentageUtilization >= 50) {
        utilizationScore = 3;
      } else if (percentageUtilization >= 35) {
        utilizationScore = 2;
      } else {
        utilizationScore = 1;
      }

      allotment.utilizationScore = utilizationScore;
      await allotment.save();
      console.log('saved allotment ', i, ' of ', allotmentsToProcess.length, ' allotments.');
    } else {
      console.log('no allotment stats for allotment- ', i);
    }
    i += 1;
  }
  console.log('All allotments processed successfully.');
  process.exit(0);
}

addRatingToAllotments();
