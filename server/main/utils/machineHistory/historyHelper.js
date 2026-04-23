const History = require('../../database/machineHistoryModel');

async function saveAllotmentHistory(allotment, deletedBy = 'system') {
  try {
    const machine = allotment.machineId;
    if (!machine) {
      console.warn(`Allotment ${allotment._id} has no machine, skipping history save`);
      return;
    }

    try {
      await allotment.populate({
        path: 'resourceRequestId',
        populate: {
          path: 'studentId',
          populate: { path: 'teacher' },
        },
      });
    } catch (err) {
      console.warn(`Error populating related docs for allotment ${allotment._id}: ${err.message}`);
    }

    const request = allotment.resourceRequestId;
    const student = request?.studentId;
    const teacher = student?.teacher;

    const historyDoc = new History({
      deletedBy,
      deletedAt: new Date(),

      machine: {
        _id: machine._id?.toString(),
        MIGID: machine.MIGID,
        name: machine.name,
        ip: machine.ip,
        port: machine.port,
        user: machine.user,
        gpuRam: machine.gpuRam,
        ram: machine.ram,
        version: machine.version,
        isAvailable: machine.isAvailable,
        isDeleted: machine.isDeleted,
      },

      machineAllotment: {
        _id: allotment._id?.toString(),
        machineId: machine._id?.toString(),
        resourceRequestId: request?._id?.toString(),
        startTime: allotment.startTime,
        endTime: allotment.endTime,
        isActive: allotment.isActive,
        isDeleted: allotment.isDeleted,
      },

      resourceRequest: request
        ? {
            _id: request._id?.toString(),
            studentId: student?._id?.toString(),
            title: request.title,
            purpose: request.purpose,
            duration: request.duration,
            version: request.version,
            teacher_action: request.teacher_action,
            teacher_verified: request.teacher_verified,
            admin_action: request.admin_action,
            admin_verified: request.admin_verified,
            is_verified: request.is_verified,
            isEdited: request.isEdited,
            createdAt: request.createdAt,
          }
        : {},

      student: student
        ? {
            _id: student._id?.toString(),
            teacherId: teacher?._id?.toString(),
            name: student.name,
            email: student.email,
            rollNo: student.rollNo,
            phone: student.phone,
            branch: student.branch,
            instituteName: student.instituteName,
            teacher_verified: student.teacher_verified,
            admin_verified: student.admin_verified,
            is_verified: student.is_verified,
          }
        : {},

      teacher: teacher
        ? {
            _id: teacher._id?.toString(),
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone,
            branch: teacher.branch,
            is_verified: teacher.is_verified,
            verification_completed: teacher.verification_completed,
          }
        : {},
    });

    await historyDoc.save();
    console.log(`History saved for allotment ${allotment._id}`);
  } catch (err) {
    console.error(`Failed to save history for allotment ${allotment._id}: ${err.message}`);
  }
}

module.exports = { saveAllotmentHistory };
