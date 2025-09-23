const Teacher = require("../database/teacherModel");
const Student = require("../database/studentModel");
const Admin = require("../database/adminModel");

exports.admin_dashboard_data = async (req, res) => {
  try {
    // Get counts for dashboard statistics
    const totalTeachers = await Teacher.countDocuments();
    const verifiedTeachers = await Teacher.countDocuments({ is_verified: true });
    const pendingTeachers = await Teacher.countDocuments({ verification_completed: false });
    
    const totalStudents = await Student.countDocuments();
    const verifiedStudents = await Student.countDocuments({ is_verified: true });
    const pendingStudents = await Student.countDocuments({ verification_completed: false });

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