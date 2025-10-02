const express = require("express");
const path = require("path");
const { logRequest, isStudent } = require("../middleware/authMiddleware.js");

const {
  student_data
} = require("../controllers/common.controller.js");

const {
  submitResourceRequest,
  getStudentResourceRequests,
  deleteStudentResourceRequest
} = require("../controllers/student.controller.js");

const router = express.Router();
const publicPath = path.join(__dirname, "../../../public");

// Middleware applied to all auth routes
router.use(logRequest);

router.get("/student_data/:stu_id", student_data);

// Route: Request Resources
router.get("/request-resources", isStudent, (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "student", "request-resources.html"));
});

// Route: View Requests
router.get("/view-requests", isStudent, (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "student", "view-requests.html"));
});

// Delete a resource request by ID
router.delete("/del_requests/:requestId", deleteStudentResourceRequest);
router.post("/submit-resource-request", submitResourceRequest);
router.get("/resource-requests/:studentId", getStudentResourceRequests);

module.exports = router;