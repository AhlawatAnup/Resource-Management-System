const express = require('express');
const {
  sendOtp,
  verifyOtp,
  register,
  adminLogin,
  getVerifiedTeachers,
} = require('../controllers/authController');
const { logRequest, requireRegistrationSession } = require('../middleware/authMiddleware.js');

const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/admin-login', adminLogin);

router.get('/get-teachers', requireRegistrationSession, getVerifiedTeachers);

router.post('/register', requireRegistrationSession, register);

module.exports = router;
