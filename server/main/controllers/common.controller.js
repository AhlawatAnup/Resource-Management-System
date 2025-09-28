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

    // Send email notification after successful update
    if (updatedStudent) {
      const emailService = require("../utils/emailService.js");
      let emailResult = null;
      if (userRole === "teacher") {
        if (is_verified) {
          emailResult = await emailService.sendStudentProfileVerifiedByTeacherEmail(updatedStudent.email, updatedStudent.name, req.session.user.name);
          console.log("Email sent for student profile verified by teacher:", emailResult);
        } else {
          emailResult = await emailService.sendStudentProfileRejectedByTeacherEmail(updatedStudent.email, updatedStudent.name, req.session.user.name);
          console.log("Email sent for student profile rejected by teacher:", emailResult);
        }
      } else if (userRole === "admin") {
        if (is_verified) {
          emailResult = await emailService.sendStudentProfileVerifiedByAdminEmail(updatedStudent.email, updatedStudent.name);
          console.log("Email sent for student profile verified by admin:", emailResult);
        } else {
          emailResult = await emailService.sendStudentProfileRejectedByAdminEmail(updatedStudent.email, updatedStudent.name);
          console.log("Email sent for student profile rejected by admin:", emailResult);
        }
      }
    }

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
  const { is_verified, vmCredentials } = req.body;
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
      // Admin verification logic
      if (is_verified) {
        // For approvals, VM credentials are required
        if (!vmCredentials) {
          return res.status(400).json({ error: "VM credentials are required when approving a request" });
        }

        // Validate VM credentials
        if (!vmCredentials.username || !vmCredentials.password) {
          return res.status(400).json({ error: "Both username and password are required for VM credentials" });
        }

        const username = vmCredentials.username.trim();
        const password = vmCredentials.password.trim();

        if (username.length < 3) {
          return res.status(400).json({ error: "Username must be at least 3 characters long" });
        }
        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        // Admin approves → set everything true and add VM credentials
        updateData = {
          teacher_verified: true,
          teacher_action: true,
          admin_verified: true,
          admin_action: true,
          is_verified: true,
          vmCredentials: {
            username: username,
            password: password
          }
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

    // Only send email if update was successful
    if (updatedRequest) {
      const student = await Student.findById(updatedRequest.studentId);
      const emailService = require("../utils/emailService.js");
      let emailResult;
      if (userRole === "teacher") {
        const teacher = await require('../database/teacherModel').findById(userId);
        if (is_verified) {
          // Approved by teacher
          emailResult = await emailService.sendResourceRequestVerifiedByTeacherEmail(student.email, student.name, updatedRequest.title, teacher.name);
        } else {
          // Rejected by teacher
          emailResult = await emailService.sendResourceRequestRejectedByTeacherEmail(student.email, student.name, updatedRequest.title, teacher.name);
        }
        console.log("Teacher resource request email sent:", emailResult);
      } else if (userRole === "admin") {
        if (is_verified) {
          // Approved by admin
          emailResult = await emailService.sendResourceRequestVerifiedByAdminEmail(student.email, student.name, updatedRequest.title, updatedRequest.vmCredentials);
        } else {
          // Rejected by admin
          emailResult = await emailService.sendResourceRequestRejectedByAdminEmail(student.email, student.name, updatedRequest.title);
        }
        console.log("Admin resource request email sent:", emailResult);
      }
    }

    return res.json({
      message: "Resource request verification status updated successfully",
      request: updatedRequest
    });
  } catch (err) {
    console.error("Error updating resource request verification:", err);
    return res.status(500).json({ error: "Failed to update resource request verification" });
  }
};

// Common function for editing a resource request by teacher or admin
exports.editResourceRequest = async (req, res) => {
  const role = req.session.user.role;
  if (role !== "teacher" && role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const requestId = req.params.request_id;
  const updateFields = req.body;
  // Only allow certain fields to be updated
  const allowedFields = ["title", "purpose", "expiryDate", "cpuCores", "cpuRam", "gpuCount", "gpuRam"];
  const updates = {};
  for (const key of allowedFields) {
    if (updateFields[key] !== undefined) {
      updates[key] = updateFields[key];
    }
  }
  updates.updatedAt = new Date();
  try {
    const updatedRequest = await ResourceRequest.findByIdAndUpdate(requestId, updates, { new: true });
    if (!updatedRequest) {
      return res.status(404).json({ error: "Resource request not found" });
    }
    return res.json({ success: true, resourceRequest: updatedRequest });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update resource request", details: err.message });
  }
};