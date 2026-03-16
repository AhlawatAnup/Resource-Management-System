/**
 * generateMachineSlots.js
 *
 * Creates 10 allotment slots for ONE machine.
 * Each slot lasts 2–5 days.
 * Some slots are consecutive, some have gaps.
 *
 * Usage:
 * node server/main/scripts/generateMachineSlots.js
 */

const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../../../../.env"),
});

const mongoose = require("mongoose");
const connectDB = require("../../database/db.js");

const MachineAllotment = require("../../database/machineAllotmentModel.js");

const MACHINE_ID = "69b69243dcb39f68ee912f34";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateSlots() {
  await connectDB();

  const TOTAL_SLOTS = 10;

  console.log(`Generating ${TOTAL_SLOTS} allotments...\n`);

  let currentDate = new Date("2026-03-01T09:00:00Z");

  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const duration = randomInt(2, 5); // slot duration

    const startTime = new Date(currentDate);

    const endTime = new Date(startTime);
    endTime.setDate(endTime.getDate() + duration);

    const status = endTime < new Date() ? "expired" : "active";

    const mongoose = require("mongoose");

await MachineAllotment.create({
  machineId: MACHINE_ID,
  resourceRequestId: new mongoose.Types.ObjectId(), // dummy request
  startTime,
  endTime,
  status,
  createdAt: startTime
});

    console.log(
      `Slot ${i + 1}: ${startTime.toISOString().slice(0,10)} → ${endTime
        .toISOString()
        .slice(0,10)}`
    );

    /**
     * Random gap logic
     * 50% chance consecutive
     * 50% chance gap of 1–3 days
     */
    const gap = Math.random() < 0.5 ? 0 : randomInt(1, 3);

    currentDate = new Date(endTime);
    currentDate.setDate(currentDate.getDate() + gap);
  }

  console.log("\n✅ Allotments created successfully.");

  await mongoose.disconnect();
}

generateSlots().catch((err) => {
  console.error(err);
  process.exit(1);
});