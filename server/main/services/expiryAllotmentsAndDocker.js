const MachineAllotment = require("../database/machineAllotmentModel");
const ResourceRequest = require("../database/resourceRequestModel"); // 👈 ADD THIS
const { saveAllotmentHistory } = require("../utils/machineHistory/historyHelper.js");
const { stopUser, deleteUser, startUser } = require("../utils/dockerAPIs/docker.service.js");

async function markExpiredAllotmentsHistoryAndCleanupDocker() {
  const now = new Date();
  console.log("~~~~~hit: markExpiredAllotmentsHistoryAndCleanupDocker");
  try {
    const allotmentsToProcess = await MachineAllotment.find({
      $or: [
        { isActive: false },
        { isActive: true, endTime: { $lt: now } }
      ]
    })
    .setOptions({ includeInactive: true })
    .populate({
      path: "machineId",
      options: { includeDeleted: true, includeUnavailable: true }
    });
    
    if (!allotmentsToProcess.length) {
      console.log(`[${new Date().toISOString()}] No allotments to process`);
      return;
    }

    for (const allotment of allotmentsToProcess) {
      const machine = allotment.machineId;

      if (!machine || !machine.user || !machine.ip) {
        console.warn(`[${new Date().toISOString()}] Skipping allotment ${allotment._id} - missing machine/user/ip`);
        continue;
      }

      try {
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

        // ALSO mark related ResourceRequest inactive
        if (allotment.resourceRequestId) {
          await ResourceRequest.findByIdAndUpdate(
            allotment.resourceRequestId,
            { isActive: false },
            { new: true }
          );
        }

        console.log(`[${new Date().toISOString()}] Allotment ${allotment._id} marked as deleted`);

      } catch (err) {
        console.error(`[${new Date().toISOString()}] Error processing allotment ${allotment._id}:`, err.message);
      }
    }

    console.log(`[${new Date().toISOString()}] Finished processing all expired allotments`);

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching expired/inactive allotments:`, err.message);
  }
}

module.exports = { markExpiredAllotmentsHistoryAndCleanupDocker };