// Script to create admin
const bcrypt = require("bcrypt");
const Admin = require("../database/adminModel");
const mongoose = require("mongoose");

async function createDefaultAdmin() {
  try {
    // Connect to database
    await mongoose.connect("mongodb://127.0.0.1:27017/college_resources");

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Default admin already exists");
      process.exit(0);
    }

    // Hash the default password
    const defaultPassword = "admin123"; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create default admin
    const admin = new Admin({
      username: "admin",
      password: hashedPassword,
      email: "admin@uiet.edu",
      name: "System Administrator",
      permissions: ["manage_users", "manage_system", "view_analytics"],
    });

    await admin.save();
    console.log("Default admin created successfully");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Please change the password after first login");

  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  createDefaultAdmin();
}

module.exports = createDefaultAdmin;