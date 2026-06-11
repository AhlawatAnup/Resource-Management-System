const {
  sendResourceRequestSubmittedEmail,
  sendTeacherStudentResourceRequestEmail,
} = require('../utils/email/emails.service');
const { notifyAdmin } = require('../utils/web-push-notifications/notifyAdmin');
const { notifyTeacher } = require('../utils/web-push-notifications/notifyTeacher');
const ResourceRequest = require('../database/resourceRequestModel');
const Student = require('../database/studentModel');
const Machine = require('../database/machineModel');
const MachineAllotment = require('../database/machineAllotmentModel.js');
const { addResourceRequestToStudent } = require('../utils/studentResourceUtils');
const { isValidDuration } = require('../utils/common.utils');
const mongoose = require('mongoose');

const Teacher = require('../database/teacherModel');
// Delete a resource request by ID
exports.deleteStudentResourceRequest = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    // Find the request
    const request = await ResourceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Resource request not found' });
    }

    // Only allow the owner to delete
    if (String(request.studentId) !== String(req.session.user.id)) {
      return res.status(403).json({ error: 'You can only delete your own requests' });
    }

    // Only allow delete if no action by admin/teacher and is_verified is false
    if (request.teacher_action || request.admin_action || request.is_verified) {
      return res
        .status(403)
        .json({ error: 'Cannot delete: action taken by admin/teacher or request is verified.' });
    }

    // Remove from student's resourceRequests array
    await Student.findByIdAndUpdate(request.studentId, {
      $pull: { resourceRequests: request._id },
    });

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

    return res.json({ message: 'Resource request deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource request:', error);
    return res.status(500).json({ error: 'Failed to delete resource request' });
  }
};

// Submit a new resource request
exports.submitResourceRequest = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { title, purpose, studentId, duration, machineId } = req.body;

    // Security check: ensure the student can only submit requests for themselves
    if (req.session.user.id !== studentId) {
      return res.status(403).json({ error: 'You can only submit requests for your own account' });
    }

    // Validate required fields
    const parsedDuration = Number(duration);

    if (!title || !purpose || !studentId || !machineId || !parsedDuration) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'purpose', 'studentId', 'machineId', 'duration'],
      });
    }

    if (!isValidDuration(parsedDuration)) {
      return res.status(400).json({ error: 'Invalid duration. Allowed range is 1 to 15 days.' });
    }

    if (!mongoose.Types.ObjectId.isValid(machineId)) {
      return res.status(400).json({ error: 'Invalid machineId' });
    }

    // Check if student exists and is verified
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Optional: Check if student is verified before allowing requests
    if (!student.teacher_verified || !student.admin_verified) {
      return res.status(403).json({
        error:
          'Student must be verified by both teacher and admin before submitting resource requests',
      });
    }

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res
        .status(404)
        .json({ error: 'Selected machine not found. Kindly refresh the page.' });
    }

    // Check for existing active allotment
    const now = new Date();
    const studentRequestIds = await ResourceRequest.find({ studentId }).distinct('_id');

    if (studentRequestIds.length > 0) {
      const activeAllotment = await MachineAllotment.findOne({
        resourceRequestId: { $in: studentRequestIds },
        isActive: true,
        endTime: { $gte: now },
      });

      if (activeAllotment) {
        return res.status(400).json({
          error:
            'You already have an active allotment. Please submit a new request after your current allotment ends.',
        });
      }
    }

    // Check for existing pending request
    const existingPending = await ResourceRequest.findOne({
      studentId,
      teacher_action: false,
      admin_action: false,
      is_verified: false,
    });

    if (existingPending) {
      return res.status(400).json({
        error:
          'Only one pending request is allowed at a time. Please wait for your current request to be processed or delete it if there are no actions taken by teacher/admin.',
      });
    }

    // Create new resource request
    const resourceRequest = new ResourceRequest({
      studentId,
      title: title.trim(),
      purpose: purpose.trim(),
      machineId,
      duration: parsedDuration,
    });

    // Save to database
    const savedRequest = await resourceRequest.save();

    // Add the resource request ID to the student's resourceRequests array
    if (savedRequest) {
      await addResourceRequestToStudent(studentId, savedRequest._id);

      // Notify teacher about student's resource request
      // try {
      //   const teacher = await Teacher.findById(student.teacher);
      //   if (teacher) {
      //     sendTeacherStudentResourceRequestEmail(
      //       teacher.email,
      //       teacher.name,
      //       student.name,
      //       savedRequest.title,
      //       {
      //         name: student.name,
      //         rollNo: student.rollNo,
      //         branch: student.branch,
      //         instituteName: student.instituteName,
      //         instituteAddress: student.instituteAddress,
      //       },
      //       savedRequest.purpose,
      //     );
      //     // console.log(`Teacher notification email sent to ${teacher.email}`);
      //   }
      // } catch (emailErr) {
      //   console.error('Error sending teacher notification email:', emailErr);
      // }

      // --- Web Push Notification to Teacher ---
      // notifyTeacher(student.teacher, {
      //   title: 'New Resource Request',
      //   body: `A new resource request was submitted by a student.`,
      // }).catch((pushErr) => {
      //   console.error('[WebPush] Error in teacher notification block:', pushErr);
      // });

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
      message: 'Resource request submitted successfully',
      requestId: savedRequest._id,
      request: savedRequest,
    });
  } catch (error) {
    console.error('Error submitting resource request:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors,
      });
    }

    return res.status(500).json({ error: 'Failed to submit resource request' });
  }
};

// Get all resource requests for a specific student
exports.getStudentResourceRequests = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { studentId } = req.params;

    // Security check: ensure the student can only access their own requests
    if (req.session.user.id !== studentId) {
      return res.status(403).json({ error: 'You can only access your own resource requests' });
    }

    // Validate student ID
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get all resource requests for this student, sorted by creation date (newest first)
    const resourceRequests = await ResourceRequest.find({ studentId })
      .populate({
        path: 'machineId',
        select: 'MIGID gpuRam',
        options: { includeUnavailable: true },
      })
      .populate({
        path: 'studentId',
        select: 'name rollNo',
        options: { includeUnavailable: true },
      })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 requests to avoid performance issues

    // console.log(`Retrieved ${resourceRequests.length} resource requests for student ${studentId}`);

    return res.json(resourceRequests);
  } catch (error) {
    console.error('Error fetching student resource requests:', error);
    return res.status(500).json({ error: 'Failed to fetch resource requests' });
  }
};

exports.getRequestAllotmentTime = async (req, res) => {
  try {
    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }

    // Find the allotment for this request
    const allotment = await MachineAllotment.findOne(
      { resourceRequestId: requestId },
      { startTime: 1, endTime: 1, _id: 0 },
    )
      .setOptions({
        includeDeleted: true,
        includeInactive: true,
      })
      .lean();
    if (!allotment) {
      return res.status(404).json({ error: 'No allotment found for this request' });
    }

    return res.json({
      startTime: allotment.startTime,
      endTime: allotment.endTime,
    });
  } catch (error) {
    console.error('Error fetching allotment time:', error);
    return res.status(500).json({ error: 'Failed to fetch allotment time' });
  }
};
