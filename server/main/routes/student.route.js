const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");

const {
  student_data
} = require("../controllers/common.controller.js");

const {
  submitResourceRequest,
  getStudentResourceRequests,
  deleteStudentResourceRequest
} = require("../controllers/student.controller.js");

const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

router.get("/student_data/:stu_id", student_data);


// Delete a resource request by ID
router.delete("/requests/:requestId", deleteStudentResourceRequest);
router.post("/submit-resource-request", submitResourceRequest);
router.get("/resource-requests/:studentId", getStudentResourceRequests);

module.exports = router;