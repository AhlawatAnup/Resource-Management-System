const sendEmail = require('../sendEmail');
const { generateUndertakingPDF } = require('../common/undertakingPdfGenerator');

// 1. Notify teacher when a student registers under them
const sendTeacherStudentRegisteredEmail = async (
  teacherEmail,
  teacherName,
  studentName,
  studentRollNo,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">👨‍🎓 New Student Registration</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        A new student has registered under your supervision in the U.I.E.T Cloud AI Data Center.
      </p>

      <div style="background-color: #e3f2fd; border: 1px solid #2196F3; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Roll Number:</strong> ${studentRollNo}</p>
        <p><strong>Status:</strong> Awaiting your verification ⏳</p>
      </div>

      <div style="background-color: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📝 Action Required:</strong>
        <p>Please log in to your dashboard to review and verify this student's profile.</p>
        <ul>
          <li>Review student details</li>
          <li>Verify student information</li>
          <li>Approve or reject the registration</li>
        </ul>
      </div>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>

      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[ACTION REQUIRED] New Student Registration - Verification Required',
    html,
  });
};

// 2. Notify teacher when a student under them raises a resource request
const sendTeacherStudentResourceRequestEmail = async (
  teacherEmail,
  teacherName,
  studentName,
  resourceTitle,
  studentData = {},
  purpose = '',
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FF9800;">🖥️ New Resource Request</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        A student under your supervision has submitted a new resource request that requires your verification.
      </p>

      <div style="background-color: #fff3e0; border: 1px solid #FF9800; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Resource Title:</strong> ${resourceTitle}</p>
        <p><strong>Status:</strong> Awaiting your review ⏳</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #2196F3; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📋 Action Required:</strong>
        <p>Please log in to your dashboard to review this resource request.</p>
        <ul>
          <li>Review request details and purpose</li>
          <li>Verify the resource requirements</li>
          <li>Approve or reject the request</li>
        </ul>
      </div>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>


      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[ACTION REQUIRED] New Resource Request - Student Verification Required',
    html,
  });
};

// 3. Notify teacher when admin accepts student verification
const sendTeacherStudentVerifiedByAdminEmail = async (teacherEmail, teacherName, studentName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">✅ Student Profile Verified by Admin</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        Good news! The administrator has verified the profile of one of your students.
      </p>

      <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Status:</strong> Fully Verified ✅</p>
        <p><strong>Access Level:</strong> Can now submit resource requests</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📌 What's Next:</strong>
        <ul>
          <li>Student can now submit cluster resource requests</li>
          <li>You will receive notifications when they submit requests</li>
        </ul>
      </div>

      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: 'Student Profile Verified by Admin',
    html,
  });
};

// 4. Notify teacher when admin rejects student verification
const sendTeacherStudentRejectedByAdminEmail = async (teacherEmail, teacherName, studentName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">❌ Student Profile Rejected by Admin</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        The administrator has rejected the profile verification of one of your students.
      </p>

      <div style="background-color: #ffebee; border: 1px solid #f44336; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Status:</strong> Rejected by Admin ❌</p>
        <p><strong>Account Status:</strong> Deleted from system</p>
      </div>

      <div style="background-color: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📝 Information:</strong>
        <p>The student account has been removed from the system. If the student wishes to access the system, they will need to complete a fresh registration.</p>
      </div>

      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: 'Student Profile Rejected by Admin - Notification',
    html,
  });
};

// 5. Notify teacher when admin accepts student resource request
const sendTeacherResourceRequestVerifiedByAdminEmail = async (
  teacherEmail,
  teacherName,
  studentName,
  resourceTitle,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">✅ Resource Request Approved by Admin</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        The administrator has approved a resource request from one of your students.
      </p>

      <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Resource Title:</strong> ${resourceTitle}</p>
        <p><strong>Status:</strong> Approved & Allocated ✅</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📌 Information:</strong>
        <ul>
          <li>Resources have been allocated to the student</li>
          <li>Student has received VM credentials and access details</li>
        </ul>
      </div>

      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[VERIFIED] Student Resource Request Approved by Admin',
    html,
  });
};

// 6. Notify teacher when admin rejects student resource request
const sendTeacherResourceRequestRejectedByAdminEmail = async (
  teacherEmail,
  teacherName,
  studentName,
  resourceTitle,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">❌ Resource Request Rejected by Admin</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        The administrator has rejected a resource request from one of your students.
      </p>

      <div style="background-color: #ffebee; border: 1px solid #f44336; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Resource Title:</strong> ${resourceTitle}</p>
        <p><strong>Status:</strong> Rejected by Admin ❌</p>
      </div>

      <div style="background-color: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📝 Information:</strong>
        <p>The resource request has been denied. The student has been notified and can submit a new request if needed.</p>
      </div>

      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[INFO] Student Resource Request Rejected by Admin',
    html,
  });
};

// 7. Notify teacher when admin revokes student resource allocation
const sendTeacherResourceRequestRevokedByAdminEmail = async (
  teacherEmail,
  teacherName,
  studentName,
  resourceTitle,
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">⚠️ Resource Allocation Revoked</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        The administrator has revoked a resource allocation for one of your students.
      </p>

      <div style="background-color: #ffebee; border: 1px solid #f44336; padding: 20px; border-radius: 8px;">
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Resource Title:</strong> ${resourceTitle}</p>
        <p><strong>Status:</strong> Allocation Revoked ⚠️</p>
      </div>

      <div style="background-color: #fff3e0; border: 1px solid #ffb74d; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📝 Information:</strong>
        <p>The resources have been deallocated and the student has been notified. The student may submit a new resource request if needed.</p>
      </div>

      <p>Best regards,<br>
      <strong>U.I.E.T Cloud AI Data Center</strong></p>

      <hr>
      <p style="font-size: 12px; color: #666;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[ATTENTION] Student Resource Allocation Revoked by Admin',
    html,
  });
};

module.exports = {
  sendTeacherStudentRegisteredEmail,
  sendTeacherStudentResourceRequestEmail,
  sendTeacherStudentVerifiedByAdminEmail,
  sendTeacherStudentRejectedByAdminEmail,
  sendTeacherResourceRequestVerifiedByAdminEmail,
  sendTeacherResourceRequestRejectedByAdminEmail,
  sendTeacherResourceRequestRevokedByAdminEmail,
};
