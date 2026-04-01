
const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const ResourceRequest = require("../database/resourceRequestModel");
const Machine = require('../database/machineModel');
const MachineAllotment = require("../database/machineAllotmentModel.js");
const path = require("path");
const publicPath = path.join(__dirname, "../../../public");
const { notifyAdmin } = require('../utils/web-push-notifications/notifyAdmin.js');
const { notifyTeacher } = require('../utils/web-push-notifications/notifyTeacher.js');
const { notifyStudent } = require('../utils/web-push-notifications/notifyStudent.js');
const { fetchMachineById, calculateAllotmentWindow, isValidDuration, deleteStudent } = require("../utils/common.utils.js");
const emailHandler = require('../utils/email/emailHandler.js');


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
  const { student_id } = req.params;
  const { is_verified } = req.body;
  const userRole = req.session.user?.role;
  const userId = req.session.user?.id;

  try {
    const student = await Student.findById(student_id)
      .populate({ path: "teacher", select: "name is_verified" })
      .lean();

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (userRole === "teacher") {
      const teacher = await Teacher.findById(userId).lean();
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      if (is_verified) {
        const updatedStudent = await Student.findByIdAndUpdate(
          student_id,
          {
            teacher_verified: true,
            teacher_action: true
          },
          { new: true }
        );

        emailHandler.handleSendAdminStudentVerificationPendingEmail(student, teacher);

        notifyAdmin({
          title: 'New Student Registered',
          body: 'Requires admin verification.'
        }).catch(console.error);

        return res.json({
          message: "Student approved by teacher",
          student: updatedStudent
        });
      } else {
        await deleteStudent(student_id);

        emailHandler.handleSendStudentProfileRejectedByTeacherEmail(student, teacher);

        return res.json({
          message: "Student rejected and deleted successfully"
        });
      }
    }
    else if (userRole === "admin") {

      if (is_verified) {
          const teacher = student.teacher;
          if (!teacher) {
            return res.status(404).json({ error: "Teacher for this studnet is not found" });
          }

          if (!teacher.is_verified) {
            return res.status(400).json({ error: `Cannot verify student since its teacher: ${student.teacher.name} is not verified` });
          }
        const updatedStudent = await Student.findByIdAndUpdate(
          student_id,
          {
            teacher_verified: true,
            teacher_action: true,
            admin_verified: true,
            admin_action: true,
            is_verified: true
          },
          { new: true }
        );

        emailHandler.handleSendStudentProfileVerifiedByAdminEmail(student);

        notifyStudent(student_id, {
          title: 'Student Profile Verified by Admin',
          body: 'Your profile has been verified by admin.'
        }).catch(console.error);

        return res.json({
          message: "Student fully verified",
          student: updatedStudent
        });

      } else {

        await deleteStudent(student_id);

        emailHandler.handleSendStudentProfileRejectedByAdminEmail(student);

        return res.json({
          message: "Student deleted by admin"
        });
      }
    }

    return res.status(403).json({
      error: "Unauthorized to update student verification"
    });

  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({
      error: "Failed to update student verification"
    });
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
      const existingRequest = await ResourceRequest.findById(request_id)
      .populate("studentId");

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
        
        emailHandler.handleSendResourceRequestVerifiedEmail({
          student: existingRequest.studentId,
          request: existingRequest,
          machine,
          startTime,
          endTime,
          duration
        });
      }
      
      if (!is_verified) {
        emailHandler.handleSendResourceRequestRejectedEmail(
          existingRequest.studentId.email, 
          existingRequest.studentId.name, 
          existingRequest.title
        )
      } 
      return res.status(200).json({
        success: true,
        message: "Resource request verification updated successfully",
      });

    } catch (err) {
      console.error("Error updating resource request verification:", err);
      return res.status(500).json({
        error: "Failed to update resource request verification"
      });
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