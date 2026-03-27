const MachineAllotment = require("../database/machineAllotmentModel");
const { saveAllotmentHistory } = require("../utils/machineHistory/historyHelper.js");
const { stopUser, deleteUser, startUser } = require("../utils/dockerAPIs/docker.service.js");

const PORT = process.env.TOKEN_SERVER_PORT;
async function markExpiredAllotmentsDeleted() {
  const now = new Date();

  try {
    // Fetch inactive allotments
    const inactiveAllotments = await MachineAllotment.find({ isActive: false }).populate("machineId");

    // Fetch expired allotments
    const expiredAllotments = await MachineAllotment.find({
      isActive: true,
      endTime: { $lt: now }
    }).populate("machineId");

    // Combine and deduplicate
    const allToProcess = [...inactiveAllotments, ...expiredAllotments];
    const uniqueAllotments = Array.from(new Map(allToProcess.map(a => [a._id.toString(), a])).values());

    if (!uniqueAllotments.length) {
      console.log(`[${new Date().toISOString()}] No allotments to process`);
      return;
    }

    // Process each allotment
    for (const allotment of uniqueAllotments) {
      const machine = allotment.machineId;
      if (!machine || !machine.user || !machine.ip) {
        console.warn(`[${new Date().toISOString()}] Skipping allotment ${allotment._id} - missing machine/user/ip`);
        continue;
      }

      try {
        // --- Save history snapshot ---
        await saveAllotmentHistory(allotment, 'system');

        // --- API calls ---
        const ip = machine.ip;
        const user = machine.user;

        const stopData = await stopUser(ip, PORT, user);
        console.log(`[${new Date().toISOString()}] STOP response for ${user}:`, stopData);

        const deleteData = await deleteUser(ip, PORT, user);
        console.log(`[${new Date().toISOString()}] DELETE response for ${user}:`, deleteData);

        const startData = await startUser(ip, PORT, user);
        console.log(`[${new Date().toISOString()}] START response for ${user}:`, startData);

        // --- Mark allotment as deleted ---
        allotment.isDeleted = true;
        await allotment.save();
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

module.exports = { markExpiredAllotmentsDeleted };