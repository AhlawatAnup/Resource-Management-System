const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  admin_dashboard_data,
  getPendingTeachers,
  getAllTeachers,
  updateTeacherVerification
} = require("../controllers/admin.controller.js");

const {
  teacher_data,
} = require("../controllers/common.controller.js");

const router = express.Router();

// Middleware applied to all admin routes
router.use(logRequest);

// Admin dashboard data
router.get("/data", admin_dashboard_data);

// Teacher management routes
router.get("/teachers", getAllTeachers);
router.get("/teachers/pending", getPendingTeachers);
router.get("/teacher_data/:teacher_id", teacher_data);
router.put("/verify_teacher/:teacher_id", updateTeacherVerification);

module.exports = router;