const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  teacher_dashboard_data,
  student_data,
  roleBasedDashboard
} = require("../controllers/teacher.controller.js");
const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

router.get("/data", teacher_dashboard_data);

router.get("/student_data/:stu_id", student_data);

module.exports = router;