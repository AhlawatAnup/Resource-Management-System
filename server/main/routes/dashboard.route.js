const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  roleBasedDashboard
} = require("../controllers/teacher.controller.js");
const teacherRoutes = require("./teacher.route.js");
const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
// router.post("/send-otp", sendOtp);
// router.post("/verify-otp", verifyOtp);
// GET /dashboard → render role-based dashboard
router.get("/", roleBasedDashboard);

// Mount teacher routes under /teacher path
router.use("/teacher", teacherRoutes);

// router.post("/register", register);

module.exports = router;
