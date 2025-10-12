// Simple request logger
exports.logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

// Future JWT middleware
exports.verifyToken = (req, res, next) => {
  next();
};

// Allow only logged-in users
exports.requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/"); // or /login
  }
  next();
};

// Prevent logged-in users from accessing guest-only pages
exports.preventAuth = (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.session?.user?.role === "admin") {
    return next();
  }
  return res.redirect("/dashboard");
}

exports.isTeacher = (req, res, next) => {
  if (req.session?.user?.role === "teacher") return next();
  return res.redirect("/dashboard"); // redirect non-teachers
}

exports.isStudent = (req, res, next) => {
  if (req.session?.user?.role === "student") return next(); // allow access
  return res.redirect("/dashboard"); // redirect non-students
}

// Only allow access to registration page if user has verified email (OTP)
exports.requireRegistrationSession = (req, res, next) => {
  if (!req.session.email || !req.session.role) {
    // Optionally, redirect to OTP verification page or home
    return res.redirect("/");
  }
  next();
};