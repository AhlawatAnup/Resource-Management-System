const sendEmail = require('../sendEmail');

const sendStudentRegistrationSuccessEmail = async (studentEmail, studentName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🎉 Registration Successful!</h2>

      <p>Dear <strong>${studentName}</strong>,</p>

      <p>Welcome to the U.I.E.T Cloud AI Data Center! Your student account has been successfully created.</p>

      <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px;">
        <strong>📝 Next Steps:</strong>
        <ul>
          <li>Your profile is pending verification by your assigned teacher</li>
          <li>Once verified by your teacher, an admin will provide final approval</li>
          <li>You will receive email notifications about your verification status</li>
          <li>After approval, you can start submitting resource requests</li>
        </ul>
      </div>

      <p>Best regards,<br><strong>U.I.E.T Cloud AI Data Center</strong></p>
      <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendEmail({
    to: studentEmail,
    subject: 'Registration Successful - Welcome to UIET Cluster Resource Sharing',
    html,
  });
};

module.exports = { sendStudentRegistrationSuccessEmail };
