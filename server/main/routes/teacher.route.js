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
  deleteStudentAndResources,
  getAllMachines,
  getMachineWiseActiveAllotments
} = require("../controllers/common.controller.js");



const router = express.Router();
const publicPath = path.join(__dirname, "../../../public");

// Middleware applied to all auth routes
router.use(logRequest);
// All teacher routes require teacher role
router.use(isTeacher);

router.get("/data", teacher_dashboard_data);

// side bar routes
router.get("/view-requests", isTeacher, (req, res) => {
  res.sendFile(
    path.join(publicPath, "dashboard", "teacher", "view-requests.html")
  );
});
router.get("/about-us", isTeacher, (req, res) => {
  res.sendFile(
    path.join(publicPath, "dashboard", "teacher", "about-us.html")
  );
});
router.get("/allotments", isTeacher, (req, res) => {
  res.sendFile(
    path.join(publicPath, "dashboard", "teacher", "allotments.html")
  );
});


router.get("/student_data/:stu_id", student_data);

router.put("/verify_student/:student_id", updateStudentVerification);

router.put("/verify_request/:request_id", updateResourceRequestVerification);

router.delete("/delete_student/:studentId", deleteStudentAndResources);  // Delete student and their resource requests (teacher)

router.get("/get_machines", getAllMachines);
router.get("/allotments/:machineId", getMachineWiseActiveAllotments);

module.exports = router;