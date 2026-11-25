const sendEmail = require('../sendEmail');

// 11. Send email when teacher registration is successful
const sendTeacherRegistrationSuccessEmail = async (teacherEmail, teacherName) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">🎓 Teacher Registration Successful!</h2>

      <p>Dear <strong>${teacherName}</strong>,</p>

      <p>
        Welcome to the U.I.E.T Cloud AI Data Center!
        Your teacher account has been successfully created.
      </p>

      <div style="background-color: #e8f5e8; border: 1px solid #4CAF50; padding: 20px; border-radius: 8px;">
        <p><strong>Status:</strong> Registration completed ✅</p>
        <p><strong>Next Step:</strong> Awaiting admin verification</p>
      </div>

      <div style="background-color: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>📝 What happens next:</strong>
        <ul>
          <li>Your profile is pending verification by the administrator</li>
          <li>You will receive an email about your verification status</li>
          <li>Once verified, you can manage student profiles and resource requests</li>
          <li>You will get access to the teacher dashboard</li>
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
    subject: 'Teacher Registration Successful - Pending Admin Verification',
    html,
  });
};

module.exports = { sendTeacherRegistrationSuccessEmail };
