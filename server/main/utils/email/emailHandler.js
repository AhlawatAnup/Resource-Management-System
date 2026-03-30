const emailService = require("../../utils/email/emails.service");
const Student = require('../../database/studentModel.js');
const Teacher = require('../../database/teacherModel.js');
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

async function handleSendStudentProfileRejectedByTeacherEmail(student, teacher) {
  if (!student || !teacher) return;

  try {
    const teacherName = teacher ? teacher.name : 'your teacher';

    // Send rejection email
    const emailResult = await emailService.sendStudentProfileRejectedByTeacherEmail(
      student.email,
      student.name,
      teacherName
    );
    console.log("Email sent for student profile rejected by teacher:", emailResult);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
}

async function handleSendStudentProfileRejectedByAdminEmail(student) {
  if (!student) return;

  try {
    const emailResult = await emailService.sendStudentProfileRejectedByAdminEmail(
      student.email,
      student.name
    );

    console.log("Email sent for student profile rejected by admin:", emailResult);
  } catch (error) {
    console.error("Error sending admin rejection email:", error);
  }
}

async function handleSendStudentProfileVerifiedByAdminEmail(student) {
  if (!student) return;

  try {
    const emailResult = await emailService.sendStudentProfileVerifiedByAdminEmail(
      student.email,
      student.name
    );

    console.log(
      "Email sent for student profile verified by admin:",
      emailResult
    );
  } catch (error) {
    console.error("Error sending student profile verified by admin email:", error);
  }
}

module.exports = {
  handleSendStudentProfileUnverifiedByAdminEmail,
  handleSendStudentProfileRejectedByTeacherEmail,
  handleSendStudentProfileRejectedByAdminEmail,
  handleSendStudentProfileVerifiedByAdminEmail,
};