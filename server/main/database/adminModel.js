const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true },
  name: { type: String },
  permissions: [String], // e.g., ["manage_users", "manage_courses"]
  config: {
    type: Object,
    default: {
      resource_request_mail: true,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Admin', adminSchema);
