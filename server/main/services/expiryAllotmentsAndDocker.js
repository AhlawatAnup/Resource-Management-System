const MachineAllotment = require("../database/machineAllotmentModel");
const API_KEY = "myapikey";
// const fetch = require("node-fetch"); // Uncomment if Node < 18

async function markExpiredAllotmentsDeleted() {
  const now = new Date();
  console.log(`\n[${now.toISOString()}] @#@#@# Expiry allotments running @##@#@#@`);

  try {
    // 1️⃣ Fetch inactive allotments
    const inactiveAllotments = await MachineAllotment.find({ isActive: false }).populate("machineId");
    console.log(`[${new Date().toISOString()}] Inactive allotments fetched: ${inactiveAllotments.length}`);

    // 2️⃣ Fetch expired allotments (still active)
    const expiredAllotments = await MachineAllotment.find({
      isActive: true,
      endTime: { $lt: now }
    }).populate("machineId");
    console.log(`[${new Date().toISOString()}] Expired allotments fetched: ${expiredAllotments.length}`);

    // 3️⃣ Combine and deduplicate by _id
    const allToProcess = [...inactiveAllotments, ...expiredAllotments];
    const uniqueAllotments = Array.from(new Map(allToProcess.map(a => [a._id.toString(), a])).values());
    console.log(`[${new Date().toISOString()}] Total unique allotments to process: ${uniqueAllotments.length}`);

    if (uniqueAllotments.length === 0) {
      console.log(`[${new Date().toISOString()}] No expired or inactive allotments to process`);
      return;
    }

    // 4️⃣ Process each allotment sequentially
    for (const allotment of uniqueAllotments) {
      try {
        console.log(`\n[${new Date().toISOString()}] Processing allotment ${allotment._id}`);

        const machine = allotment.machineId;
        if (!machine) {
          console.warn(`[${new Date().toISOString()}] Allotment ${allotment._id} has no machine populated`);
          continue;
        }

        if (!machine.user) {
          console.warn(`[${new Date().toISOString()}] Machine ${machine._id} has no user, skipping`);
          continue;
        }

        const user = machine.user;
        console.log(`[${new Date().toISOString()}] User for this allotment: ${user}`);

        // Stop user
        console.log(`[${new Date().toISOString()}] Sending STOP request for ${user}`);
        const stopResp = await fetch(`http://127.0.0.1:9999/stop/${user}`, {
          method: "POST",
          headers: { "x-api-key": API_KEY }
        });
        const stopData = await stopResp.json();
        console.log(`[${new Date().toISOString()}] STOP response:`, stopData);

        // Delete user
        console.log(`[${new Date().toISOString()}] Sending DELETE request for ${user}`);
        const deleteResp = await fetch(`http://127.0.0.1:9999/user/${user}`, {
          method: "DELETE",
          headers: { "x-api-key": API_KEY }
        });
        const deleteData = await deleteResp.json();
        console.log(`[${new Date().toISOString()}] DELETE response:`, deleteData);

        // Start user
        console.log(`[${new Date().toISOString()}] Sending START request for ${user}`);
        const startResp = await fetch(`http://127.0.0.1:9999/start/${user}`, {
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

module.exports = {
  markExpiredAllotmentsDeleted
};