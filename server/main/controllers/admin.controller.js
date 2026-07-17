const mongoose = require('mongoose');
const Teacher = require('../database/teacherModel');
const Student = require('../database/studentModel');
const Admin = require('../database/adminModel');
const Machine = require('../database/machineModel');
const MachineAllotment = require('../database/machineAllotmentModel.js');
const ResourceRequest = require('../database/resourceRequestModel');
const emailService = require('../utils/email/emails.service.js');
const { notifyTeacher } = require('../utils/web-push-notifications/notifyTeacher.js');
const { notifyStudent } = require('../utils/web-push-notifications/notifyStudent.js');
const {
  validateMachineInput,
  deleteTeacher,
  unverifyStudent,
  unverifyTeacher,
  getAllotmentMap,
} = require('../utils/common.utils.js');
const bcrypt = require('bcrypt');
const { saveAllotmentHistory } = require('../../main/utils/machineHistory/historyHelper.js');
exports.admin_dashboard_data = async (req, res) => {
  try {
    // Get counts for dashboard statistics
    const totalTeachers = await Teacher.countDocuments();
    const verifiedTeachers = await Teacher.countDocuments({ is_verified: true });
    const pendingTeachers = await Teacher.countDocuments({ verification_completed: false });

    const totalStudents = await Student.countDocuments();
    const verifiedStudents = await Student.countDocuments({ is_verified: true });
    const pendingStudents = await Student.countDocuments({
      $or: [
        { teacher_action: false }, // Pending on teacher
        { admin_action: false }, // Pending on admin
      ],
    });

    return res.json({
      teachers: {
        total: totalTeachers,
        verified: verifiedTeachers,
        pending: pendingTeachers,
      },
      students: {
        total: totalStudents,
        verified: verifiedStudents,
        pending: pendingStudents,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch admin dashboard data' });
  }
};

exports.getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await Teacher.find({ verification_completed: false }).sort({
      createdAt: -1,
    });
    return res.json({ teachers: pendingTeachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch pending teachers' });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('students', 'name rollNo')
      .sort({ createdAt: -1 });
    return res.json({ teachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

exports.updateTeacherVerification = async (req, res) => {
  const { teacher_id } = req.params;
  const { is_verified } = req.body;

  try {
    const teacher = await Teacher.findById(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (is_verified) {
      const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacher_id,
        {
          is_verified: is_verified,
          verification_completed: true,
        },
        { new: true },
      );

      emailService
        .sendTeacherProfileVerifiedByAdminEmail(teacher.email, teacher.name)
        .then((result) => console.log('Email sent for teacher profile verified by admin:', result))
        .catch((error) => console.error('Error sending verification email:', error));

      notifyTeacher(teacher_id, {
        title: 'Profile verified by Admin',
        body: `Congratulations! Your profile has been verified by the admin`,
      }).catch((pushErr) => {
        console.error('[WebPush] Error in teacher notification block:', pushErr);
      });

      // console.log("Teacher verification updated:", updatedTeacher);
      return res.json({
        message: 'Teacher verification status updated successfully',
        teacher: { ...updatedTeacher._doc },
      });
    } else {
      // Reject: Delete the teacher account
      emailService
        .sendTeacherProfileRejectedByAdminEmail(teacher.email, teacher.name)
        .then((result) => console.log('Email sent for teacher profile rejected by admin:', result))
        .catch((error) => console.error('Error sending rejection email:', error));

      notifyTeacher(teacher_id, {
        title: 'Profile rejected by Admin',
        body: `Your profile was rejected by admin.`,
      }).catch((pushErr) => {
        console.error('[WebPush] Error in teacher notification block:', pushErr);
      });

      // Use your cascade delete
      await deleteTeacher(teacher_id);

      return res.json({ message: 'Teacher account and all related data deleted successfully' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update teacher verification' });
  }
};

exports.unverifyTeacher = async (req, res) => {
  const { teacher_id } = req.params;

  try {
    const teacher = await Teacher.findById(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Unverify teacher and all its students
    const result = await unverifyTeacher(teacher_id);

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    console.error('Error in unverifyTeacher:', err);
    return res.status(500).json({ error: 'Failed to unverify teacher' });
  }
};

exports.unverifyStudentByAdmin = async (req, res) => {
  const { student_id } = req.params;

  try {
    const result = await unverifyStudent(student_id);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Unverify student error:', err.message);

    return res.status(400).json({
      error: err.message || 'Failed to unverify student',
    });
  }
};

exports.getPendingStudents = async (req, res) => {
  try {
    // Get all students that are pending - either pending on teacher OR pending on admin
    const pendingStudents = await Student.find({
      $or: [
        // Case 1: teacher hasn’t taken action yet
        { teacher_action: false },

        // Case 2: teacher has acted & verified, but admin still pending
        { teacher_action: true, teacher_verified: true, admin_action: false },
      ],
    })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    return res.json({ students: pendingStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch pending students' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('teacher', 'name').sort({ createdAt: -1 });
    return res.json({ students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.getRejectedTeachers = async (req, res) => {
  try {
    // Get teachers that have been rejected (verification_completed = true, is_verified = false)
    const rejectedTeachers = await Teacher.find({
      verification_completed: true,
      is_verified: false,
    }).sort({ createdAt: -1 });
    return res.json({ teachers: rejectedTeachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch rejected teachers' });
  }
};

exports.getRejectedStudents = async (req, res) => {
  try {
    // Get students that have been rejected by either teacher or admin
    const rejectedStudents = await Student.find({
      $or: [
        // Case 1: teacher has taken action and rejected the student
        { teacher_action: true, teacher_verified: false },

        // Case 2: admin has taken action and rejected the student (teacher approved but admin rejected)
        { teacher_action: true, teacher_verified: true, admin_action: true, admin_verified: false },
      ],
    })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    return res.json({ students: rejectedStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch rejected students' });
  }
};

exports.getAllResourceRequests = async (req, res) => {
  const role = req.session.user.role;

  if (role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    const resourceRequests = await ResourceRequest.find({})
      .populate({
        path: 'studentId',
        select: 'name rollNo branch teacher',
        populate: { path: 'teacher', select: 'name' },
      })
      .populate({
        path: 'machineId',
        select: 'MIGID user gpuRam ram ip port name',
        options: { includeUnavailable: true, includeDeleted: true },
      })
      .sort({ createdAt: -1 });

    // Fetch all allotments for these requests in one query
    const requestIds = resourceRequests.map((r) => r._id);
    const allotmentMap = await getAllotmentMap(requestIds);

    const formattedRequests = resourceRequests
      .filter((r) => r.studentId && r.machineId)
      .map((r) => {
        const allotment = allotmentMap[r._id.toString()];
        return {
          _id: r._id,
          createdAt: r.createdAt,
          studentName: r.studentId.name,
          rollNo: r.studentId.rollNo,
          branch: r.studentId.branch,
          teacherName: r.studentId.teacher ? r.studentId.teacher.name : 'Unknown',
          title: r.title,
          purpose: r.purpose,
          duration: r.duration,
          migId: r.machineId.MIGID,
          user: r.machineId.user,
          gpuRam: r.machineId.gpuRam,
          ram: r.machineId.ram,
          ip: r.machineId.ip,
          port: r.machineId.port,
          name: r.machineId.name,
          startTime: allotment?.startTime ?? null,
          endTime: allotment?.endTime ?? null,
          status: {
            teacher_action: r.teacher_action,
            teacher_verified: r.teacher_verified,
            admin_action: r.admin_action,
            admin_verified: r.admin_verified,
            is_verified: r.is_verified,
            isActive: r.isActive,
          },
        };
      });

    return res.json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests,
    });
  } catch (err) {
    console.error('Error fetching all resource requests:', err);
    return res.status(500).json({ error: 'Failed to fetch resource requests' });
  }
};

// Get admin username, name, and email
exports.getAdminDetails = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Not authenticated as admin' });
  }
  try {
    const admin = await Admin.findById(req.session.user.id).select('username name email');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    return res.json(admin);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch admin details' });
  }
};

// Change admin password
exports.ChangeAdminPassword = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Not authenticated as admin' });
  }
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const admin = await Admin.findByIdAndUpdate(
      req.session.user.id,
      { password: hashedPassword },
      { new: true },
    ).select('username name email');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
};

// Update admin username and/or email
exports.UpdateAdminProfile = async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Not authenticated as admin' });
  }

  const { newEmail, newUsername } = req.body;

  if (!newEmail && !newUsername) {
    return res.status(400).json({ error: 'Provide newEmail and/or newUsername to update.' });
  }

  // Validation
  if (newEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }
  if (newUsername && String(newUsername).trim().length === 0) {
    return res.status(400).json({ error: 'Invalid username.' });
  }

  try {
    const admin = await Admin.findById(req.session.user.id).select('username email');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    // Store original email for security alert notification
    const oldEmail = admin.email;

    const changes = {};

    // Check email uniqueness and change
    if (newEmail && admin.email !== newEmail) {
      const exists = await Admin.findOne({ email: newEmail });
      if (exists) return res.status(400).json({ error: 'Email already in use.' });
      changes.email = newEmail;
      admin.email = newEmail;
    }

    // Check username uniqueness and change
    if (newUsername && admin.username !== newUsername) {
      const existsU = await Admin.findOne({ username: newUsername });
      if (existsU) return res.status(400).json({ error: 'Username already in use.' });
      changes.username = newUsername;
      admin.username = newUsername;
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: 'No changes detected or values are same as current.' });
    }

    await admin.save();

    // Update session user fields so frontend sees new values without re-login
    if (req.session.user) {
      if (changes.username) req.session.user.username = changes.username;
      if (changes.email) req.session.user.email = changes.email;
    }

    // Send email notification if username was changed
    if (changes.username) {
      const changedAtTime = new Date().toLocaleString();
      emailService
        .sendAdminUsernameChangeEmail(changes.username, changedAtTime)
        .then((result) => console.log('Username change notification sent to admin:', result))
        .catch((error) => console.error('Error sending username change email:', error));
    }

    // Send email notifications if email was changed
    if (changes.email) {
      const changedAtTime = new Date().toLocaleString();

      // Send security alert to old email
      emailService
        .sendAdminEmailChangeSecurityAlertEmail(oldEmail, changes.email)
        .then((result) => console.log('Security alert sent to old email:', result))
        .catch((error) => console.error('Error sending security alert email:', error));

      // Send confirmation to new email
      emailService
        .sendAdminEmailChangeConfirmationEmail(changes.email, changedAtTime)
        .then((result) => console.log('Confirmation sent to new email:', result))
        .catch((error) => console.error('Error sending confirmation email:', error));
    }

    return res.json({ success: true, message: 'Admin identity updated.', changes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update admin identity.' });
  }
};

// Backwards compatible aliases: support both older and newer names
exports.ChangeAdminEmail = exports.UpdateAdminProfile;
exports.UpdateAdminIdentity = exports.UpdateAdminProfile;

exports.getMachines = async (req, res) => {
  try {
    const machines = await Machine.find().setOptions({ includeUnavailable: true }).lean(); //setOptions is needed coz of pre middleware

    return res.json({
      ok: true,
      machines,
    });
  } catch (err) {
    console.error('Failed to fetch machines', err);
    return res.status(500).json({
      error: 'Failed to fetch machines',
    });
  }
};

// Create a new machine
exports.createMachine = async (req, res) => {
  try {
    const { error, value } = validateMachineInput(req.body);

    if (error) {
      return res.status(400).json({ error });
    }

    const machine = new Machine(value);
    await machine.save();

    return res.status(201).json({
      ok: true,
      machine,
    });
  } catch (err) {
    console.error('Failed to create machine', err);

    if (err.code === 11000) {
      return res.status(409).json({ error: 'MIGID already exists' });
    }

    return res.status(500).json({ error: 'Failed to create machine' });
  }
};

// Helper function to delete resource request and clean up references
async function deleteResourceRequestAndCleanup(resourceRequestId, studentId) {
  if (!resourceRequestId) {
    throw new Error('ResourceRequestId is required');
  }

  try {
    if (studentId) {
      await Student.findByIdAndUpdate(studentId, {
        $pull: { resourceRequests: resourceRequestId },
      });
    }

    const deleted = await ResourceRequest.findByIdAndDelete(resourceRequestId);

    if (!deleted) {
      throw new Error('Resource request not found');
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error; // Let controller decide response
  }
}

// Update a machine (MIGID, gpuRam, assignedStudent)
// When unassigning, also deletes the associated resource request
exports.updateMachineAvailability = async (req, res) => {
  const { id } = req.params;
  const { isAvailable } = req.body;

  try {
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({
        error: 'isAvailable must be a boolean (true or false)',
      });
    }

    const machine = await Machine.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true, includeUnavailable: true },
    ).lean();

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({
      ok: true,
      message: `Machine marked as ${isAvailable ? 'available' : 'unavailable'}`,
      machine,
    });
  } catch (err) {
    console.error('Failed to update machine', err);
    return res.status(500).json({
      error: 'Failed to update machine',
    });
  }
};

// Delete a machine
exports.deleteMachine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid machine ID' });
  }

  try {
    // Check if machine exists
    const machine = await Machine.findOne({ _id: id }).setOptions({ includeUnavailable: true });

    if (!machine) return res.status(404).json({ error: 'Machine not found' });

    // Check for active or future allotments first
    const now = new Date();
    const activeAllotment = await MachineAllotment.findOne({
      machineId: id,
      $or: [
        { isActive: true },
        { endTime: { $gte: now } }, // future allotments
      ],
    });

    if (activeAllotment) {
      return res.status(400).json({
        error: 'Cannot delete machine with active or future allotments',
      });
    }

    // Check if machine is disabled
    if (machine.isAvailable) {
      return res.status(400).json({
        error: 'Machine must be disabled before deletion',
      });
    }

    // Safe to delete
    // await Machine.findByIdAndUpdate(id, { isDeleted: true });
    await Machine.findOneAndUpdate({ _id: id }, { isDeleted: true }, { includeUnavailable: true });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete machine', err);
    return res.status(500).json({ error: 'Failed to delete machine' });
  }
};

exports.revokeResourceRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { remarks } = req.body;
    console.log(requestId);

    // 1. Validate ID
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid requestId' });
    }

    // 2. Find request
    const request = await ResourceRequest.findById(requestId).populate('studentId');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!request.studentId) {
      return res.status(404).json({ message: 'Student not found for this request' });
    }

    // 3. Update request
    request.is_verified = false;
    request.admin_action = true;
    request.admin_verified = false;
    request.isActive = false;
    request.revoke_remarks = remarks;

    await request.save();

    // 4. Deactivate matching allotments
    const result = await MachineAllotment.updateMany(
      {
        resourceRequestId: requestId,
        isActive: true,
      },
      {
        $set: { isActive: false },
      },
    );

    // 5. Send notification email to student
    emailService
      .sendResourceRequestRevokedByAdminEmail(
        request.studentId.email,
        request.studentId.name,
        request.title,
        remarks || '',
      )
      .then((result) => console.log('Resource revoked email sent to student:', result))
      .catch((error) => console.error('Error sending resource revoked email:', error));

    return res.status(200).json({
      message: 'Request rejected, allotments deactivated, and student notified',
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

exports.extendAllotment = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { extraDuration } = req.body; // in days

    // 1. Validate input
    if (!extraDuration || extraDuration <= 0) {
      return res.status(400).json({ message: 'Invalid extension duration' });
    }

    // 2. Fetch request
    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Resource request not found' });
    }

    // 3. Fetch allotment
    const allotment = await MachineAllotment.findOne({
      resourceRequestId: requestId,
    });

    if (!allotment) {
      return res.status(404).json({ message: 'Allotment not found' });
    }

    const currentEndTime = new Date(allotment.endTime); // UTC

    // 4. Check future booking
    const futureExists = await MachineAllotment.exists({
      machineId: allotment.machineId,
      startTime: { $gte: currentEndTime },
    });

    if (futureExists) {
      return res.status(400).json({
        message: 'Cannot extend: Machine already booked for future',
      });
    }

    // 5. Compute new end time
    const newEndTime = new Date(
      currentEndTime.getTime() + extraDuration * 86400000, // 1 day = 86400000 ms
    );

    // 6. Update
    const extra = parseInt(extraDuration, 10);
    const current = parseInt(request.duration, 10);

    request.duration = current + extra;
    request.updatedAt = new Date();

    allotment.endTime = newEndTime;

    await request.save();
    await allotment.save();

    return res.status(200).json({
      message: 'Allotment extended successfully',
      newEndTime, // UTC
      newDuration: request.duration,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRejectedRequest = async (req, res) => {
  try {
    //extract resourceRequestId from request
    //fetch resourceRequest from database
    //check if admin is hitting the end-point
    //check whether it really is a rejected request
    //remove the request object from the requests array in the student's document
    //remove from machineAllotments document as well(match both machineId and resourceResquestId)

    const { requestId } = req.params;
    const requestDoc = await ResourceRequest.findById(requestId);
    if (!requestDoc) {
      return res.status(404).json({
        message: 'Resource Request not found!',
      });
    }
    const role = req.session.user?.role;
    if (role != 'admin') {
      return res.status(403).json({
        message: 'User unauthorized to perform this action',
      });
    }
    const isExplicitlyRejected =
      requestDoc.is_verified === false &&
      (requestDoc.admin_action === true ||
        requestDoc.teacher_action === true ||
        requestDoc.isActive === false);
    if (!isExplicitlyRejected) {
      return res.status(400).json({
        message:
          "This isn't a rejected request. Can only delete explicitly rejected or revoked requests!",
      });
    }

    //saving history before deletion, to prevent error in case of saving of history after resourceRequest doc is deleted.
    const allotmentDoc = await MachineAllotment.findOne({
      resourceRequestId: new mongoose.Types.ObjectId(requestId),
    })
      .setOptions({ includeInactive: true, includeDeleted: true })
      .populate('machineId');

    if (allotmentDoc) {
      const deletedByWho = req.session.user?.name || 'admin';
      // This will internally populate resourceRequestId -> studentId -> teacher and save snapshot
      await saveAllotmentHistory(allotmentDoc, deletedByWho);

      // Now it's safe to drop the allotment document since history is securely written
      await MachineAllotment.deleteOne({ _id: allotmentDoc._id });
    }

    const targetStudentId = requestDoc.studentId;
    await Student.findByIdAndUpdate(targetStudentId, {
      $pull: { resourceRequests: requestDoc._id },
    });

    await ResourceRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      message: 'deleted request successfully!',
    });
  } catch (error) {
    console.log('Error in deleting request: ', error);
    return res.status(500).json({
      message: 'Internal server error in deleting request!',
    });
  }
};
