/**
 * seedPastAllotments.js
 *
 * Creates past (already-expired) allotments for testing archiveExpiredAllotments.js.
 * It picks real Students, Teachers, Machines from the DB and creates matching
 * ResourceRequests + MachineAllotments whose endTime is in the past.
 *
 * Usage:
 *   node server/main/scripts/seedPastAllotments.js
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../../.env") });

const mongoose = require("mongoose");
const connectDB = require("../../database/db.js");

const Student         = require("../../database/studentModel.js");
const Machine         = require("../../database/machineModel.js");
const ResourceRequest = require("../../database/resourceRequestModel.js");
const MachineAllotment = require("../../database/machineAllotmentModel.js.js");

// How many past allotments to seed
const SEED_COUNT = 5;

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seed() {
  await connectDB();

  // ── Pull real records to reference ────────────────────────────────────────
  const students = await Student.find({ is_verified: true }).limit(10).lean();
  const machines = await Machine.find().lean();

  if (students.length === 0) {
    console.error("❌ No verified students found. Add students first.");
    await mongoose.disconnect();
    return;
  }
  if (machines.length === 0) {
    console.error("❌ No machines found. Add machines first.");
    await mongoose.disconnect();
    return;
  }

  console.log(`Seeding ${SEED_COUNT} past allotment(s)…\n`);

  for (let i = 0; i < SEED_COUNT; i++) {
    const student = students[i % students.length];
    const machine = machines[i % machines.length];

    // Allotment window: started 20 days ago, lasted 7 days → ended 13 days ago
    const startOffset = 20 + i;   // stagger each record slightly
    const duration    = 7;
    const startTime   = daysAgo(startOffset);
    const endTime     = daysAgo(startOffset - duration);
    const requestedAt = daysAgo(startOffset + 2); // requested 2 days before start

    // ── Create a ResourceRequest ───────────────────────────────────────────
    const request = await ResourceRequest.create({
      studentId:        student._id,
      machineId:        machine._id,
      title:            `[SEED] Test Request ${i + 1}`,
      purpose:          "Seeded for archive testing",
      duration,
      version:          2,
      teacher_action:   true,
      teacher_verified: true,
      admin_action:     true,
      admin_verified:   true,
      is_verified:      true,
      vmCredentials: {
        ip:    machine.ip,
        migId: machine.MIGID,
      },
      createdAt:  requestedAt,
      updatedAt:  requestedAt,
    });

    // ── Create a MachineAllotment (expired) ────────────────────────────────
    const allotment = await MachineAllotment.create({
      machineId:         machine._id,
      resourceRequestId: request._id,
      startTime,
      endTime,
      status: "expired",
      createdAt: startTime,
      updatedAt: endTime,
    });

    console.log(
      `  ✅ [${i + 1}] Allotment ${allotment._id}` +
      `  student: ${student.name ?? student.email}` +
      `  machine: ${machine.MIGID}` +
      `  ${startTime.toDateString()} → ${endTime.toDateString()}`
    );
  }

  console.log("\nSeeding complete. Now run archiveExpiredAllotments.js to archive them.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
