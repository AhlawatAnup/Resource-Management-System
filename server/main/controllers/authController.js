const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const { sendStudentRegistrationSuccessEmail, sendTeacherRegistrationSuccessEmail, sendOTPEmail } = require("../utils/emailService");
const bcrypt = require("bcrypt");

const otpStore = {};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role)
    return res.status(400).json({ error: "Email and role required" });

  try {    
    const otp = generateOtp();
    const expires = Date.now() + 5 * 60 * 1000;

    otpStore[email] = { otp, expires, role };

    // console.log(`Generated OTP ${otp}`);

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, role);
    
    if (emailResult.success) {
      console.log(`📧 ${otp} OTP  email sent successfully to ${email} for ${role} registration `);
      res.json({ 
        message: "OTP sent to your email address",
        messageId: emailResult.messageId 
      });
    } else {
      console.error(`❌ Failed to send OTP email to ${email}:`, emailResult.error);
      // Fallback: still allow OTP generation but notify about email failure
      // console.log(`📧 Fallback - OTP for ${email} (${role}): ${otp}`);
      res.json({ 
        message: "OTP generated successfully (email service temporarily unavailable)",
        fallback: true 
      });
    }
  } catch (error) {
    console.error('Error in sendOtp:', error);
    
    // Emergency fallback: still generate OTP and show in console
    const otp = generateOtp();
    const expires = Date.now() + 5 * 60 * 1000;
    otpStore[email] = { otp, expires, role };
    // console.log(`📧 Emergency fallback (Failed to send OTP on email) - OTP for ${email} (${role}): ${otp}`);
    
    res.json({ 
      message: "OTP generated (email service error, check console for testing)",
      fallback: true 
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ error: "Email and OTP required" });

  const record = otpStore[email];
  if (!record)
    return res.status(400).json({ error: "No OTP found for this email" });

  if (record.expires < Date.now()) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }

  try {
    let user = null;

    if (record.role === "student") {
      user = await Student.findOne({ email });
    } else if (record.role === "teacher") {
      user = await Teacher.findOne({ email });
    } 

    if (!user) {
      delete otpStore[email];

      req.session.email = email;
      req.session.role = record.role;

      return res.json({
        message: "User not found, redirecting to registration",
        redirect: "/registration?role=" + record.role,
      });
    }

    // Attach session
    req.session.user = {
      email: user.email,
      role: record.role,
      id: user._id,
    };

    delete otpStore[email];

    return res.json({ message: "Login successful", redirect: "/dashboard" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

exports.adminLogin = async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    
    if (!admin) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Create session for admin
    req.session.user = {
      username: admin.username,
      role: "admin",
      id: admin._id,
    };

    return res.json({ 
      message: "Admin login successful", 
      redirect: "/dashboard" 
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.register = async (req, res) => {
  const role = req.session.role;

  try {
    if (role === "student") {
      const { name, rollNo, branch, teacher_id, phone } = req.body;
      if (!name || !rollNo || !branch || !teacher_id || !phone) {
        return res.status(400).json({ error: "All student fields required" });
      }
      const student = new Student({
        email: req.session.email,
        name,
        rollNo,
        branch,
        teacher: teacher_id,
        phone,
      });

      const savedStudent = await student.save();

      if (savedStudent) {
        //   ADD THIS STUDENT TO THE TEACHER DB AS WELL
        const teacher = await Teacher.findById(teacher_id);
        teacher.students.push(savedStudent._id);
        await teacher.save();

        // Attach session
        req.session.user = {
          email: req.session.email,
          role: req.session.role,
          id: savedStudent._id,
        };

        // Send registration success email to student
        try {
          await sendStudentRegistrationSuccessEmail(req.session.email, name);
          // console.log('Student registration success email sent to:', req.session.email);
        } catch (emailError) {
          console.error('Error sending student registration email:', emailError);
          // Don't fail the registration if email fails
        }

        return res.json({ message: "Student registered successfully" });
      } else {
        return res.status(500).json({ error: "Failed to save student" });
      }
    }

    if (role === "teacher") {
      const { name, branch, phone } = req.body;
      if (!name || !branch || !phone)
        return res.status(400).json({ error: "Invalid Data" });
      const teacher = new Teacher({ email: req.session.email, name, branch, phone });
      const teacher_id = await teacher.save();
      if (teacher_id) {
        // Attach session
        req.session.user = {
          email: req.session.email,
          role: req.session.role,
          id: teacher_id._id,
        };

        // Send registration success email to teacher
        try {
          await sendTeacherRegistrationSuccessEmail(req.session.email, name);
          // console.log('Teacher registration success email sent to:', req.session.email);
        } catch (emailError) {
          console.error('Error sending teacher registration email:', emailError);
          // Don't fail the registration if email fails
        }

        return res.json({ message: "Teacher registered successfully" });
      } else {
        return res.status(500).json({ error: "Failed to save teacher" });
      }
    }

    if (role === "admin") {
      return res.status(403).json({ error: "Admin registration not allowed" });
    }

    return res.status(400).json({ error: "Invalid role" });
  } catch (err) {
    console.error(err);

    // MongoDB duplicate key error
    if (err.code === 11000) {
      if (err.keyPattern?.rollNo) {
        return res.status(409).json({
          error: "Roll number already exists",
        });
      }

      if (err.keyPattern?.email) {
        return res.status(409).json({
          error: "Email already registered",
        });
      }

      return res.status(409).json({
        error: "Duplicate value exists",
      });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message,
      });
    }

    res.status(500).json({ error: "Registration failed" });
  }
};

exports.getVerifiedTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ is_verified: true }, '_id name');
    res.json({ teachers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
};
