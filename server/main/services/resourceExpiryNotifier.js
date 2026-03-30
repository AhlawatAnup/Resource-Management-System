const emailService = require("../utils/email/emails.service.js");
const MachineAllotment = require("../database/machineAllotmentModel");

async function sendExpiryEmails() {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const allotments = await MachineAllotment.find({
      endTime: {
        $gte: now,
        $lt: next24Hours
      },
      expiryNotified: false
    })
    .populate({
      path: "resourceRequestId",
      populate: {
        path: "studentId"
      }
    })

    console.log(`Found ${allotments.length} expiring allotments`);

    for (const allotment of allotments) {
      const resourceRequest = allotment?.resourceRequestId;
      const student = resourceRequest?.studentId;
      const machine = allotment?.machineId;

      if (
        !student?.email ||
        !student?.name ||
        !resourceRequest?.title ||
        !allotment?.endTime
      ) {
        console.warn("⚠️ Skipping invalid allotment:", allotment._id);
        continue;
      }

      await emailService.sendResourceAllotmentExpiryTodayEmail({
        studentEmail: student.email,
        studentName: student.name,
        requestTitle: resourceRequest.title,
        endTime: allotment.endTime,
      });

      // prevent duplicate emails
      allotment.expiryNotified = true;
      await allotment.save();
    }

  } catch (err) {
    console.error("Error in expiry email job:", err);
  }
}

module.exports = {
  sendExpiryEmails,
};