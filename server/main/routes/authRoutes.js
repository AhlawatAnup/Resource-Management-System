const express = require("express");
const {
  sendOtp,
  verifyOtp,
  register,
  adminLogin,
  getVerifiedTeachers,
} = require("../controllers/authController");
const { logRequest } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/admin-login", adminLogin);

router.get("/get-teachers", getVerifiedTeachers);

router.post("/register", register);

module.exports = router;
