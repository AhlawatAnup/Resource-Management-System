/**
 * seedDenseFutureAllotments.js
 *
 * Creates many future allotments for all machines with random durations and gaps.
 * This version ensures every machine gets multiple allotments.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../../../.env") });

const mongoose        = require("mongoose");
const connectDB       = require("../../database/db.js");
const Student         = require("../../database/studentModel.js");
const Machine         = require("../../database/machineModel.js");
const ResourceRequest = require("../../database/resourceRequestModel.js");
const MachineAllotment = require("../../database/machineAllotmentModel.js.js");

// ── Config ───────────────────────────────────────────────────────────────
const ALLOTMENTS_PER_MACHINE = 3;   // how many future allotments per machine
const MIN_DURATION           = 3;   // days
const MAX_DURATION           = 14;  // days (max model limit is 30)
const MIN_GAP                = 1;   // days between consecutive slots
const MAX_GAP                = 5;
const FIRST_START_MIN        = 1;   // earliest start: N days from now
const FIRST_START_MAX        = 5;   // latest first start: N days from now
// ─────────────────────────────────────────────────────────────────────────

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function daysFromNow(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

async function seed() {
  await connectDB();

  const students = await Student.find({ is_verified: true }).lean();
  const machines  = await Machine.find().lean();

  if (!students.length) {
    console.error("❌ No verified students found.");
    await mongoose.disconnect(); return;
  }
  if (!machines.length) {
    console.error("❌ No machines found.");
    await mongoose.disconnect(); return;
  }

  // Track next available start time per machine
  const machineNextAvailable = {};
  machines.forEach(m => {
    machineNextAvailable[m._id.toString()] = daysFromNow(randInt(FIRST_START_MIN, FIRST_START_MAX));
  });

  console.log(`Seeding future allotments (dense version)…\n`);

  let allotmentCount = 0;

  for (const machine of machines) {
    const machineKey = machine._id.toString();

    for (let i = 0; i < ALLOTMENTS_PER_MACHINE; i++) {
      const student = students[randInt(0, students.length - 1)];

      const duration  = randInt(MIN_DURATION, MAX_DURATION);
      const startTime = new Date(machineNextAvailable[machineKey]);
      const endTime   = addDays(startTime, duration);
      const gap       = randInt(MIN_GAP, MAX_GAP);

      // Advance next available slot for this machine
      machineNextAvailable[machineKey] = addDays(endTime, gap);

      // Resource request timestamp (1-3 days before start)
      const requestedAt = addDays(startTime, -randInt(1, 3));

      // Create ResourceRequest
      const request = await ResourceRequest.create({
        studentId:        student._id,
        machineId:        machine._id,
        title:            `[SEED] Dense Future Request ${allotmentCount + 1}`,
        purpose:          "Seeded dense future allotment for testing",
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

      // Create MachineAllotment
      const allotment = await MachineAllotment.create({
        machineId:         machine._id,
        resourceRequestId: request._id,
        startTime,
        endTime,
        status: "active",
      });

      console.log(
        `✅ [${++allotmentCount}] ${student.name ?? student.email} → ${machine.MIGID}  (${machine.ip})  ` +
        `window: ${startTime.toDateString()} → ${endTime.toDateString()} (${duration}d), gap: ${gap}d`
      );
    }
  }

  console.log("\nSeeding complete. Total allotments:", allotmentCount);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});