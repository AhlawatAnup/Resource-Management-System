const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");
const {
  teacher_dashboard_data,
} = require("../controllers/teacher.controller.js");

const {
  student_data,
  updateStudentVerification,
  updateResourceRequestVerification,
  editResourceRequest,
  deleteStudentAndResources
} = require("../controllers/common.controller.js");



const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

router.get("/data", teacher_dashboard_data);

router.get("/student_data/:stu_id", student_data);

router.put("/verify_student/:stu_id", updateStudentVerification);

router.put("/edit_request/:request_id", editResourceRequest);

router.put("/verify_request/:request_id", updateResourceRequestVerification);

router.delete("/delete_student/:studentId", deleteStudentAndResources);  // Delete student and their resource requests (teacher)

module.exports = router;