const sendEmail = require('../sendEmail');

const sendOTPEmail = async (email, otp, role) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2196F3;">🔐 Email Verification</h2>

      <p>Dear User,</p>

      <p>You are verifying your identity as a <strong>${role}</strong> for the UIET Cluster Resource Management System.</p>

      <div style="background-color: #f0f8ff; border: 2px solid #2196F3; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
        <h3>Your Verification Code:</h3>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${otp}
        </div>
        <p>This code will expire in 5 minutes</p>
      </div>

      <ul>
        <li>Do not share this OTP with anyone</li>
        <li>This code is valid for 5 minutes only</li>
        <li>If you didn't request this, please ignore this email</li>
      </ul>

      <p><strong>UIET Cluster Resource Management System</strong></p>
      <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - UIET Cluster Resource Sharing',
    html
  });
};

module.exports = { sendOTPEmail };
