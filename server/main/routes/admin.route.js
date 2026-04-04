const express = require("express");
const path = require("path");

const { logRequest, isAdmin } = require("../middleware/authMiddleware.js");
const {
  admin_dashboard_data,
  getPendingTeachers,
  getAllTeachers,
  updateTeacherVerification,
  unverifyTeacher,
  getPendingStudents,
  getAllStudents,
  getRejectedTeachers,
  getRejectedStudents,
  getAllResourceRequests,
  getAdminDetails,
  ChangeAdminPassword,
  ChangeAdminEmail,
  getMachines,
  createMachine,
  updateMachineAvailability,
  deleteMachine,
  deleteResourceRequestByMig,
  UpdateAdminProfile,
  unverifyStudentByAdmin,
  revokeResourceRequest,
  extendAllotment,
} = require("../controllers/admin.controller.js");

const {
  teacher_data,
  student_data,
  updateStudentVerification,
  updateResourceRequestVerification,
  deleteStudentAndResources,
  getAllMachines,
  getMachineWiseActiveAllotments
} = require("../controllers/common.controller.js");

const router = express.Router();
const publicPath = path.join(__dirname, "../../../public");


// Middleware applied to all admin routes
router.use(logRequest);
router.use(isAdmin);

//sidebar routes
router.get("/view-requests", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "view-requests.html"));
});
router.get("/profile", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "profile.html"));
});
router.get("/machines-page", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "machines.html"));
});
router.get("/allotments", (req, res) => {
  res.sendFile(path.join(publicPath, "dashboard", "admin", "allotments.html"));
});

// Admin dashboard data
router.get("/data", admin_dashboard_data);

// Teacher management routes
router.get("/teachers", getAllTeachers);
router.get("/teachers/pending", getPendingTeachers);
router.get("/teachers/rejected", getRejectedTeachers);
router.get("/teacher_data/:teacher_id", teacher_data);
router.put("/verify_teacher/:teacher_id", updateTeacherVerification);
router.put("/unverify_teacher/:teacher_id", unverifyTeacher);

// Student management routes
router.get("/students", getAllStudents);
router.get("/students/pending", getPendingStudents);
router.get("/students/rejected", getRejectedStudents);
router.get("/student_data/:student_id", student_data);
router.put("/verify_student/:student_id", updateStudentVerification);
router.delete("/delete_student/:studentId", deleteStudentAndResources); // Delete student and their resource requests (admin)
router.put("/unverify_student/:student_id", unverifyStudentByAdmin);

// Resource request management routes
router.get("/resource-requests", getAllResourceRequests);
router.put("/verify_request/:request_id", updateResourceRequestVerification);
router.post("/revoke/:requestId", revokeResourceRequest);
router.patch("/edit-resourceRequest/:requestId", extendAllotment);

// Profile section routes
router.get("/details", isAdmin, getAdminDetails);
router.put("/change-password", isAdmin, ChangeAdminPassword);
router.put("/update-profile", isAdmin, UpdateAdminProfile);
// router.put("/change-email", isAdmin, ChangeAdminEmail);


router.get('/machines', isAdmin, getMachines); //admin machine page
router.post('/create-machine', isAdmin, createMachine);
router.put('/machines/:id', isAdmin, updateMachineAvailability);
router.delete('/machines/:id', isAdmin, deleteMachine);

router.get('/get_machines', isAdmin, getAllMachines); //for allotments
router.get('/allotments/:machineId', isAdmin, getMachineWiseActiveAllotments);

module.exports = router;