const MachineAllotment = require('../database/machineAllotmentModel');
const ResourceRequest = require('../database/resourceRequestModel');
const { saveAllotmentHistory } = require('../utils/machineHistory/historyHelper.js');
const { stopUser, deleteUser, startUser } = require('../utils/dockerAPIs/docker.service.js');
const { getMachineStatModel } = require('../database/machineStatsModel.js');
const { getStatsConnection } = require('../database/connectStatsDB.js');

function percentToScore(percentage) {
  let score;
  if (percentage >= 80) {
    score = 5;
  } else if (percentage >= 60) {
    score = 4;
  } else if (percentage >= 50) {
    score = 3;
  } else if (percentage >= 35) {
    score = 2;
  } else {
    score = 1;
  }
  return score;
}

function calculateAllotmentWiseScore(allotmentStats) {
  let utilizationScore;
  let netComputeUtilization;
  let netMemoryUtilization;
  let percentageUtilization;
  let sumMemoryUtilization = 0;
  let sumComputeUtilization = 0;

  for (const stat of allotmentStats) {
    sumMemoryUtilization += stat.memUseMiB;
    if (allotmentStats[0].gpuTotalMiB == 0) {
      sumComputeUtilization += stat.cpuPerc;
    } else {
      sumComputeUtilization += stat.gpuVramMiB;
    }
  }

  if (allotmentStats[0].gpuTotalMiB == 0) {
    netComputeUtilization = sumComputeUtilization / (allotmentStats.length * 100);
  } else {
    netComputeUtilization =
      sumComputeUtilization / (allotmentStats.length * allotmentStats[0].gpuTotalMiB);
  }

  netMemoryUtilization =
    sumMemoryUtilization / (allotmentStats.length * allotmentStats[0].memTotalMiB);

  const COMPUTE_WEIGHT = 0.8;
  const MEMORY_WEIGHT = 0.2;

  percentageUtilization =
    (netComputeUtilization * COMPUTE_WEIGHT + netMemoryUtilization * MEMORY_WEIGHT) * 100;

  utilizationScore = percentToScore(percentageUtilization);

  return utilizationScore;
  // console.log('netCpuUtilization: ', netCpuUtilization);
  // console.log('netMemoryUtilization: ', netMemoryUtilization);
  // console.log('netGpuUtilization: ', netGpuUtilization);
  // console.log('percentageUtilization: ', percentageUtilization);
  // console.log('utilizationScore: ', utilizationScore);
}

function calculateStudentScores(studentDoc, request, allotment) {
  let stuResUtilScore = 0;
  const prevScore = studentDoc.resourceUtilizationScore;
  const prevDuration = studentDoc.totalAllotmentsDuration;
  const newDuration = prevDuration + request.duration;

  console.log('prevCummulativeScore: ', prevScore);
  console.log('prevDuration: ', prevDuration);

  console.log('request.duration: ', request.duration);
  stuResUtilScore =
    (prevScore * prevDuration + allotment.utilizationScore * request.duration) / newDuration;

  return (
    (studentDoc.resourceUtilizationScore = stuResUtilScore) &&
    (studentDoc.totalAllotmentsDuration = newDuration)
  );
}

async function markExpiredAllotmentsHistoryAndCleanupDocker() {
  const now = new Date();
  console.log('Cleaner: Checking and Cleaning Docker');
  try {
    const allotmentsToProcess = await MachineAllotment.find({
      isActive: true,
      endTime: { $lt: now },
    })
      .setOptions({ includeInactive: true })
      .populate({
        path: 'machineId',
        options: { includeDeleted: true, includeUnavailable: true },
      })
      .populate({
        path: 'resourceRequestId',
      });

    if (!allotmentsToProcess.length) {
      console.log(`[${new Date().toISOString()}] No allotments to process`);
      return;
    }

    for (const allotment of allotmentsToProcess) {
      const machine = allotment.machineId;

      // console.log(machine);

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
      //here on: we need to calculate allotment-wise rating..
      // to do that, we take avg. of all cpu usage percentages recorded.. or the gpu usage(w.r.t total gpu allocated)
      //then with this rating as a part of the allotment doc.. we save it ..
      // then we use it in student's resourceutilizationScore calculation, adjusting for no. of days of this allotment.

      if (allotmentStats.length > 0) {
        allotment.utilizationScore = calculateAllotmentWiseScore(allotmentStats);
      } else {
        allotment.utilizationScore = 5;
      }

      // console.log('allotment.utilizationScore: ', allotment.utilizationScore);

      // console.log('allotment saved: ', allotment);

      // REMOVING TRY/CATCH
      await saveAllotmentHistory(allotment, 'system');

      const baseUrl = `http://${machine.ip}:${process.env.TOKEN_SERVER_PORT}`;
      const { user } = machine;

      const stopData = await stopUser(baseUrl, user);
      console.log(`[${new Date().toISOString()}] STOP response for ${user}:`, stopData);

      const deleteData = await deleteUser(baseUrl, user);
      console.log(`[${new Date().toISOString()}] DELETE response for ${user}:`, deleteData);

      const startData = await startUser(baseUrl, user);
      console.log(`[${new Date().toISOString()}] START response for ${user}:`, startData);

      // Mark allotment inactive/deleted
      allotment.isDeleted = true;
      allotment.isActive = false;
      await allotment.save();

      const request = allotment.resourceRequestId;
      await request.populate({
        path: 'studentId',
      });

      const studentDoc = request.studentId;

      calculateStudentScores(studentDoc, request, allotment);
      await studentDoc.save();

      // ALSO mark related ResourceRequest inactive
      if (allotment.resourceRequestId) {
        await ResourceRequest.findByIdAndUpdate(
          allotment.resourceRequestId,
          { isActive: false },
          { new: true },
        );
      }

      console.log(`[${new Date().toISOString()}] Allotment ${allotment._id} marked as deleted`);
    }

    console.log(`[${new Date().toISOString()}] Finished processing all expired allotments`);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Error fetching expired/inactive allotments:`,
      err.message,
    );
  }
}

module.exports = { markExpiredAllotmentsHistoryAndCleanupDocker };
