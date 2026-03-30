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

async function handleSendAdminStudentVerificationPendingEmail(student, teacher) {
  if (!student) return;

  try {
    const { name, email, rollNo } = student;

    const result = await emailService.sendAdminStudentVerificationPendingEmail(
      name,
      email,
      rollNo,
      teacher.name
    );

    console.log("Admin notified of student verification pending:", result);

  } catch (error) {
    console.error("Error sending admin verification pending email:", error);
  }
}

// Handler for Verified Email
async function handleSendResourceRequestVerifiedEmail(studentEmail, studentName, requestTitle) {
  try {
    const result = await emailService.sendResourceRequestVerifiedEmail({
      studentEmail,
      studentName,
      requestTitle
    });

  } catch (error) {
    console.error("Error sending verified email:", error);
  }
}

// Handler for Rejected Email
async function handleSendResourceRequestRejectedEmail(studentEmail, studentName, requestTitle) {
  try {
    const result = await emailService.sendResourceRequestRejectedEmail({
      studentEmail,
      studentName,
      requestTitle
    });

  } catch (error) {
    console.error("Error sending rejected email:", error);
  }
}

module.exports = {
  handleSendStudentProfileUnverifiedByAdminEmail,
  handleSendStudentProfileRejectedByTeacherEmail,
  handleSendStudentProfileRejectedByAdminEmail,
  handleSendStudentProfileVerifiedByAdminEmail,
  handleSendAdminStudentVerificationPendingEmail,
  handleSendResourceRequestVerifiedEmail,
  handleSendResourceRequestRejectedEmail,
};