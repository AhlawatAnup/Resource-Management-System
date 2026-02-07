const sendEmail = require('../sendEmail');

// Get admin email from database
const Admin = require('../../../database/adminModel');

// Helper function to send email to the single admin
const sendToAdmin = async (subject, html) => {
  try {
    const admin = await Admin.findOne({});
    if (!admin) {
      console.warn('No admin found to notify');
      return;
    }

    return sendEmail({
      to: admin.email,
      subject,
      html
    });
  } catch (err) {
    console.error('Error sending notification to admin:', err);
  }
};

// 1. Notify admin when a teacher registers
const sendAdminTeacherRegistrationEmail = async (teacherName, teacherEmail, teacherBranch) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">👨‍🏫 New Teacher Registration</h2>

      <p>Dear Administrator,</p>

      <p>
        A new teacher has registered in the UIET Cluster Resource Management System and is awaiting your verification.
      </p>

      <div style="background-color: #e3f2fd; border: 1px solid #2196F3; padding: 20px; border-radius: 8px;">
        <p><strong>Teacher Name:</strong> ${teacherName}</p>
        <p><strong>Email:</strong> ${teacherEmail}</p>
        <p><strong>Branch:</strong> ${teacherBranch}</p>
        <p><strong>Status:</strong> Awaiting admin verification ⏳</p>
      </div>

      <div style="background-color: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📝 Action Required:</strong>
        <p>Please log in to your dashboard to review and verify this teacher's profile.</p>
        <ul>
          <li>Review teacher details</li>
          <li>Verify teacher information</li>
          <li>Approve or reject the registration</li>
        </ul>
      </div>

      <p>Best regards,<br>
      <strong>UIET Cluster Resource Management System</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendToAdmin('New Teacher Registration - Verification Required', html);
};

// 2. Notify admin when student verification is approved by teacher (pending admin approval)
const sendAdminStudentVerificationPendingEmail = async (studentName, studentEmail, studentRollNo, teacherName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">👤 Student Verification Pending Admin Approval</h2>

      <p>Dear Administrator,</p>

      <p>
        A student's profile has been verified by their assigned teacher and is now pending your final approval.
      </p>

      <div style="background-color: #fff3e0; border: 1px solid #FF9800; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Email:</strong> ${studentEmail}</p>
        <p><strong>Roll Number:</strong> ${studentRollNo}</p>
        <p><strong>Verified By Teacher:</strong> ${teacherName}</p>
        <p><strong>Status:</strong> Awaiting admin approval ⏳</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #2196F3; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📋 Action Required:</strong>
        <p>Please log in to your dashboard to review and approve this student's profile.</p>
      </div>

      <p>Best regards,<br>
      <strong>UIET Cluster Resource Management System</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendToAdmin('Student Verification Pending - Admin Approval Required', html);
};

// 3. Notify admin when resource request is approved by teacher (pending admin approval)
const sendAdminResourceRequestPendingEmail = async (
  studentName,
  studentEmail,
  resourceTitle,
  teacherName,
  requestedGpuRam
) => {
  const gpuLine = requestedGpuRam ? `<p><strong>Requested GPU RAM:</strong> ${requestedGpuRam} GB</p>` : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🖥️ Resource Request Pending Admin Approval</h2>

      <p>Dear Administrator,</p>

      <p>
        A student's resource request has been verified by their assigned teacher and is now pending your final approval and resource allocation.
      </p>

      <div style="background-color: #fff3e0; border: 1px solid #FF9800; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Email:</strong> ${studentEmail}</p>
        <p><strong>Resource Title:</strong> ${resourceTitle}</p>
        ${gpuLine}
        <p><strong>Verified By Teacher:</strong> ${teacherName}</p>
        <p><strong>Status:</strong> Awaiting admin allocation ⏳</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #2196F3; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📋 Action Required:</strong>
        <p>Please log in to your dashboard to review and allocate resources for this request.</p>
        <ul>
          <li>Review resource request details</li>
          <li>Check available machines</li>
          <li>Allocate VM/machine and approve request</li>
          <li>Or reject if resources unavailable</li>
        </ul>
      </div>

      <p>Best regards,<br>
      <strong>UIET Cluster Resource Management System</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendToAdmin('Resource Request Pending - Admin Allocation Required', html);
};

module.exports = {
  sendAdminTeacherRegistrationEmail,
  sendAdminStudentVerificationPendingEmail,
  sendAdminResourceRequestPendingEmail
};
