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

async function handleStudentRejectionByTeacherEmail(studentData, teacherId) {
  if (!studentData) return;

  try {
    // Fetch teacher name
    const teacher = await Teacher.findById(teacherId);
    const teacherName = teacher ? teacher.name : 'your teacher';

    // Send rejection email
    const emailResult = await emailService.sendStudentProfileRejectedByTeacherEmail(
      studentData.email,
      studentData.name,
      teacherName
    );
    console.log("Email sent for student profile rejected by teacher:", emailResult);
  } catch (error) {
    console.error("Error sending rejection email:", error);
  }
}

async function sendStudentProfileRejectedByAdminEmail(studentData) {
  if (!studentData) return;

  try {
    const emailResult = await emailService.sendStudentProfileRejectedByAdminEmail(
      studentData.email,
      studentData.name
    );

    console.log("Email sent for student profile rejected by admin:", emailResult);
  } catch (error) {
    console.error("Error sending admin rejection email:", error);
  }
}

module.exports = {
  handleSendStudentProfileUnverifiedByAdminEmail,
  handleStudentRejectionByTeacherEmail,
  sendStudentProfileRejectedByAdminEmail
};