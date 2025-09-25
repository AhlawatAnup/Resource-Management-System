const Teacher = require("../database/teacherModel");
const Student = require("../database/studentModel");
const Admin = require("../database/adminModel");
const ResourceRequest = require("../database/resourceRequestModel");

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
    const pendingTeachers = await Teacher.find({ verification_completed: false });
    return res.json({ teachers: pendingTeachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch pending teachers" });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('students', 'name rollNo');
    return res.json({ teachers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

exports.updateTeacherVerification = async (req, res) => {
  const { teacher_id } = req.params;
  const { is_verified } = req.body;

  console.log("Updating teacher verification", teacher_id, "to", is_verified);

  try {
    const teacher = await Teacher.findByIdAndUpdate(
      teacher_id,
      {
        is_verified: is_verified,
        verification_completed: true // Mark as completed when admin takes action
      },
      { new: true } // Return the updated document
    );

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    console.log("Teacher verification updated:", teacher);
    return res.json({
      message: "Teacher verification status updated successfully",
      teacher: { ...teacher._doc }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update teacher verification" });
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
    }).populate('teacher', 'name');

    return res.json({ students: pendingStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch pending students" });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate('teacher', 'name');
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
    });
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
    }).populate('teacher', 'name');

    return res.json({ students: rejectedStudents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch rejected students" });
  }
};

exports.getAllResourceRequests = async (req, res) => {
  const role = req.session.user.role;
  const uid = req.session.user.id;
  console.log("Admin requested all resource requests", uid);

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

    console.log(`Found ${resourceRequests.length} total resource requests for admin`);

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