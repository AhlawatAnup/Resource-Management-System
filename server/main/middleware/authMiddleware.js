// Simple request logger
exports.logRequest = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

// Future JWT middleware
exports.verifyToken = (req, res, next) => {
  next();
};
