const express = require("express");

const { logRequest } = require("../middleware/authMiddleware.js");

const {
  student_data
} = require("../controllers/common.controller.js");

const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

router.get("/student_data/:stu_id", student_data);

module.exports = router;