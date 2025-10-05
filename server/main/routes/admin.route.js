const express = require("express");
const path = require("path");

const { logRequest, isAdmin } = require("../middleware/authMiddleware.js");
const {
  admin_dashboard_data,
  getPendingTeachers,
  getAllTeachers,
  updateTeacherVerification,
  getPendingStudents,
  getAllStudents,
  getRejectedTeachers,
  getRejectedStudents,
  getAllResourceRequests,
} = require("../controllers/admin.controller.js");

const {
  teacher_data,
  student_data,
  updateStudentVerification,
  updateResourceRequestVerification,
  editResourceRequest,
  deleteStudentAndResources
} = require("../controllers/common.controller.js");

const router = express.Router();
const publicPath = path.join(__dirname, "../../../public");

// Middleware applied to all admin routes
router.use(logRequest);

//sidebar routes
router.get("/view-requests", isAdmin, (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "view-requests.html"));
});
router.get("/profile", isAdmin, (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "profile.html"));
});
router.get("/machines-page", isAdmin, (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "machines.html"));
});

// Admin dashboard data
router.get("/data", admin_dashboard_data);

// Teacher management routes
router.get("/teachers", getAllTeachers);
router.get("/teachers/pending", getPendingTeachers);
router.get("/teachers/rejected", getRejectedTeachers);
router.get("/teacher_data/:teacher_id", teacher_data);
router.put("/verify_teacher/:teacher_id", updateTeacherVerification);

// Student management routes
router.get("/students", getAllStudents);
router.get("/students/pending", getPendingStudents);
router.get("/students/rejected", getRejectedStudents);
router.get("/student_data/:student_id", student_data);
router.put("/verify_student/:student_id", updateStudentVerification);
router.put("/edit_request/:request_id", editResourceRequest);
router.delete("/delete_student/:studentId", deleteStudentAndResources); // Delete student and their resource requests (admin)

// Resource request management routes
router.get("/resource-requests", getAllResourceRequests);
router.put("/verify_request/:request_id", updateResourceRequestVerification);

module.exports = router;