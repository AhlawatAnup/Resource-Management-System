const express = require("express");
const {
  sendOtp,
  verifyOtp,
  register,
} = require("../controllers/authController");
const { logRequest } = require("../middleware/authMiddleware.js");

const router = express.Router();

// Middleware applied to all auth routes
router.use(logRequest);

// Routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.get("/get-teachers", async (req, res) => {
  const Teacher = require("../database/teacherModel");
  try {
    const teachers = await Teacher.find({});
    res.json({ teachers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
});

router.post("/register", register);

module.exports = router;
