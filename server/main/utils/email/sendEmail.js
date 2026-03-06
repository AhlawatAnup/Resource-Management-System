const transporter = require('./transporter');

module.exports = async ({ to, subject, html, attachments = [] }) => {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments
    });
    return result; // Return raw nodemailer response on success
  } catch (error) {
    console.error('Email send error:', error.message);
    throw error; // Re-throw so caller knows it failed
  }
};
