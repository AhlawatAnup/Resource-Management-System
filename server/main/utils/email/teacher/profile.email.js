const sendEmail = require('../sendEmail');

// 12. Teacher profile verified by admin
const sendTeacherProfileVerifiedByAdminEmail = async (teacherEmail, teacherName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🎉 Teacher Profile Verified!</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        Congratulations! Your teacher profile has been verified by the administrator.
        You now have full access to the UIET Cluster Resource Management System.
      </p>

      <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px;">
        <p><strong>Status:</strong> Profile Fully Verified ✅</p>
        <p><strong>Access Level:</strong> Full teacher privileges granted</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>🚀 You can now:</strong>
        <ul>
          <li>Access your teacher dashboard</li>
          <li>Manage and verify student profiles</li>
          <li>Review and approve student resource requests</li>
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

  return sendEmail({
    to: teacherEmail,
    subject: '[VERIFIED] Teacher Profile Verified - Full Access Granted!',
    html
  });
};

// 13. Teacher profile rejected by admin
const sendTeacherProfileRejectedByAdminEmail = async (teacherEmail, teacherName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2 style="color:#f44336;">Teacher Profile Rejected by Admin</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>Your teacher profile request has been <strong>rejected by the administrator</strong>.</p>

      <div style="background:#ffebee; padding:15px; border-radius:6px; border:1px solid #ffcdd2;">
        <p>Your account has been deleted from the system.</p>
        <p>If you wish to access the system, kindly complete a <strong>fresh registration</strong>.</p>
      </div>

      <p>Best regards,<br>
      UIET Cluster Resource Management System</p>

      <hr>
      <p style="font-size:12px;color:#777;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[REJECTED] Teacher Profile Verification Update - Admin Review',
    html
  });
};

// Teacher unverified by admin
const sendTeacherProfileUnverifiedByAdminEmail = async (teacherEmail, teacherName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
      <h2 style="color:#ff9800;">⚠️ Profile Verification Reset</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>Your teacher profile has been <strong>unverified by the administrator</strong>.</p>

      <div style="background:#fff3e0; padding:15px; border-radius:6px; border:1px solid #ffe0b2;">
        <p><strong>Important:</strong></p>
        <ul>
          <li>Your verification status has been reset to unverified</li>
          <li>All your students have also been unverified</li>
          <li>All pending resource requests have been removed</li>
        </ul>
      </div>

      <p>Your account is now in pending verification status. You will need to wait for admin re-verification to regain access.</p>

      <p>Best regards,<br>
      UIET Cluster Resource Management System</p>

      <hr>
      <p style="font-size:12px;color:#777;">
        This is an automated email. Please do not reply.
      </p>
    </div>
  `;

  return sendEmail({
    to: teacherEmail,
    subject: '[ACTION REQUIRED] Profile Verification Reset - Action Required',
    html
  });
};

module.exports = {
  sendTeacherProfileVerifiedByAdminEmail,
  sendTeacherProfileRejectedByAdminEmail,
  sendTeacherProfileUnverifiedByAdminEmail
};
