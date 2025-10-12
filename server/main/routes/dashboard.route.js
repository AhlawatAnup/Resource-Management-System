const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  roleBasedDashboard,
  getCurrentUserId,
} = require("../controllers/common.controller.js");
const {
  requireAuth,
  isTeacher,
  isStudent,
  isAdmin,
} = require("../middleware/authMiddleware.js");

const teacherRoutes = require("./teacher.route.js");
const studentRoutes = require("./student.route.js");
const adminRoutes = require("./admin.route.js");
const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);
router.get("/", requireAuth, roleBasedDashboard);

// get current user's ID from session (any authenticated user)
router.get("/current-user-id", requireAuth, getCurrentUserId);

router.use("/teacher", isTeacher, teacherRoutes);
router.use("/student", isStudent, studentRoutes);
router.use("/admin", isAdmin, adminRoutes);

// router.post("/register", register);

module.exports = router;
