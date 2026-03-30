async function handleSendStudentProfileUnverifiedByAdminEmail(updatedStudent, studentId) {
  if (!updatedStudent) return;

  try {
    const emailResult = await emailService.sendStudentProfileUnverifiedByAdminEmail(
      updatedStudent.email,
      updatedStudent.name
    );
    console.log("Student unverification email sent:", emailResult);
  } catch (error) {
    console.error("Error sending student unverification email:", error);
  }

  try {
    await notifyStudent(studentId, {
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