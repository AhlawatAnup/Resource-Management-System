const Teacher = require("../database/teacherModel");
const Student = require("../database/studentModel");
const Admin = require("../database/adminModel");
const Machine = require('../database/machineModel');
const ResourceRequest = require("../database/resourceRequestModel");
const bcrypt = require('bcrypt');

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
        { admin_action: false }    // Pending on admin
      ]
    });

    return res.json({
      teachers: {
        total: totalTeachers,
        verified: verifiedTeachers,
        pending: pendingTeachers
      },
      students: {
        total: totalStudents,
        verified: verifiedStudents,
        pending: pendingStudents
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch admin dashboard data" });
  }
};

exports.getPendingTeachers = async (req, res) => {
  try {
    const pendingTeachers = await Teacher.find({ verification_completed: false }).sort({ createdAt: -1 });
    return res.json({ teachers: pendingTeachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch pending teachers" });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('students', 'name rollNo').sort({ createdAt: -1 });
    return res.json({ teachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

exports.updateTeacherVerification = async (req, res) => {
  const { teacher_id } = req.params;
  const { is_verified } = req.body;

  // console.log("Updating teacher verification", teacher_id, "to", is_verified);

  try {
    const teacher = await Teacher.findById(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Email notification for teacher profile verification/rejection
    const emailService = require("../utils/emailService.js");
    if (is_verified) {
      // Approve: Update teacher verification status
      const updatedTeacher = await Teacher.findByIdAndUpdate(
        teacher_id,
        {
          is_verified: is_verified,
          verification_completed: true
        },
        { new: true }
      );

      // NON-BLOCKING 
      emailService.sendTeacherProfileVerifiedByAdminEmail(teacher.email, teacher.name)
        .then(result => console.log("Email sent for teacher profile verified by admin:", result))
        .catch(error => console.error("Error sending verification email:", error));

      // console.log("Teacher verification updated:", updatedTeacher);
      return res.json({
        message: "Teacher verification status updated successfully",
        teacher: { ...updatedTeacher._doc }
      });
    } else {
      // Reject: Delete the teacher account
      // NON-BLOCKING 
      emailService.sendTeacherProfileRejectedByAdminEmail(teacher.email, teacher.name)
        .then(result => console.log("Email sent for teacher profile rejected by admin:", result))
        .catch(error => console.error("Error sending rejection email:", error));

      // Delete the teacher account
      await Teacher.findByIdAndDelete(teacher_id);

      return res.json({ message: "Teacher account has been deleted successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update teacher verification" });
  }
};

// Teacher unverfication logic
exports.unverifyTeacherIfPossible = async (req, res) => {
  const { teacher_id } = req.params;

  try {
    const teacher = await Teacher.findById(teacher_id).select('students');
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const studentIds = Array.isArray(teacher.students) ? teacher.students : [];

    // 1️⃣ Block if any student has allotted resource
    if (studentIds.length > 0) {
      const allottedRequest = await ResourceRequest.findOne({
        studentId: { $in: studentIds },
        is_verified: true
      }).select('_id studentId');

      if (allottedRequest) {
        return res.status(400).json({
          error: "Unverify blocked: one or more students have allotted resources",
          studentId: allottedRequest.studentId
        });
      }
    }

    // 2️⃣ Delete ALL resource requests of students
    if (studentIds.length > 0) {
      await ResourceRequest.deleteMany({
        studentId: { $in: studentIds }
      });
    }

    // 3️⃣ Unverify teacher
    await Teacher.findByIdAndUpdate(
      teacher_id,
      {
        is_verified: false,
        verification_completed: false
      }
    );

    // 4️⃣ Unverify all students
    if (studentIds.length > 0) {
      await Student.updateMany(
        { _id: { $in: studentIds } },
        {
          $set: {
            teacher_verified: false,
            teacher_action: false,
            admin_verified: false,
            admin_action: false,
            is_verified: false
          }
        }
      );
    }

    return res.json({
      success: true,
      message: "Teacher, students, and their resource requests have been reset successfully"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to unverify teacher" });
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
        { teacher_action: true, teacher_verified: true, admin_action: false }
      ]
    }).populate('teacher', 'name').sort({ createdAt: -1 });

    return res.json({ students: pendingStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch pending students" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('teacher', 'name').sort({ createdAt: -1 });
    return res.json({ students });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
};

exports.getRejectedTeachers = async (req, res) => {
  try {
    // Get teachers that have been rejected (verification_completed = true, is_verified = false)
    const rejectedTeachers = await Teacher.find({
      verification_completed: true,
      is_verified: false
    }).sort({ createdAt: -1 });
    return res.json({ teachers: rejectedTeachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch rejected teachers" });
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
        { teacher_action: true, teacher_verified: true, admin_action: true, admin_verified: false }
      ]
    }).populate('teacher', 'name').sort({ createdAt: -1 });

    return res.json({ students: rejectedStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch rejected students" });
  }
};

exports.getAllResourceRequests = async (req, res) => {
  const role = req.session.user.role;
  const uid = req.session.user.id;
  // console.log("Admin requested all resource requests", uid);

  if (role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }

  try {
    // Find all resource requests from all students
    const resourceRequests = await ResourceRequest.find({})
      .populate({
        path: 'studentId',
        select: 'name rollNo email branch teacher',
        populate: {
          path: 'teacher',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 }); // Most recent first

    // console.log(`Found ${resourceRequests.length} total resource requests for admin`);

    // Format the data to include teacher info in the response
    const formattedRequests = resourceRequests.map(request => ({
      ...request._doc,
      studentInfo: {
        _id: request.studentId._id,
        name: request.studentId.name,
        rollNo: request.studentId.rollNo,
        email: request.studentId.email,
        branch: request.studentId.branch
      },
      teacherInfo: {
        _id: request.studentId.teacher._id,
        name: request.studentId.teacher.name
      }
    }));

    return res.json({
      success: true,
      count: formattedRequests.length,
      requests: formattedRequests
    });
  } catch (err) {
    console.error("Error fetching all resource requests:", err);
    return res.status(500).json({ error: "Failed to fetch resource requests" });
  }
};

// Get admin username, name, and email
exports.getAdminDetails = async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(401).json({ error: "Not authenticated as admin" });
  }
  try {
    const admin = await Admin.findById(req.session.user.id).select("username name email");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    return res.json(admin);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch admin details" });
  }
};

// Change admin password
exports.ChangeAdminPassword = async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(401).json({ error: "Not authenticated as admin" });
  }
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const admin = await Admin.findByIdAndUpdate(
      req.session.user.id,
      { password: hashedPassword },
      { new: true }
    ).select("username name email");
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update password." });
  }
};

// Update admin username and/or email
exports.UpdateAdminProfile = async (req, res) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(401).json({ error: "Not authenticated as admin" });
  }

  const { newEmail, newUsername } = req.body;

  if (!newEmail && !newUsername) {
    return res.status(400).json({ error: "Provide newEmail and/or newUsername to update." });
  }

  // Validation
  if (newEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (newUsername && String(newUsername).trim().length === 0) {
    return res.status(400).json({ error: "Invalid username." });
  }

  try {
    const admin = await Admin.findById(req.session.user.id).select("username email");
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const changes = {};

    // Check email uniqueness and change
    if (newEmail && admin.email !== newEmail) {
      const exists = await Admin.findOne({ email: newEmail });
      if (exists) return res.status(400).json({ error: "Email already in use." });
      changes.email = newEmail;
      admin.email = newEmail;
    }

    // Check username uniqueness and change
    if (newUsername && admin.username !== newUsername) {
      const existsU = await Admin.findOne({ username: newUsername });
      if (existsU) return res.status(400).json({ error: "Username already in use." });
      changes.username = newUsername;
      admin.username = newUsername;
    }

    if (Object.keys(changes).length === 0) {
      return res.status(400).json({ error: "No changes detected or values are same as current." });
    }

    await admin.save();

    // Update session user fields so frontend sees new values without re-login
    if (req.session.user) {
      if (changes.username) req.session.user.username = changes.username;
      if (changes.email) req.session.user.email = changes.email;
    }

    return res.json({ success: true, message: "Admin identity updated.", changes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update admin identity." });
  }
};

// Backwards compatible aliases: support both older and newer names
exports.ChangeAdminEmail = exports.UpdateAdminProfile;
exports.UpdateAdminIdentity = exports.UpdateAdminProfile;

exports.getMachines = async (req, res) => {
  try {
    // populate nested assignedStudent.studentId with student's name and rollNo
    const machines = await Machine.find({})
      .populate({ path: 'assignedStudent.studentId', select: 'name rollNo' })
      .lean();

    // normalize assignedStudent to include rollNumber and name for frontend
    const normalized = machines.map(m => {
      const copy = { ...m };
      if (copy.assignedStudent && copy.assignedStudent.studentId) {
        const s = copy.assignedStudent.studentId;
        copy.assignedStudent = {
          studentId: s._id,
          rollNumber: s.rollNo || null,
          name: s.name || null
        };
      } else {
        copy.assignedStudent = null;
      }
      return copy;
    });

    return res.json({ ok: true, machines: normalized });
  } catch (err) {
    console.error('Failed to fetch machines', err);
    return res.status(500).json({ error: 'Failed to fetch machines' });
  }
};

// Create a new machine
exports.createMachine = async (req, res) => {
  try {
    const { MIGID, gpuRam } = req.body;
    if (!MIGID || MIGID.trim() === '') return res.status(400).json({ error: 'MIGID is required' });
    const gpu = (gpuRam === undefined || gpuRam === null || gpuRam === '') ? null : Number(gpuRam);
    if (gpu === null || Number.isNaN(gpu) || gpu < 0) return res.status(400).json({ error: 'gpuRam must be a non-negative number' });

    const machine = new Machine({ MIGID: MIGID.trim(), gpuRam: gpu, assignedStudent: null });
    await machine.save();
    return res.status(201).json({ ok: true, machine });
  } catch (err) {
    console.error('Failed to create machine', err);
    if (err.code === 11000) return res.status(409).json({ error: 'MIGID already exists' });
    return res.status(500).json({ error: 'Failed to create machine' });
  }
};

// Helper function to delete resource request and clean up references
async function deleteResourceRequestAndCleanup(resourceRequestId, studentId) {
  if (!resourceRequestId) return;

  // Remove reference from student's resourceRequests array
  if (studentId) {
    await Student.findByIdAndUpdate(studentId, { $pull: { resourceRequests: resourceRequestId } });
  }

  // Delete the resource request by ObjectId
  await ResourceRequest.findByIdAndDelete(resourceRequestId);
}

// Update a machine (MIGID, gpuRam, assignedStudent)
// When unassigning, also deletes the associated resource request
exports.updateMachine = async (req, res) => {
  const { id } = req.params;
  const { MIGID, gpuRam, assignedStudent } = req.body;
  try {
    const update = {};
    if (MIGID !== undefined) update.MIGID = MIGID;
    if (gpuRam !== undefined) update.gpuRam = gpuRam;
    if (assignedStudent !== undefined && assignedStudent === null) {
      // Get the current machine to find resourceRequestId
      const currentMachine = await Machine.findById(id);
      if (currentMachine && currentMachine.assignedStudent && currentMachine.assignedStudent.resourceRequestId) {
        const resourceRequestId = currentMachine.assignedStudent.resourceRequestId;
        const studentId = currentMachine.assignedStudent.studentId;
        
        // Delete the resource request and clean up references
        await deleteResourceRequestAndCleanup(resourceRequestId, studentId);
      }

      // Clear both studentId and resourceRequestId when unassigning
      update.assignedStudent = { studentId: null, resourceRequestId: null };
      update.isAssigned = false;
    }
    const machine = await Machine.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!machine) return res.status(404).json({ error: 'Machine not found' });
    return res.json({ ok: true, machine });
  } catch (err) {
    console.error('Failed to update machine', err);
    return res.status(500).json({ error: 'Failed to update machine' });
  }
};

// Delete a machine
exports.deleteMachine = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Machine.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Machine not found' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete machine', err);
    return res.status(500).json({ error: 'Failed to delete machine' });
  }
};
