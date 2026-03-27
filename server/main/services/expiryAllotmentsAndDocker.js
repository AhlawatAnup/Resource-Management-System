const MachineAllotment = require("../database/machineAllotmentModel");
const History = require("../database/machineHistoryModel");
const ResourceRequest = require("../database/resourceRequestModel");
const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
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

        // --- Fetch related data for full history snapshot ---
        let resourceRequestDoc = null;
        let studentDoc = null;
        let teacherDoc = null;
        try {
          resourceRequestDoc = await ResourceRequest.findById(allotment.resourceRequestId);
          if (resourceRequestDoc) {
            studentDoc = await Student.findById(resourceRequestDoc.studentId || resourceRequestDoc.student);
            if (studentDoc && studentDoc.teacher) {
              teacherDoc = await Teacher.findById(studentDoc.teacher);
            }
          }
        } catch (fetchErr) {
          console.warn(`[${new Date().toISOString()}] Could not fetch related docs for allotment ${allotment._id}:`, fetchErr.message);
        }

        // Prepare history entry (populate all fields as text, no references)
        const student = studentDoc ? {
          name: studentDoc.name || '',
          email: studentDoc.email || '',
          rollNo: studentDoc.rollNo || '',
          phone: studentDoc.phone || '',
          branch: studentDoc.branch || '',
          instituteName: studentDoc.instituteName || '',
          instituteAddress: studentDoc.instituteAddress || '',
          teacherId: (studentDoc.teacher && studentDoc.teacher.toString()) || '',
          teacher_verified: studentDoc.teacher_verified || false,
          admin_verified: studentDoc.admin_verified || false,
          is_verified: studentDoc.is_verified || false,
        } : {};

        const teacher = teacherDoc ? {
          name: teacherDoc.name || '',
          email: teacherDoc.email || '',
          phone: teacherDoc.phone || '',
          branch: teacherDoc.branch || '',
          is_verified: teacherDoc.is_verified || false,
          verification_completed: teacherDoc.verification_completed || false,
        } : {};

        const resourceRequest = resourceRequestDoc ? {
          studentId: (resourceRequestDoc.studentId && resourceRequestDoc.studentId.toString()) || '',
          title: resourceRequestDoc.title || '',
          purpose: resourceRequestDoc.purpose || '',
          machineId: (resourceRequestDoc.machineId && resourceRequestDoc.machineId.toString()) || '',
          duration: resourceRequestDoc.duration || null,
          version: resourceRequestDoc.version || null,
          teacher_action: resourceRequestDoc.teacher_action || false,
          teacher_verified: resourceRequestDoc.teacher_verified || false,
          admin_action: resourceRequestDoc.admin_action || false,
          admin_verified: resourceRequestDoc.admin_verified || false,
          is_verified: resourceRequestDoc.is_verified || false,
          createdAt: resourceRequestDoc.createdAt || null,
          updatedAt: resourceRequestDoc.updatedAt || null,
          isEdited: resourceRequestDoc.isEdited || false,
        } : {};

        // Machine snapshot
        const machineSnapshot = {
          MIGID: machine.MIGID || '',
          name: machine.name || '',
          ip: machine.ip || '',
          port: machine.port || null,
          user: machine.user || '',
          gpuRam: machine.gpuRam || null,
          ram: machine.ram || null,
          version: machine.version || null,
          isAvailable: machine.isAvailable || false,
          isDeleted: machine.isDeleted || false,
        };

        // MachineAllotment snapshot
        const machineAllotmentSnapshot = {
          machineId: (machine._id && machine._id.toString()) || (allotment.machineId && allotment.machineId.toString && typeof allotment.machineId.toString === 'function' ? allotment.machineId.toString() : ''),
          resourceRequestId: (allotment.resourceRequestId && allotment.resourceRequestId.toString && typeof allotment.resourceRequestId.toString === 'function' ? allotment.resourceRequestId.toString() : ''),
          startTime: allotment.startTime || null,
          endTime: allotment.endTime || null,
          isActive: allotment.isActive || false,
          isDeleted: allotment.isDeleted || false,
        };

        // Compose history doc
        const historyDoc = new History({
          student,
          teacher,
          resourceRequest,
          machine: machineSnapshot,
          machineAllotment: machineAllotmentSnapshot,
          deletedBy: 'system',
          deletedAt: new Date(),
        });
        await historyDoc.save();

        // --- API calls ---
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