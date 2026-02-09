
const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const ResourceRequest = require("../database/resourceRequestModel");
const Machine = require('../database/machineModel');
const path = require("path");
const publicPath = path.join(__dirname, "../../../public");
const emailService = require("../utils/email/emails.service.js");

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
  // console.log("requested Student data", stu_id);

  try {
    const student = await Student.findOne({ _id: stu_id })
      .populate('teacher', 'name')
      .populate('resourceRequests');
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    // console.log(student);
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

  // console.log(`${userRole} updating student verification`, studentId, "to", is_verified);

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    let updateData = {};

    if (userRole === "teacher") {
      // Teacher verification logic
      if (is_verified) {
        // Teacher approves
        updateData = {
          teacher_verified: is_verified,
          teacher_action: true
        };
      } else {
        // Teacher rejects → delete the student account and all related resources
        
        // Get teacher name for rejection email
        const teacher = await Teacher.findById(req.session.user.id);
        const teacherName = teacher ? teacher.name : 'your teacher';
        
        // Send rejection email before deleting
        emailService.sendStudentProfileRejectedByTeacherEmail(student.email, student.name, teacherName)
          .then(result => console.log("Email sent for student profile rejected by teacher:", result))
          .catch(error => console.error("Error sending rejection email:", error));
        
        // Delete the student (cascade delete will handle resource requests)
        await Student.findByIdAndDelete(studentId);
        
        return res.json({ message: "Student account and associated resources have been deleted successfully" });
      }
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
        // Admin rejects → delete the student account and all related resources
        
        // Send rejection email before deleting
        emailService.sendStudentProfileRejectedByAdminEmail(student.email, student.name)
          .then(result => console.log("Email sent for student profile rejected by admin:", result))
          .catch(error => console.error("Error sending rejection email:", error));
        
        // Notify teacher about admin's rejection
        Teacher.findById(student.teacher)
          .then(teacher => {
            if (teacher) {
              emailService.sendTeacherStudentRejectedByAdminEmail(teacher.email, teacher.name, student.name)
                .then(result => console.log("Teacher notification email sent:", result))
                .catch(error => console.error("Error sending teacher notification:", error));
            }
          })
          .catch(error => console.error("Error finding teacher:", error));
        
        // Delete the student (cascade delete will handle resource requests)
        await Student.findByIdAndDelete(studentId);
        
        return res.json({ message: "Student account and associated resources have been deleted successfully" });
      }
    } else {
      return res.status(403).json({ error: "Unauthorized to update student verification" });
    }


    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true }
    );

    // Send email notification after successful update (in background)
    if (updatedStudent) {
      
      // Send emails asynchronously without waiting
      if (userRole === "teacher") {
        if (is_verified) {
          // Get teacher details for emails
          const teacher = await Teacher.findById(req.session.user.id);
          const teacherName = teacher ? teacher.name : 'Teacher';
          
          emailService.sendStudentProfileVerifiedByTeacherEmail(updatedStudent.email, updatedStudent.name, teacherName)
            .then(result => console.log("Email sent for student profile verified by teacher:", result))
            .catch(error => console.error("Error sending verification email:", error));
          
          // Notify admins that student verification is pending
          emailService.sendAdminStudentVerificationPendingEmail(
            updatedStudent.name,
            updatedStudent.email,
            updatedStudent.rollNo,
            teacherName
          )
            .then(result => console.log("Admin notification sent:", result))
            .catch(error => console.error("Error sending admin notification:", error));
        }
      } else if (userRole === "admin") {
        if (is_verified) {
          emailService.sendStudentProfileVerifiedByAdminEmail(updatedStudent.email, updatedStudent.name)
            .then(result => console.log("Email sent for student profile verified by admin:", result))
            .catch(error => console.error("Error sending verification email:", error));
          
          // Notify teacher about admin's verification
          Teacher.findById(updatedStudent.teacher)
            .then(teacher => {
              if (teacher) {
                emailService.sendTeacherStudentVerifiedByAdminEmail(teacher.email, teacher.name, updatedStudent.name)
                  .then(result => console.log("Teacher notification email sent:", result))
                  .catch(error => console.error("Error sending teacher notification:", error));
              }
            })
            .catch(error => console.error("Error finding teacher:", error));
        }
      }
    }

    // console.log(`Student verification updated by ${userRole}:`, updatedStudent);
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
  // console.log("requested Teacher data", teacher_id);

  try {
    const teacher = await Teacher.findOne({ _id: teacher_id });
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    // console.log(teacher);
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

  // console.log(`${userRole} ${userId} updating resource request verification`, request_id, "to", is_verified);

  // Validate request ID format
  if (!request_id || !request_id.match(/^[0-9a-fA-F]{24}$/)) {
    // console.log("Invalid request ID format:", request_id);
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
        // For approvals, VM credentials must include password/ip/migId
        if (!vmCredentials || !vmCredentials.password || !vmCredentials.ip || !vmCredentials.migId) {
          return res.status(400).json({ error: "Password, IP, and MIG ID are required for VM credentials" });
        }

        // const username = vmCredentials.username.trim();
        const password = vmCredentials.password.trim();
        const ip = vmCredentials.ip.trim();
        const migId = vmCredentials.migId.trim();
        // if (username.length < 3) {
        //   return res.status(400).json({ error: "Username must be at least 3 characters long" });
        // }
        if (password.length < 6) {
          return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }
        // Optionally add IP/MIG ID format validation here
        if (!ip) {
          return res.status(400).json({ error: "IP address is required" });
        }
        if (!migId) {
          return res.status(400).json({ error: "MIG ID is required" });
        }

        // Find the machine by MIGID to get its ObjectId
        const machine = await Machine.findOne({ MIGID: migId });
        if (!machine) {
          return res.status(404).json({ error: `Machine with MIG ID '${migId}' not found` });
        }

        // Admin approves → set everything true and add VM credentials
        updateData = {
          teacher_verified: true,
          teacher_action: true,
          admin_verified: true,
          admin_action: true,
          is_verified: true,
          machineId: machine._id,
          vmCredentials: {
            // username,
            password,
            ip,
            migId
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

    // console.log(`Resource request verification updated by ${userRole}:`, updatedRequest);

    // Only send email if update was successful (in background)
    if (updatedRequest) {
      // If admin approved and machineId is present, assign the student to the machine
      if (userRole === "admin" && updatedRequest.is_verified && updatedRequest.machineId) {
        try {
          // Update machine to assign student and resource request
          const machine = await Machine.findByIdAndUpdate(
            updatedRequest.machineId,
            { $set: { 
              assignedStudent: { 
                studentId: updatedRequest.studentId,
                resourceRequestId: updatedRequest._id
              }, 
              isAssigned: true 
            } },
            { new: true }
          );
          if (machine) {
            // console.log(`Assigned student ${updatedRequest.studentId} to machine ${machine.MIGID}`);
          } else {
            console.warn(`Machine with ID ${updatedRequest.machineId} not found; could not assign student ${updatedRequest.studentId}`);
          }
        } catch (machineErr) {
          console.error('Error assigning student to machine:', machineErr);
          // Do not fail the request update if machine update fails
        }
      }

      const student = await Student.findById(updatedRequest.studentId);
      
      // Send emails asynchronously without waiting
      if (userRole === "teacher") {
        const teacher = await require('../database/teacherModel').findById(userId);
        if (is_verified) {
          // Approved by teacher
          emailService.sendResourceRequestVerifiedByTeacherEmail(student.email, student.name, updatedRequest.title, teacher.name)
            .then(result => console.log("Teacher resource request verification email sent:", result))
            .catch(error => console.error("Error sending teacher verification email:", error));
          
          // Notify admin that resource request is pending
          emailService.sendAdminResourceRequestPendingEmail(
            student.name,
            student.email,
            updatedRequest.title,
            teacher.name,
            updatedRequest.gpuRam
          )
            .then(result => console.log("Admin notification sent:", result))
            .catch(error => console.error("Error sending admin notification:", error));
        } else {
          // Rejected by teacher
          emailService.sendResourceRequestRejectedByTeacherEmail(student.email, student.name, updatedRequest.title, teacher.name)
            .then(result => console.log("Teacher resource request rejection email sent:", result))
            .catch(error => console.error("Error sending teacher rejection email:", error));
        }
      } else if (userRole === "admin") {
        if (is_verified) {
          // Approved by admin
          emailService.sendResourceRequestVerifiedByAdminEmail(student.email, student.name, updatedRequest.title, updatedRequest.vmCredentials, updatedRequest.username)
            .then(result => console.log("Admin resource request verification email sent:", result))
            .catch(error => console.error("Error sending admin verification email:", error));
          
          // Notify teacher about admin's approval
          Teacher.findById(student.teacher)
            .then(teacher => {
              if (teacher) {
                emailService.sendTeacherResourceRequestVerifiedByAdminEmail(teacher.email, teacher.name, student.name, updatedRequest.title)
                  .then(result => console.log("Teacher notification email sent:", result))
                  .catch(error => console.error("Error sending teacher notification:", error));
              }
            })
            .catch(error => console.error("Error finding teacher:", error));
        } else {
          // Rejected by admin
          emailService.sendResourceRequestRejectedByAdminEmail(student.email, student.name, updatedRequest.title)
            .then(result => console.log("Admin resource request rejection email sent:", result))
            .catch(error => console.error("Error sending admin rejection email:", error));
          
          // Notify teacher about admin's rejection
          Teacher.findById(student.teacher)
            .then(teacher => {
              if (teacher) {
                emailService.sendTeacherResourceRequestRejectedByAdminEmail(teacher.email, teacher.name, student.name, updatedRequest.title)
                  .then(result => console.log("Teacher notification email sent:", result))
                  .catch(error => console.error("Error sending teacher notification:", error));
              }
            })
            .catch(error => console.error("Error finding teacher:", error));
        }
      }
    }

    return res.json({
      message: "Resource request verification status updated successfully",
      request: updatedRequest
    });
  } catch (err) {
    console.error("Error updating resource request verification:", err);
    // Return the real error message to help the frontend diagnose (trim long stack if necessary)
    const message = err && err.message ? err.message : 'Failed to update resource request verification';
    return res.status(500).json({ error: message });
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
  const allowedFields = ["title", "purpose", "expiryDate", "cpuCores", "cpuRam", "gpuRam", "username"];
  const updates = {};
  for (const key of allowedFields) {
    if (updateFields[key] !== undefined) {
      updates[key] = updateFields[key];
    }
  }
  if (updates.username !== undefined && !/^[A-Za-z0-9_-]+$/.test(updates.username)) {
    return res.status(400).json({ error: "Username can only contain letters, numbers, hyphens (-), and underscores (_), with no spaces or special characters" });
  }
  updates.updatedAt = new Date();
  updates.isEdited = true;
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

// Delete student and corresponding resource requests (for admin/teacher)
exports.deleteStudentAndResources = async (req, res) => {
  const { studentId } = req.params;
  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    // Cascade delete handled by studentModel pre middleware
    const result = await Student.findOneAndDelete({ _id: studentId });
    res.json({ message: "Student and corresponding resource requests deleted successfully.", student: result });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Error deleting student.", error: error.message || error });
  }
};