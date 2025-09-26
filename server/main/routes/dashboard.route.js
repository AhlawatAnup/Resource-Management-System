const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  roleBasedDashboard,
  getCurrentUserId
} = require("../controllers/common.controller.js");
const teacherRoutes = require("./teacher.route.js");
const studentRoutes = require("./student.route.js");
const adminRoutes = require("./admin.route.js");
const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);
// GET /dashboard → render role-based dashboard
router.get("/", roleBasedDashboard);

// GET /dashboard/current-user-id → get current user's ID from session
router.get("/current-user-id", getCurrentUserId);

// Mount teacher routes under /teacher path
router.use("/teacher", teacherRoutes);
router.use("/student", studentRoutes);
router.use("/admin", adminRoutes);

// router.post("/register", register);

module.exports = router;
