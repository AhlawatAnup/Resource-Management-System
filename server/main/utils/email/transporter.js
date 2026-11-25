const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  ignoreTLS: process.env.EMAIL_IGNORE_TLS === 'true',
  requireTLS: process.env.EMAIL_REQUIRE_TLS === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
  tls: {
    rejectUnauthorized: process.env.EMAIL_REQUIRE_CA === 'true', // Remove in production if server has a valid certificate
  },
});
