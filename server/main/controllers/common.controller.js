const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const ResourceRequest = require("../database/resourceRequestModel");
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
    const student = await Student.findOne({ _id: stu_id })
      .populate('teacher', 'name')
      .populate('resourceRequests');
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
      if (is_verified) {
        // Admin approves → set everything true
        updateData = {
          teacher_verified: true,
          teacher_action: true,
          admin_verified: true,
          admin_action: true,
          is_verified: true
        };
      } else {
        // Admin rejects → only update admin side
        updateData = {
          admin_verified: false,
          admin_action: true,
          is_verified: false
        };
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

exports.updateResourceRequestVerification = async (req, res) => {
  const { request_id } = req.params;
  const { is_verified } = req.body;
  const userRole = req.session.user?.role;
  const userId = req.session.user?.id;

  console.log(`${userRole} ${userId} updating resource request verification`, request_id, "to", is_verified);

  // Validate request ID format
  if (!request_id || !request_id.match(/^[0-9a-fA-F]{24}$/)) {
    console.log("Invalid request ID format:", request_id);
    return res.status(400).json({ error: "Invalid request ID format" });
  }

  try {
    const resourceRequest = await ResourceRequest.findById(request_id);
    
    if (!resourceRequest) {
      return res.status(404).json({ error: "Resource request not found" });
    }

    // Role-based authorization and verification logic
    let updateData = {};

    if (userRole === "teacher") {
      // Verify that this resource request belongs to a student under this teacher
      const student = await Student.findById(resourceRequest.studentId);
      if (!student || student.teacher.toString() !== userId) {
        return res.status(403).json({ error: "Access denied. This request does not belong to your students." });
      }

      // Teacher verification logic
      updateData = {
        teacher_verified: is_verified,
        teacher_action: true
      };

    } else if (userRole === "admin") {
      // Admin verification logic (similar to student verification)
      if (is_verified) {
        // Admin approves → set everything true
        updateData = {
          teacher_verified: true,
          teacher_action: true,
          admin_verified: true,
          admin_action: true,
          is_verified: true
        };
      } else {
        // Admin rejects → only update admin side
        updateData = {
          admin_verified: false,
          admin_action: true,
          is_verified: false
        };
      }

    } else {
      return res.status(403).json({ error: "Unauthorized to update resource request verification" });
    }

    const updatedRequest = await ResourceRequest.findByIdAndUpdate(
      request_id,
      updateData,
      { new: true }
    );

    console.log(`Resource request verification updated by ${userRole}:`, updatedRequest);
    
    return res.json({
      message: "Resource request verification status updated successfully",
      request: updatedRequest
    });
  } catch (err) {
    console.error("Error updating resource request verification:", err);
    return res.status(500).json({ error: "Failed to update resource request verification" });
  }
};
