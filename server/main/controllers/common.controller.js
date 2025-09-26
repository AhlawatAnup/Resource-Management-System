const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const path = require("path");
const publicPath = path.join(__dirname, "../../../public");

exports.roleBasedDashboard = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // redirect if not logged in
  }

  const role = req.session.user?.role;
  if (!role) {
    return res.redirect("/"); // fallback if role missing
  }

  // You can customize which HTML to send based on role
  switch (role.toLowerCase()) {
    case "student":
      return res.sendFile(path.join(publicPath, "dashboard/student", "student.dashboard.html"));
    case "teacher":
      return res.sendFile(path.join(publicPath, "dashboard/teacher", "teacher.dashboard.html"));
    case "admin":
      return res.sendFile(path.join(publicPath, "dashboard/admin", "admin.dashboard.html"));
  }
};

exports.getCurrentUserId = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  
  return res.json({ id: req.session.user.id });
};

exports.student_data = async (req, res) => {
  const { stu_id } = req.params;
  console.log("requested Student data", stu_id);

  try {
    const student = await Student.findOne({ _id: stu_id }).populate('teacher', 'name');
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    console.log(student);
    return res.json({ ...student._doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch student" });
  }
};

exports.updateStudentVerification = async (req, res) => {
  const { stu_id, student_id } = req.params; // Support both parameter names
  const { is_verified } = req.body;
  const userRole = req.session.user?.role;
  
  const studentId = stu_id || student_id; // Use whichever parameter is provided
  
  console.log(`${userRole} updating student verification`, studentId, "to", is_verified);

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    let updateData = {};
    
    if (userRole === "teacher") {
      // Teacher verification logic
      updateData = {
        teacher_verified: is_verified,
        teacher_action: true
      };
    } else if (userRole === "admin") {
      // Admin verification logic
      // Check if teacher has approved first
      if (!student.teacher_verified || !student.teacher_action) {
        return res.status(400).json({ error: "Student must be approved by teacher first" });
      }
      
      updateData = {
        admin_verified: is_verified,
        admin_action: true
      };
      
      // If admin approves and teacher already approved, mark as fully verified
      if (is_verified && student.teacher_verified) {
        updateData.is_verified = true;
      }
    } else {
      return res.status(403).json({ error: "Unauthorized to update student verification" });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId, 
      updateData,
      { new: true }
    );
    
    console.log(`Student verification updated by ${userRole}:`, updatedStudent);
    return res.json({ 
      message: "Student verification status updated successfully",
      student: { ...updatedStudent._doc }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update student verification" });
  }
};

exports.teacher_data = async (req, res) => {
  const { teacher_id } = req.params;
  console.log("requested Teacher data", teacher_id);

  try {
    const teacher = await Teacher.findOne({ _id: teacher_id });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    console.log(teacher);
    return res.json({ ...teacher._doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch teacher" });
  }
};
