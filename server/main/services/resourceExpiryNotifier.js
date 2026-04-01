const emailService = require("../utils/email/emails.service.js");
const MachineAllotment = require("../database/machineAllotmentModel");

async function sendAllotmentNotifications() {
  try {
    const now = new Date(); 

    const startOfTodayIST = new Date(now);
    startOfTodayIST.setHours(0, 0, 0, 0);

    const endOfTodayIST = new Date(now);
    endOfTodayIST.setHours(23, 59, 59, 999);

    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // --- QUERY 1: STARTED TODAY (IST) ---
    const startingToday = await MachineAllotment.find({
      startTime: { $gte: startOfTodayIST, $lte: endOfTodayIST },
      startNotified: false
    }).populate({ path: "resourceRequestId", populate: { path: "studentId" } });

    console.log(`[Notifications] Allotments starting today (IST): ${startingToday.length}`);

    for (const allotment of startingToday) {
      const student = allotment.resourceRequestId?.studentId;
      if (!student?.email) continue;

      await emailService.sendResourceAllotmentStartedEmail({
        studentEmail: student.email,
        studentName: student.name,
        requestTitle: allotment.resourceRequestId.title,
        startTime: allotment.startTime,
      });

      allotment.startNotified = true;
      await allotment.save();
    }

    // --- QUERY 2: EXPIRING IN NEXT 24 HOURS ---
    const expiringSoon = await MachineAllotment.find({
      endTime: { $gte: now, $lt: next24Hours },
      expiryNotified: false
    }).populate({ path: "resourceRequestId", populate: { path: "studentId" } });

    console.log(`[Notifications] Allotments expiring in next 24h: ${expiringSoon.length}`);

    for (const allotment of expiringSoon) {
      const student = allotment.resourceRequestId?.studentId;
      if (!student?.email) continue;

      await emailService.sendResourceAllotmentExpiryTodayEmail({
        studentEmail: student.email,
        studentName: student.name,
        requestTitle: allotment.resourceRequestId.title,
        endTime: allotment.endTime,
      });

      allotment.expiryNotified = true;
      await allotment.save();
    }

  } catch (err) {
    console.error("Error in notification job:", err);
  }
}

module.exports = { sendAllotmentNotifications };