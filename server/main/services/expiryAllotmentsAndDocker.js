const MachineAllotment = require("../database/machineAllotmentModel");
const API_KEY = "myapikey";
// const fetch = require("node-fetch"); // Uncomment if Node < 18

const PORT = process.env.TOKEN_SERVER_PORT || 9999; // fallback to 9999

async function markExpiredAllotmentsDeleted() {
  const now = new Date();

  try {
    // Fetch inactive allotments
    const inactiveAllotments = await MachineAllotment.find({ isActive: false }).populate("machineId");
    console.log(`[${new Date().toISOString()}] Inactive allotments fetched: ${inactiveAllotments.length}`);

    // Fetch expired allotments
    const expiredAllotments = await MachineAllotment.find({
      isActive: true,
      endTime: { $lt: now }
    }).populate("machineId");
    console.log(`[${new Date().toISOString()}] Expired allotments fetched: ${expiredAllotments.length}`);

    // Combine and deduplicate
    const allToProcess = [...inactiveAllotments, ...expiredAllotments];
    const uniqueAllotments = Array.from(new Map(allToProcess.map(a => [a._id.toString(), a])).values());
    console.log(`[${new Date().toISOString()}] Total unique allotments to process: ${uniqueAllotments.length}`);

    if (uniqueAllotments.length === 0) return console.log(`[${new Date().toISOString()}] No allotments to process`);

    // Process each allotment sequentially
    for (const allotment of uniqueAllotments) {
      try {

        const machine = allotment.machineId;
        if (!machine || !machine.user || !machine.ip) {
          console.warn(`[${new Date().toISOString()}] Skipping allotment ${allotment._id} - missing machine/user/ip`);
          continue;
        }

        const user = machine.user;
        const ip = machine.ip;
        const baseUrl = `http://${ip}:${PORT}`;
        console.log(baseUrl);

        // Stop user
        const stopResp = await fetch(`${baseUrl}/stop/${user}`, {
          method: "POST",
          headers: { "x-api-key": API_KEY }
        });
        const stopData = await stopResp.json();
        console.log(`[${new Date().toISOString()}] STOP response:`, stopData);

        // Delete user
        const deleteResp = await fetch(`${baseUrl}/user/${user}`, {
          method: "DELETE",
          headers: { "x-api-key": API_KEY }
        });
        const deleteData = await deleteResp.json();
        console.log(`[${new Date().toISOString()}] DELETE response:`, deleteData);

        // Start user
        const startResp = await fetch(`${baseUrl}/start/${user}`, {
          method: "POST",
          headers: { "x-api-key": API_KEY }
        });
        const startData = await startResp.json();
        console.log(`[${new Date().toISOString()}] START response:`, startData);

        // Mark allotment as deleted
        allotment.isDeleted = true;
        await allotment.save();
        console.log(`[${new Date().toISOString()}] Allotment ${allotment._id} marked as deleted`);

      } catch (apiErr) {
        console.error(`[${new Date().toISOString()}] Error processing allotment ${allotment._id}:`, apiErr.message);
      }
    }

    console.log(`[${new Date().toISOString()}] ===== Finished processing all expired allotments =====`);

  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error fetching expired/inactive allotments:`, err);
  }
}

module.exports = { markExpiredAllotmentsDeleted };