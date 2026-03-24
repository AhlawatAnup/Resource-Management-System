const mongoose = require("mongoose");
const Teacher = require("../database/teacherModel");
const Student = require("../database/studentModel");
const Admin = require("../database/adminModel");
const Machine = require('../database/machineModel');
const MachineAllotment = require("../database/machineAllotmentModel.js.js");
const ResourceRequest = require("../database/resourceRequestModel");
const emailService = require("../utils/email/emails.service.js");
const {notifyTeacher} = require("../utils/web-push-notifications/notifyTeacher.js")
const { notifyStudent } = require('../utils/web-push-notifications/notifyStudent.js');
const { validateMachineInput } = require('../utils/common.utils.js');
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

      emailService.sendTeacherProfileVerifiedByAdminEmail(teacher.email, teacher.name)
        .then(result => console.log("Email sent for teacher profile verified by admin:", result))
        .catch(error => console.error("Error sending verification email:", error));

      notifyTeacher(teacher_id, {
        title: 'Profile verified by Admin',
        body: `Congratulations! Your profile has been verified by the admin`
      }).catch((pushErr) => {
        console.error('[WebPush] Error in teacher notification block:', pushErr);
      });

      // console.log("Teacher verification updated:", updatedTeacher);
      return res.json({
        message: "Teacher verification status updated successfully",
        teacher: { ...updatedTeacher._doc }
      });
    } else {
      // Reject: Delete the teacher account 
      emailService.sendTeacherProfileRejectedByAdminEmail(teacher.email, teacher.name)
        .then(result => console.log("Email sent for teacher profile rejected by admin:", result))
        .catch(error => console.error("Error sending rejection email:", error));

      notifyTeacher(teacher_id, {
        title: 'Profile rejected by Admin',
        body: `Your profile was rejected by admin.`
      }).catch((pushErr) => {
        console.error('[WebPush] Error in teacher notification block:', pushErr);
      });
      
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
      const allottedRequests = await ResourceRequest.find({
        studentId: { $in: studentIds },
        is_verified: true
      }).populate('studentId', 'rollNo name').select('studentId');

      if (allottedRequests && allottedRequests.length > 0) {
        // Extract roll numbers of students with allocated resources
        const studentsWithResources = allottedRequests
          .filter(req => req.studentId) // Filter out any null references
          .map(req => ({
            rollNo: req.studentId.rollNo,
            name: req.studentId.name
          }));

        return res.status(400).json({
          error: "Some students have allocated resources",
          studentsWithResources: studentsWithResources
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
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacher_id,
      {
        is_verified: false,
        verification_completed: false
      },
      { new: true }
    );

    // Send email to teacher about unverification
    if (updatedTeacher) {
      emailService.sendTeacherProfileUnverifiedByAdminEmail(updatedTeacher.email, updatedTeacher.name)
        .then(result => console.log("Teacher unverification email sent:", result))
        .catch(error => console.error("Error sending teacher unverification email:", error));
    }

      notifyTeacher(teacher_id, {
        title: 'Profile Unverified by admin',
        body: `Your profile has been unverified by the admin.`
      }).catch((pushErr) => {
        console.error('[WebPush] Error in teacher notification block:', pushErr);
      });

    // 4️⃣ Unverify all students and send them emails
    if (studentIds.length > 0) {
      // Fetch student details before updating
      const students = await Student.find({ _id: { $in: studentIds } }).select('email name');
      
      // Update all students
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
      
      // Send emails to all affected students
      students.forEach(student => {
        emailService.sendStudentUnverifiedDueToTeacherUnverificationEmail(
          student.email,
          student.name,
          updatedTeacher?.name || teacher.name
        )
        .then(result => console.log(`Student unverification email sent to ${student.name}:`, result))
        .catch(error => console.error(`Error sending email to ${student.name}:`, error));

        notifyStudent(student._id, {
          title: 'Student Profile unverified by Admin',
          body: `Your profile has unverified due to unverification of your teacher`
        }).catch(err => {
          console.error("Error sending student web-push notification:", err);
        });
      });
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

exports.unverifyStudentIfPossible = async (req, res) => {
  const { student_id } = req.params;

  try {
    const student = await Student.findById(student_id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // 1️⃣ Block if student has any allotted resource
    const allottedRequests = await ResourceRequest.find({
      studentId: student_id,
      is_verified: true
    });

    if (allottedRequests && allottedRequests.length > 0) {
      return res.status(400).json({
        error: "Student has allocated resources. Cannot unverify."
      });
    }

    // 2️⃣ Delete ALL resource requests of this student
    await ResourceRequest.deleteMany({
      studentId: student_id
    });

    // 3️⃣ Unverify student and clear resourceRequests array
    const updatedStudent = await Student.findByIdAndUpdate(
      student_id,
      {
        $set: {
          teacher_verified: false,
          teacher_action: false,
          admin_verified: false,
          admin_action: false,
          is_verified: false,
          resourceRequests: []
        }
      },
      { new: true }
    );

    // Send email to student about unverification
    if (updatedStudent) {
      emailService.sendStudentProfileUnverifiedByAdminEmail(updatedStudent.email, updatedStudent.name)
        .then(result => console.log("Student unverification email sent:", result))
        .catch(error => console.error("Error sending student unverification email:", error));
        
      notifyStudent(student_id, {
        title: 'Student Profile unverified by Admin',
        body: `Your profile has been unverified by admin.`
      }).catch(err => {
        console.error("Error sending student web-push notification:", err);
      });
    }
        
    return res.status(200).json({
      message: "Student unverified successfully"
    });

  } catch (error) {
    console.error("Error unverifying student:", error);
    res.status(500).json({
      error: "Failed to unverify student"
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
    const formattedRequests = resourceRequests
      .filter(request => request.studentId)
      .map(request => {
        const teacher = request.studentId.teacher || null;
        return {
          ...request._doc,
          studentInfo: {
            _id: request.studentId._id,
            name: request.studentId.name,
            rollNo: request.studentId.rollNo,
            email: request.studentId.email,
            branch: request.studentId.branch
          },
          teacherInfo: teacher
            ? { _id: teacher._id, name: teacher.name }
            : { _id: null, name: "Unknown" }
        };
      });

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
    // Store original email for security alert notification
    const oldEmail = admin.email;

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

    // Send email notification if username was changed
    if (changes.username) {
      const changedAtTime = new Date().toLocaleString();
      emailService.sendAdminUsernameChangeEmail(changes.username, changedAtTime)
        .then(result => console.log("Username change notification sent to admin:", result))
        .catch(error => console.error("Error sending username change email:", error));
    }

    // Send email notifications if email was changed
    if (changes.email) {
      const changedAtTime = new Date().toLocaleString();
      
      // Send security alert to old email
      emailService.sendAdminEmailChangeSecurityAlertEmail(oldEmail, changes.email)
        .then(result => console.log("Security alert sent to old email:", result))
        .catch(error => console.error("Error sending security alert email:", error));
      
      // Send confirmation to new email
      emailService.sendAdminEmailChangeConfirmationEmail(changes.email, changedAtTime)
        .then(result => console.log("Confirmation sent to new email:", result))
        .catch(error => console.error("Error sending confirmation email:", error));
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
    const machines = await Machine.find({}).lean();

    return res.json({
      ok: true,
      machines
    });

  } catch (err) {
    console.error('Failed to fetch machines', err);
    return res.status(500).json({
      error: 'Failed to fetch machines'
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
      machine
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
    throw new Error("ResourceRequestId is required");
  }

  try {
    if (studentId) {
      await Student.findByIdAndUpdate(
        studentId,
        { $pull: { resourceRequests: resourceRequestId } }
      );
    }

    const deleted = await ResourceRequest.findByIdAndDelete(resourceRequestId);

    if (!deleted) {
      throw new Error("Resource request not found");
    }

  } catch (error) {
    console.error("Cleanup failed:", error);
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
        error: 'isAvailable must be a boolean (true or false)'
      });
    }

    const machine = await Machine.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    ).lean();

    if (!machine) {
      return res.status(404).json({ error: 'Machine not found' });
    }

    return res.json({
      ok: true,
      message: `Machine marked as ${isAvailable ? 'available' : 'unavailable'}`,
      machine
    });

  } catch (err) {
    console.error('Failed to update machine', err);
    return res.status(500).json({
      error: 'Failed to update machine'
    });
  }
};

// Delete a machine
exports.deleteMachine = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid machine ID" });
  }

  try {
    // Check if machine exists
    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ error: "Machine not found" });

    // Check for active or future allotments first
    const now = new Date();
    const activeAllotment = await MachineAllotment.findOne({
      machineId: id,
      $or: [
        { status: "active" },
        { endTime: { $gte: now } } // future allotments
      ]
    });

    if (activeAllotment) {
      return res.status(400).json({
        error: "Cannot delete machine with active or future allotments"
      });
    }

    // Check if machine is disabled
    if (machine.isAvailable) {
      return res.status(400).json({
        error: "Machine must be disabled before deletion"
      });
    }

    // Safe to delete
    await Machine.findByIdAndDelete(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("Failed to delete machine", err);
    return res.status(500).json({ error: "Failed to delete machine" });
  }
};