const emailService = require("../../utils/email/emails.service");
const { notifyStudent } = require('../../utils/web-push-notifications/notifyStudent.js');

function handleSendStudentProfileUnverifiedByAdminEmail(updatedStudent, studentId) {
  if (!updatedStudent) return;

  try {
    const emailResult = emailService.sendStudentProfileUnverifiedByAdminEmail(
      updatedStudent.email,
      updatedStudent.name
    );
  } catch (error) {
    console.error("Error sending student unverification email:", error);
  }

  try {
    notifyStudent(studentId, {
      title: 'Student Profile unverified by Admin',
      body: 'Your profile has been unverified by admin.'
    });
  } catch (err) {
    console.error("Error sending student web-push notification:", err);
  }
}

module.exports = {
  handleSendStudentProfileUnverifiedByAdminEmail,
};