const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  dashboard_data,
  student_data,
} = require("../controllers/dashboard.controller.js");

const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);

router.get("/data", dashboard_data);
router.get("/student_data/:stu_id", student_data);

// router.post("/register", register);

module.exports = router;
