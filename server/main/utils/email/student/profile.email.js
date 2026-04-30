const sendEmail = require('../sendEmail');

// Rejected by Teacher
const sendStudentProfileRejectedByTeacherEmail = async (studentEmail, studentName, teacherName) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#f44336;">Profile Rejected by Teacher</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your profile has been rejected by ${teacherName}.</p>
      <p>Your account has been deleted. Please register again.</p>

      <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: '[REJECTED] Profile Verification Update - Teacher Review Required',
    html,
  });
};

// Verified by Admin
const sendStudentProfileVerifiedByAdminEmail = async (studentEmail, studentName) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#4CAF50;">🎉 Profile Fully Verified</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your profile has been verified by the admin. You now have full system access.</p>
      <p>You can now raise resource requests</p>

    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: '[VERIFIED] Profile Fully Verified - Access Granted!',
    html,
  });
};

// Rejected by Admin
const sendStudentProfileRejectedByAdminEmail = async (studentEmail, studentName) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#f44336;">Profile Rejected by Admin</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your profile was rejected by the administrator.</p>
      <p>Please complete a fresh registration.</p>
    <a href="https://aicentre.puchd.ac.in" style="font-family: Arial, sans-serif;background:#1b1e1f;padding :15px; text-decoration: none; color: white; margin-block:2rem; position: relative;  justify-content: center; display: flex;">
         Go to Website
      </a>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: '[REJECTED] Profile Verification Update - Admin Review',
    html,
  });
};

// Deleted due to Teacher Account Deletion
const sendStudentAccountDeletedDueToTeacherDeletionEmail = async (
  studentEmail,
  studentName,
  teacherName,
) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#f44336;">⚠️ Account Deleted - Teacher Account Removed</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your teacher account (<strong>${teacherName}</strong>) has been removed from the system.</p>
      <p>As a result, your student account and all associated resource requests have been deleted.</p>
      <p>If you wish to continue using our services, please register again.</p>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: '[ATTENTION] Account Deleted - Teacher Account Removed',
    html,
  });
};

// Student unverified by admin
const sendStudentProfileUnverifiedByAdminEmail = async (studentEmail, studentName) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#ff9800;">⚠️ Profile Verification Reset</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your student profile has been <strong>unverified by the administrator</strong>.</p>
      
      <div style="background:#fff3e0; padding:15px; border-radius:6px; border:1px solid #ffe0b2;">
        <p><strong>Important:</strong></p>
        <ul>
          <li>Your verification status has been reset to unverified</li>
          <li>All your resource requests have been removed</li>
        </ul>
      </div>
      
      <p>Your account is now in pending verification status. Please wait for teacher and admin re-verification.</p>
      
      <p>Best regards,<br>
      UIET Cluster Resource Management System</p>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: '[ACTION REQUIRED] Profile Verification Reset - Action Required',
    html,
  });
};

// Student unverified due to teacher unverification
const sendStudentUnverifiedDueToTeacherUnverificationEmail = async (
  studentEmail,
  studentName,
  teacherName,
) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#ff9800;">⚠️ Profile Verification Reset - Teacher Unverified</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your teacher (<strong>${teacherName}</strong>) has been unverified by the administrator.</p>
      
      <div style="background:#fff3e0; padding:15px; border-radius:6px; border:1px solid #ffe0b2;">
        <p><strong>Impact on your account:</strong></p>
        <ul>
          <li>Your verification status has been reset to unverified</li>
          <li>All your pending resource requests have been removed</li>
        </ul>
      </div>
      
      <p>You will need to wait for your teacher to be re-verified, and then both teacher and admin will need to verify your profile again.</p>
      
      <p>Best regards,<br>
      UIET Cluster Resource Management System</p>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: '[ATTENTION] Profile Verification Reset - Teacher Status Changed',
    html,
  });
};

module.exports = {
  sendStudentProfileRejectedByTeacherEmail,
  sendStudentProfileVerifiedByAdminEmail,
  sendStudentProfileRejectedByAdminEmail,
  sendStudentAccountDeletedDueToTeacherDeletionEmail,
  sendStudentProfileUnverifiedByAdminEmail,
  sendStudentUnverifiedDueToTeacherUnverificationEmail,
};
