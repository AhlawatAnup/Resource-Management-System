
const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const ResourceRequest = require("../database/resourceRequestModel");
const Machine = require('../database/machineModel');
const MachineAllotment = require("../database/machineAllotmentModel.js");
const path = require("path");
const publicPath = path.join(__dirname, "../../../public");
const emailService = require("../utils/email/emails.service.js");
const { notifyAdmin } = require('../utils/web-push-notifications/notifyAdmin.js');
const { notifyTeacher } = require('../utils/web-push-notifications/notifyTeacher.js');
const { notifyStudent } = require('../utils/web-push-notifications/notifyStudent.js');
const { fetchMachineById, calculateAllotmentWindow, isValidDuration, deleteStudent } = require("../utils/common.utils.js");

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
        
        notifyStudent(studentId, {
          title: 'Student Profile Rejected by Teacher',
          body: `Your profile has been rejected by your teacher.`
        }).catch(err => {
          console.error("Error sending student web-push notification:", err);
        });

        await deleteStudent(studentId);
        
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
        
        notifyStudent(studentId, {
          title: 'Student Profile Rejected by Admin',
          body: `Your profile has been rejected by admin.`
        }).catch(err => {
          console.error("Error sending student web-push notification:", err);
        });

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

        // Notify teacher about admin's verification (web-push)
          notifyTeacher(student.teacher, {
            title: 'Student Verification Rejected by Admin',
            body: `A student under you has been rejected by the Admin.`
          }).catch((pushErr) => {
            console.error('[WebPush] Error in teacher notification block:', pushErr);
          });
        
        await deleteStudent(studentId);
        
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

    // Send email notification after successful update
    if (updatedStudent) {
      
      // Send emails 
      if (userRole === "teacher") {
        if (is_verified) {
          // Get teacher details for emails
          const teacher = await Teacher.findById(req.session.user.id);
          const teacherName = teacher ? teacher.name : 'Teacher';
          
          emailService.sendStudentProfileVerifiedByTeacherEmail(updatedStudent.email, updatedStudent.name, teacherName)
            .then(result => console.log("Email sent for student profile verified by teacher:", result))
            .catch(error => console.error("Error sending verification email:", error));
          
          notifyStudent(studentId, {
            title: 'Student Profile Verified by Teacher',
            body: `Your profile has been verified by your teacher.`
          }).catch(err => {
            console.error("Error sending student web-push notification:", err);
          });

          // Notify admins that student verification is pending (email)
          emailService.sendAdminStudentVerificationPendingEmail(
            updatedStudent.name,
            updatedStudent.email,
            updatedStudent.rollNo,
            teacherName
          )
            .then(result => console.log("Admin notification sent:", result))
            .catch(error => console.error("Error sending admin notification:", error));

          // Notify admin that student verification is pending (web-push)
          notifyAdmin({
            title: 'New Student Registered',
            body: 'Requires admin verification.'
          }).catch(err => {
            console.error('Error sending admin web push notification:', err);
          });
        }
      } else if (userRole === "admin") {
        if (is_verified) {
          emailService.sendStudentProfileVerifiedByAdminEmail(updatedStudent.email, updatedStudent.name)
            .then(result => console.log("Email sent for student profile verified by admin:", result))
            .catch(error => console.error("Error sending verification email:", error));
          
          notifyStudent(studentId, {
            title: 'Student Profile Verified by Admin',
            body: `Your profile has been verified by admin.`
          }).catch(err => {
            console.error("Error sending student web-push notification:", err);
          });

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

          // Notify teacher about admin's verification (web-push)
          notifyTeacher(student.teacher, {
            title: 'Student Verification approved by Admin',
            body: `A student under you has been verified by the Admin.`
          }).catch((pushErr) => {
            console.error('[WebPush] Error in teacher notification block:', pushErr);
          });
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
  const role = req.session.user?.role;
  const request_id = req.params.request_id || req.body.request_id;
  const { is_verified } = req.body;

  if (!request_id) {
    return res.status(400).json({ error: "request_id is required" });
  }

  if (role !== "teacher" && role !== "admin") {
    return res.status(403).json({ error: "Unauthorized" });
  }
    if (typeof is_verified !== "boolean") {
      return res.status(400).json({ error: "is_verified must be boolean" });
    }

    try {
      const existingRequest = await ResourceRequest.findById(request_id);

      if (!existingRequest) {
        return res.status(404).json({ error: "Resource request not found" });
      }

      const machineId = existingRequest.machineId;

      const durationInput = existingRequest.duration;
      const duration = Number(durationInput);

      if (!machineId) {
        return res.status(400).json({ error: "machineId is required" });
      }

      if (!isValidDuration(duration)) {
        return res.status(400).json({
          error: "Invalid duration. Allowed range is 1 to 15 days."
        });
      }

      const machine = await Machine.findById(machineId).select("_id MIGID");
      if (!machine) {
        return res.status(404).json({ error: "Machine not found" });
      }

      // 🔹 Get latest endTime across ALL allotments (true max)
      const latestEndTimeResult = await MachineAllotment.aggregate([
        {
          $match: {
            machineId: machine._id,
            isDeleted: { $ne: true },   //required for aggreated: otherwise pre middleware will be bypassed
            isActive: true              //required for aggreated: otherwise pre middleware will be bypassed
          }
        },
        {
          $group: {
            _id: null,
            maxEndTime: { $max: "$endTime" }
          }
        }
      ]);

      const lastAllotmentEndTime = latestEndTimeResult.length > 0
        ? latestEndTimeResult[0].maxEndTime
        : null;

      // 🔹 Calculate new window (PURE UTC LOGIC)
      const { startTime, endTime } = calculateAllotmentWindow(
        lastAllotmentEndTime,
        duration
      );

      // 🔹 Update request
      let updateData = {
        is_verified: is_verified,
        updatedAt: new Date()
      };

      if (role === "teacher") {
        updateData.teacher_action = true;
        updateData.teacher_verified = is_verified;
      } else if (role === "admin") {
        updateData.admin_action = true;
        updateData.admin_verified = is_verified;
      }

      const updatedRequest = await ResourceRequest.findByIdAndUpdate(
        request_id,
        updateData,
        { new: true }
      );

      let createdAllotment = null;

      // 🔹 Create allotment if approved
      if (is_verified) {
        createdAllotment = await MachineAllotment.create({
          machineId: machine._id,
          resourceRequestId: updatedRequest._id,
          startTime,
          endTime,
          status: "active"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Resource request verification updated successfully",
        // request: updatedRequest,
        // machine: {
        //   _id: machine._id,
        //   MIGID: machine.MIGID
        // },
        // lastAllotmentEndTime,
        // allotment: createdAllotment
      });

    } catch (err) {
      console.error("Error updating resource request verification:", err);
      return res.status(500).json({
        error: "Failed to update resource request verification"
      });
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

    // Notify admin when teacher edits a student's resource request
    // if (role === "teacher") {
    //   notifyAdmin({
    //     title: 'Teacher edited resource request',
    //     body: 'UI triggering',
    //     // type: 'ADMIN_RESOURCE_REQUEST_UPDATED'
    //   }).catch(err => {
    //     console.error('Error sending admin web push notification:', err);
    //   });
    // }

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

// Utility: Check if a date is in the past (date-only, ignores time)
function isDateInPast(date) {
  const d = new Date(date);
  const now = new Date();
  d.setHours(0,0,0,0);
  now.setHours(0,0,0,0);
  return d < now;
}

exports.getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find({}) //fetches isAvailable:true only due to pre middleware
      .select("_id MIGID gpuRam")
      .lean();

    if (!machines.length) {
      return res.status(404).json({ message: "No available machines found" });
    }
    res.status(200).json(machines);
  } catch (error) {
    console.error("Error fetching machines:", error);
    res.status(500).json({ error: "Failed to fetch machines" });
  }
};

exports.getMachineWiseActiveAllotments = async (req, res) => {
  try {
    const { machineId } = req.params;

    const machine = await fetchMachineById(machineId);
    if (!machine) {
      return res.status(404).json({ message: "Machine not found or invalid ID" });
    }

    const allotments = await MachineAllotment.find({
      machineId,
      isActive: true
    })
      .select("resourceRequestId startTime endTime status")
      .lean();

      console.log(allotments)

    const response = { machine, allotments };
    if (!allotments.length) {
      response.message = "No active allotments found for this machine";
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching machine-wise allotments:", error);
    res.status(500).json({ error: "Failed to fetch allotments" });
  }
};