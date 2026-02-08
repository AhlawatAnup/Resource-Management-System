const sendEmail = require('../sendEmail');

const sendExpiringResourceEmail = async ({
  studentEmail,
  adminEmail,
  resourceRequest,
  expiryDate
}) => {
  const formattedDate = new Date(expiryDate).toLocaleDateString();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e53935;">⏰ Resource Request Expiry Notice</h2>

      <p>This is a reminder that the following resource request is about to expire:</p>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px;">
        <strong>Resource Title:</strong> ${resourceRequest.title || 'N/A'}<br>
        <strong>Username:</strong> ${resourceRequest.username || 'N/A'}<br>
        <strong>Expiry Date:</strong> ${formattedDate}
      </div>

      <p>Please take necessary action before the expiry date.</p>

      <p><strong>UIET Cluster Resource Management System</strong></p>
      <p style="font-size: 12px; color: #666;">This is an automated email. Please do not reply.</p>
    </div>
  `;

  return sendEmail({
    to: [studentEmail, adminEmail].filter(Boolean).join(','),
    subject: '[URGENT] Resource Request Expiry Notice - Action Required',
    html
  });
};

module.exports = { sendExpiringResourceEmail };
