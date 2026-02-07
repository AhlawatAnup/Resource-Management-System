const sendEmail = require('../sendEmail');

// Verified by Teacher
const sendStudentProfileVerifiedByTeacherEmail = async (studentEmail, studentName, teacherName) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#4CAF50;">✅ Teacher Verification Complete</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your profile has been verified by your assigned teacher.</p>
      <p>Awaiting admin verification.</p>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: 'Profile Verification Update - Teacher Approved',
    html
  });
};

// Rejected by Teacher
const sendStudentProfileRejectedByTeacherEmail = async (studentEmail, studentName, teacherName) => {
  const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#f44336;">Profile Rejected by Teacher</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your profile has been rejected by ${teacherName}.</p>
      <p>Your account has been deleted. Please register again.</p>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: 'Profile Verification Update - Teacher Review Required',
    html
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
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: 'Profile Fully Verified - Access Granted!',
    html
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
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: 'Profile Verification Update - Admin Review',
    html
  });
};

module.exports = {
  sendStudentProfileVerifiedByTeacherEmail,
  sendStudentProfileRejectedByTeacherEmail,
  sendStudentProfileVerifiedByAdminEmail,
  sendStudentProfileRejectedByAdminEmail
};
