const ResourceRequest = require("../database/resourceRequestModel");
const Student = require("../database/studentModel");
const Admin = require("../database/adminModel");
const { sendExpiringResourceEmail } = require("../utils/email/emails.service");
const { notifyStudent } = require("../utils/web-push-notifications/notifyStudent");

// Notification days before expiry
const NOTIFY_DAYS = [7, 2];

/**
 * Checks for resource requests expiring soon and sends notification emails to student and admin.
 * Sends emails 7 and 2 days before expiry, and marks as notified to avoid duplicates.
 */

async function checkExpiringResourceRequests() {
  try {
    const now = new Date();
    const admin = await Admin.findOne({});
    const adminEmail = admin && admin.email;

    for (const daysBefore of NOTIFY_DAYS) {
      const from = new Date(now.getTime() + (daysBefore - 1) * 24 * 60 * 60 * 1000);
      const to = new Date(now.getTime() + (daysBefore + 1) * 24 * 60 * 60 * 1000);
      const flag = daysBefore === 7 ? 'day7' : 'day2';

      // Find requests expiring in about 'daysBefore' days and not yet notified for that day
      const expiringRequests = await ResourceRequest.find({
        expiryDate: { $gte: from, $lte: to },
        [`notified.${flag}`]: { $ne: true },
        is_verified: true
      });

      for (const req of expiringRequests) {
        try {
          // Get student email
          const student = await Student.findById(req.studentId || req.student);
          if (!student || !student.email) continue;

          // Send email to student and the admin
          await sendExpiringResourceEmail({
            studentEmail: student.email,
            adminEmail,
            resourceRequest: req,
            expiryDate: req.expiryDate,
          });

          notifyStudent(student._id, {
            title: "Resource Expiring Soon",
            body: `Your resource "${req.title}" is expiring on ${req.expiryDate.toDateString()}`
          }).catch(err => {
            console.error("Error sending student web-push notification:", err);
          });

          // Mark as notified for this flag
          req.notified = req.notified || {};
          req.notified[flag] = true;
          await req.save();
        } catch (error) {
          console.error(`Failed to process expiry notification for request ${req._id}:`, error.message);
          // Continue with next request instead of crashing
        }
      }
    }
  } catch (err) {
    console.error("Error checking expiring resource requests:", err);
  }
}

module.exports = { checkExpiringResourceRequests };
