const { sendResourceRequestSubmittedEmail, sendTeacherStudentResourceRequestEmail } = require('../utils/email/emails.service');
const { notifyAdmin } = require('../utils/web-push-notifications/notifyAdmin');
const { notifyTeacher } = require('../utils/web-push-notifications/notifyTeacher');
const Teacher = require('../database/teacherModel');
// Delete a resource request by ID
exports.deleteStudentResourceRequest = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: "Request ID is required" });
    }

    // Find the request
    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Resource request not found" });
    }

    // Only allow the owner to delete
    if (String(request.studentId) !== String(req.session.user.id)) {
      return res.status(403).json({ error: "You can only delete your own requests" });
    }

    // Only allow delete if no action by admin/teacher and is_verified is false
    if (request.teacher_action || request.admin_action || request.is_verified) {
      return res.status(403).json({ error: "Cannot delete: action taken by admin/teacher or request is verified." });
    }

    // Remove from student's resourceRequests array
    await Student.findByIdAndUpdate(request.studentId, { $pull: { resourceRequests: request._id } });

    // Delete the request
    await ResourceRequest.findByIdAndDelete(requestId);

    // Send push notification to admin
    // notifyAdmin({
    //   title: 'resReq deleted by student',
    //   body: 'UI triggering',
    //   // type: 'ADMIN_RESOURCE_REQUEST_UPDATED'
    // }).catch((adminPushErr) => {
    //   console.error('[WebPush] Error in admin notification block:', adminPushErr);
    // });
    
    return res.json({ message: "Resource request deleted successfully" });
  } catch (error) {
    console.error("Error deleting resource request:", error);
    return res.status(500).json({ error: "Failed to delete resource request" });
  }
};
const ResourceRequest = require("../database/resourceRequestModel");
const Student = require("../database/studentModel");
const { addResourceRequestToStudent } = require("../utils/studentResourceUtils");

// Submit a new resource request
exports.submitResourceRequest = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // const { title, purpose, expiryDate, cpuCores, cpuRam, gpuRam, studentId } = req.body;
  const { title, purpose, expiryDate, studentId } = req.body;
    
    // Security check: ensure the student can only submit requests for themselves
    if (req.session.user.id !== studentId) {
      return res.status(403).json({ error: "You can only submit requests for your own account" });
    }

    // Validate required fields
    if (!title || !purpose || !expiryDate || !studentId) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["title", "purpose", "expiryDate", "studentId"]
      });
    }

    // Validate expiry date is in the future
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (expiry <= today) {
      return res.status(400).json({ error: "Expiry date must be in the future" });
    }

    // Check if student exists and is verified
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Optional: Check if student is verified before allowing requests
    if (!student.teacher_verified || !student.admin_verified) {
      return res.status(403).json({ 
        error: "Student must be verified by both teacher and admin before submitting resource requests" 
      });
    }

    // Check for existing pending request
    const existingPending = await ResourceRequest.findOne({
      studentId,
       $or: [
        { teacher_action: false, admin_action: false },  // No action yet by either
        { teacher_action: true, teacher_verified: true, admin_action: false } // Teacher approved, waiting for admin
      ]
    });


    if (existingPending) {
      return res.status(400).json({
        error: "Only one pending request is allowed at a time. Please wait for your current request to be processed or delete it if there are no actions taken by teacher/admin."
      });
    }

    // Create new resource request
    const resourceRequest = new ResourceRequest({
      studentId,
      title: title.trim(),
      purpose: purpose.trim(),
      expiryDate: expiry,
    });

    // Save to database
    const savedRequest = await resourceRequest.save();
    
    // Add the resource request ID to the student's resourceRequests array
    if (savedRequest) {
      await addResourceRequestToStudent(studentId, savedRequest._id);

      // Send email to student after successful request (with undertaking PDF)
      sendResourceRequestSubmittedEmail(
        student.email,
        student.name,
        savedRequest.title,
        {
          name: student.name,
          rollNo: student.rollNo,
          branch: student.branch,
          instituteName: student.instituteName,
          instituteAddress: student.instituteAddress
        },
        savedRequest.purpose
      ).catch((err) => {
        console.error('Error sending resource request email:', err);
      });

      // Notify teacher about student's resource request
      try {
        const teacher = await Teacher.findById(student.teacher);
        if (teacher) {
          sendTeacherStudentResourceRequestEmail(
            teacher.email,
            teacher.name,
            student.name,
            savedRequest.title,
            {
              name: student.name,
              rollNo: student.rollNo,
              branch: student.branch,
              instituteName: student.instituteName,
              instituteAddress: student.instituteAddress
            },
            savedRequest.purpose
          );
          // console.log(`Teacher notification email sent to ${teacher.email}`);
        }
      } catch (emailErr) {
        console.error('Error sending teacher notification email:', emailErr);
      }

      // --- Web Push Notification to Teacher ---
      notifyTeacher(student.teacher, {
        title: 'New Resource Request',
        body: `A new resource request was submitted by a student.`
      }).catch((pushErr) => {
        console.error('[WebPush] Error in teacher notification block:', pushErr);
      });
      
      // --- Web Push Notification to Admin ---
      // notifyAdmin({
      //   title: 'New Resource Request',
      //   body: 'A student has submitted a new resource request.',
      //   // type: 'ADMIN_RESOURCE_REQUEST_UPDATED'
      // }).catch((adminPushErr) => {
      //   console.error('[WebPush] Error in admin notification block:', adminPushErr);
      // });
      // --- End Web Push ---
    }


    return res.status(201).json({
      message: "Resource request submitted successfully",
      requestId: savedRequest._id,
      request: savedRequest
    });

  } catch (error) {
    console.error("Error submitting resource request:", error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors 
      });
    }

    return res.status(500).json({ error: "Failed to submit resource request" });
  }
};

// Get all resource requests for a specific student
exports.getStudentResourceRequests = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { studentId } = req.params;

    // Security check: ensure the student can only access their own requests
    if (req.session.user.id !== studentId) {
      return res.status(403).json({ error: "You can only access your own resource requests" });
    }

    // Validate student ID
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get all resource requests for this student, sorted by creation date (newest first)
    const resourceRequests = await ResourceRequest.find({ studentId })
      .populate('machineId', 'MIGID') // Populate machine to get MIGID
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 requests to avoid performance issues

    // console.log(`Retrieved ${resourceRequests.length} resource requests for student ${studentId}`);

    return res.json(resourceRequests);

  } catch (error) {
    console.error("Error fetching student resource requests:", error);
    return res.status(500).json({ error: "Failed to fetch resource requests" });
  }
};