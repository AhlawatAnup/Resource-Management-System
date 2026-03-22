const express = require("express");
const path = require("path");
const { logRequest, isStudent } = require("../middleware/authMiddleware.js");
const {
  student_data,
  getAllMachines,
  getMachineWiseActiveAllotments,
  getMachineById
} = require("../controllers/common.controller.js");

const {
  submitResourceRequest,
  getStudentResourceRequests,
  deleteStudentResourceRequest,
  getRequestAllotmentTime,
  getTokenByMigid
} = require("../controllers/student.controller.js");


const router = express.Router();
const publicPath = path.join(__dirname, "../../../public");

// Middleware applied to all auth routes
router.use(logRequest);
// All student routes require student role
router.use(isStudent);

router.get("/student_data/:stu_id", student_data);

// Route: Request Resources
router.get("/request-resources", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "student", "request-resources.html"));
});

// Route: View Requests
router.get("/view-requests", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "student", "view-requests.html"));
});

// Route: Allotments
router.get("/allotments", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "student", "allotments.html"));
});

// Route: About Us
router.get("/about-us", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "student", "about-us.html"));
});

// Delete a resource request by ID
router.delete("/del_requests/:requestId", deleteStudentResourceRequest);
router.post("/submit-resource-request", submitResourceRequest);
router.get("/resource-requests/:studentId", getStudentResourceRequests);

//machines
router.get("/get_machines", getAllMachines);
router.get("/allotments/:machineId", getMachineWiseActiveAllotments);
router.get("/allotment-time/:requestId", getRequestAllotmentTime);

//token
router.get("/token/:migid", getTokenByMigid);

module.exports = router;