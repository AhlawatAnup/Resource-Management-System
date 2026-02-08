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

// 4. Notify admin when their username is changed
const sendAdminUsernameChangeEmail = async (username, changedAtTime) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">🔐 Your Username Has Been Changed</h2>

      <p>Dear Administrator,</p>

      <p>
        This email confirms that your account username has been successfully updated.
      </p>

      <div style="background-color: #e3f2fd; border: 1px solid #2196F3; padding: 20px; border-radius: 8px;">
        <p><strong>New Username:</strong> ${username}</p>
        <p><strong>Changed At:</strong> ${changedAtTime}</p>
        <p><strong>Status:</strong> ✓ Change Completed</p>
      </div>

      <div style="background-color: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>⚠️ Important:</strong>
        <p>If you did not make this change, please reset your password immediately.</p>
      </div>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p><strong>For Security:</strong></p>
        <ul>
          <li>Keep your login credentials confidential</li>
          <li>Use a strong, unique password</li>
          <li>Never share your account details with anyone</li>
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

  return sendToAdmin('Username Change Notification', html);
};

// 5. Send security alert to old email when admin email is changed
const sendAdminEmailChangeSecurityAlertEmail = async (oldEmail, newEmail) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h3 style="color: #1976D2;">Account Email Updated</h3>

      <p>Hello,</p>

      <p>
        This is to inform you that the email address linked to your
        <strong>UIET Cluster Resource Management System</strong> account was updated.
      </p>

      <p><strong>New email:</strong> ${newEmail}<br>
         <strong>Date:</strong> ${new Date().toLocaleString()}</p>

      <p>
        If you made this change, no action is required.<br>
        If not, please contact your system administrator or IT support.
      </p>

      <p style="margin-top: 16px;">
        — UIET Cluster Resource Management System
      </p>

      <p style="font-size: 12px; color: #777;">
        This is an automated notification. Do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: oldEmail,
    subject: 'Your account email was updated',
    html
  });
};


// 6. Send confirmation email to new email when admin email is changed
const sendAdminEmailChangeConfirmationEmail = async (newEmail, changedAtTime) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">✓ Email Change Confirmation</h2>

      <p>Dear Administrator,</p>

      <p>
        This email confirms that your account email has been successfully updated to this address in the UIET Cluster Resource Management System.
      </p>

      <div style="background-color: #e8f5e9; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px;">
        <p><strong>New Email:</strong> ${newEmail}</p>
        <p><strong>Changed At:</strong> ${changedAtTime}</p>
      </div>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <p><strong>📌 What's Next?</strong></p>
        <ul>
          <li>You will receive future notifications at this email address</li>
          <li>If you need further changes, log in to your dashboard</li>
        </ul>
      </div>

      <p style="margin-top: 20px;">Best regards,<br>
      <strong>UIET Cluster Resource Management System</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: newEmail,
    subject: 'Email Change Confirmation',
    html
  });
};

module.exports = {
  sendAdminTeacherRegistrationEmail,
  sendAdminStudentVerificationPendingEmail,
  sendAdminResourceRequestPendingEmail,
  sendAdminUsernameChangeEmail,
  sendAdminEmailChangeSecurityAlertEmail,
  sendAdminEmailChangeConfirmationEmail
};
