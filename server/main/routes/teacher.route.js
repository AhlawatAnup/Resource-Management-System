const express = require("express");
const path = require("path");
const { logRequest, isTeacher } = require("../middleware/authMiddleware.js");
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
const publicPath = path.join(__dirname, "../../../public");

// Middleware applied to all auth routes
router.use(logRequest);

router.get("/data", teacher_dashboard_data);

router.get("/view-requests", isTeacher, (req, res) => {
  res.sendFile(
    path.join(publicPath, "dashboard", "teacher", "view-requests.html")
  );
});

router.get("/student_data/:stu_id", student_data);

router.put("/verify_student/:stu_id", updateStudentVerification);

router.put("/edit_request/:request_id", editResourceRequest);

router.put("/verify_request/:request_id", updateResourceRequestVerification);

router.delete("/delete_student/:studentId", deleteStudentAndResources);  // Delete student and their resource requests (teacher)

module.exports = router;