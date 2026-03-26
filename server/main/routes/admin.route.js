const express = require("express");
const path = require("path");

const { logRequest, isAdmin } = require("../middleware/authMiddleware.js");
const {
  admin_dashboard_data,
  getPendingTeachers,
  getAllTeachers,
  updateTeacherVerification,
  unverifyTeacherIfPossible,
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
  unverifyStudentIfPossible,
  revokeResourceRequest,
} = require("../controllers/admin.controller.js");

const {
  teacher_data,
  student_data,
  updateStudentVerification,
  updateResourceRequestVerification,
  editResourceRequest,
  deleteStudentAndResources,
  getAllMachines,
  getMachineWiseActiveAllotments
} = require("../controllers/common.controller.js");

const router = express.Router();
const publicPath = path.join(__dirname, "../../../public");

const { upload } = require('../utils/uploadMiddleware');
const handleMachineCsvFile = require('../utils/machineCsvHandler');


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
router.put("/unverify_teacher/:teacher_id", unverifyTeacherIfPossible);

// Student management routes
router.get("/students", getAllStudents);
router.get("/students/pending", getPendingStudents);
router.get("/students/rejected", getRejectedStudents);
router.get("/student_data/:student_id", student_data);
router.put("/verify_student/:student_id", updateStudentVerification);
router.put("/edit_request/:request_id", editResourceRequest);
router.delete("/delete_student/:studentId", deleteStudentAndResources); // Delete student and their resource requests (admin)
router.put("/unverify_student/:student_id", unverifyStudentIfPossible);

// Resource request management routes
router.get("/resource-requests", getAllResourceRequests);
router.put("/verify_request/:request_id", updateResourceRequestVerification);
router.post("/revoke/:requestId", revokeResourceRequest);

// Profile section routes
router.get("/details", isAdmin, getAdminDetails);
router.put("/change-password", isAdmin, ChangeAdminPassword);
router.put("/update-profile", isAdmin, UpdateAdminProfile);
// router.put("/change-email", isAdmin, ChangeAdminEmail);


// Machines section routes
router.post('/upload-machines', isAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const filePath = req.file.path;
  try {
  const result = await handleMachineCsvFile(filePath);
  res.json({ ok: true, imported: result.imported, total: result.total, skipped: result.skipped || [] });
  } catch (err) {
    console.error('Import machines CSV failed', err);
    res.status(500).json({ error: 'Import failed' });
  }
});

router.get('/machines', isAdmin, getMachines); //admin machine page
router.post('/create-machine', isAdmin, createMachine);
router.put('/machines/:id', isAdmin, updateMachineAvailability);
router.delete('/machines/:id', isAdmin, deleteMachine);

router.get('/get_machines', isAdmin, getAllMachines); //for allotments
router.get('/allotments/:machineId', isAdmin, getMachineWiseActiveAllotments);

module.exports = router;