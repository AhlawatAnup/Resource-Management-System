const transporter = require('./transporter');

module.exports = async ({ to, subject, html, attachments = [] }) => {
  if (process.env.mode == 'dev') return;
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
      bcc: process.env.EMAIL_ENALE_BCC == 'true' ? process.env.EMAIL_FROM : '',
    });
    return result; // Return raw nodemailer response on success
  } catch (error) {
    console.error('Email send error:', error.message);
    throw error; // Re-throw so caller knows it failed
  }
};
