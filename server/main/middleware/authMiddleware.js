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

exports.noCache = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
}