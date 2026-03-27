const History = require("../../database/machineHistoryModel");
const ResourceRequest = require("../../database/resourceRequestModel");
const Student = require("../../database/studentModel");
const Teacher = require("../../database/teacherModel");

async function saveAllotmentHistory(allotment, deletedBy = 'system') {
  try {
    const machine = allotment.machineId;
    if (!machine) {
      console.warn(`Allotment ${allotment._id} has no machine, skipping history save`);
      return;
    }

    // --- Fetch related docs ---
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
    } catch (err) {
      console.warn(`Error fetching related docs for allotment ${allotment._id}: ${err.message}`);
    }

    // --- Prepare snapshots ---

    const student = studentDoc ? {
      name: studentDoc.name || '',
      email: studentDoc.email || '',
      rollNo: studentDoc.rollNo || '',
      phone: studentDoc.phone || '',
      branch: studentDoc.branch || '',
      instituteName: studentDoc.instituteName || '',
      instituteAddress: studentDoc.instituteAddress || '',
      teacherId: studentDoc.teacher?.toString() || '',
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
      studentId: resourceRequestDoc.studentId?.toString() || '',
      title: resourceRequestDoc.title || '',
      purpose: resourceRequestDoc.purpose || '',
      machineId: resourceRequestDoc.machineId?.toString() || '',
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

    const machineAllotmentSnapshot = {
      machineId: machine._id?.toString() || '',
      resourceRequestId: allotment.resourceRequestId?.toString() || '',
      startTime: allotment.startTime || null,
      endTime: allotment.endTime || null,
      isActive: allotment.isActive || false,
      isDeleted: allotment.isDeleted || false,
    };

    // --- Save to History ---
    const historyDoc = new History({
      student,
      teacher,
      resourceRequest,
      machine: machineSnapshot,
      machineAllotment: machineAllotmentSnapshot,
      deletedBy,
      deletedAt: new Date(),
    });

    await historyDoc.save();
    console.log(`History saved for allotment ${allotment._id}`);

  } catch (err) {
    console.error(`Failed to save history for allotment ${allotment._id}: ${err.message}`);
  }
}

module.exports = { saveAllotmentHistory };