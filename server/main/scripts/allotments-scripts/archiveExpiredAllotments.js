/**
 * archiveExpiredAllotments.js
 *
 * Scans the machineAllotments collection for expired allotments
 * (status === "expired"  OR  endTime has already passed),
 * writes a fully-populated history record to machineHistories,
 * then removes the allotment document.
 *
 * Usage:
 *   node server/main/scripts/archiveExpiredAllotments.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../../.env') });

const mongoose = require('mongoose');
const connectDB = require('../../database/db.js');

const MachineAllotment = require('../../database/machineAllotmentModel.js');
const MachineHistory = require('../../database/machineHistoryModel.js');

// We require the raw models only for population — no ObjectId refs stored in history.
const ResourceRequest = require('../../database/resourceRequestModel.js');
const Student = require('../../database/studentModel.js');
const Teacher = require('../../database/teacherModel.js');
const Machine = require('../../database/machineModel.js');

async function archiveExpiredAllotments() {
  await connectDB();

  const now = new Date();

  // Match by explicit status OR by endTime already past (handles missed status updates)
  const expiredAllotments = await MachineAllotment.find({
    $or: [{ status: 'expired' }, { endTime: { $lte: now } }],
  }).lean();

  if (expiredAllotments.length === 0) {
    console.log('✅ No expired allotments found. Nothing to archive.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${expiredAllotments.length} expired allotment(s). Archiving…`);

  let archived = 0;
  let skipped = 0;

  for (const allotment of expiredAllotments) {
    try {
      // ── 1. Resource Request ────────────────────────────────────────────────
      const request = await ResourceRequest.findById(allotment.resourceRequestId).lean();
      if (!request) {
        console.warn(`  ⚠️  Allotment ${allotment._id}: ResourceRequest not found — skipping.`);
        skipped++;
        continue;
      }

      // ── 2. Student ────────────────────────────────────────────────────────
      const student = await Student.findById(request.studentId).lean();
      if (!student) {
        console.warn(`  ⚠️  Allotment ${allotment._id}: Student not found — skipping.`);
        skipped++;
        continue;
      }

      // ── 3. Teacher ────────────────────────────────────────────────────────
      const teacher = student.teacher ? await Teacher.findById(student.teacher).lean() : null;

      // ── 4. Machine ────────────────────────────────────────────────────────
      const machine = await Machine.findById(allotment.machineId).lean();

      // ── 5. Build history record (all strings, no ObjectId refs) ───────────
      const historyRecord = {
        // Student
        studentName: student.name ?? null,
        studentEmail: student.email ?? null,
        studentRollNo: student.rollNo ?? null,
        studentPhone: student.phone ?? null,
        studentBranch: student.branch ?? null,
        studentInstituteName: student.instituteName ?? null,
        studentInstituteAddress: student.instituteAddress ?? null,

        // Teacher
        teacherName: teacher?.name ?? null,
        teacherEmail: teacher?.email ?? null,
        teacherPhone: teacher?.phone ?? null,
        teacherBranch: teacher?.branch ?? null,

        // Resource Request
        requestTitle: request.title ?? null,
        requestPurpose: request.purpose ?? null,
        requestDuration: request.duration != null ? `${request.duration} day(s)` : null,
        requestedAt: request.createdAt ? request.createdAt.toISOString() : null,

        // Machine
        machineMIGID: machine?.MIGID ?? null,
        machineGpuRam: machine?.gpuRam != null ? `${machine.gpuRam} GB` : null,
        machineIp: machine?.ip ?? null,

        // Allotment
        allotmentDate: allotment.createdAt ? allotment.createdAt.toISOString() : null,
        startTime: allotment.startTime ? allotment.startTime.toISOString() : null,
        endTime: allotment.endTime ? allotment.endTime.toISOString() : null,

        archivedAt: new Date(),
      };

      // ── 6. Insert into machineHistories ───────────────────────────────────
      await MachineHistory.create(historyRecord);

      // ── 7. Remove from machineAllotments ──────────────────────────────────
      await MachineAllotment.findByIdAndDelete(allotment._id);

      console.log(`  ✅ Archived allotment ${allotment._id} (${student.name ?? student.email})`);
      archived++;
    } catch (err) {
      console.error(`  ❌ Error processing allotment ${allotment._id}:`, err.message);
      skipped++;
    }
  }

  console.log(`\nDone. Archived: ${archived} | Skipped: ${skipped}`);
  await mongoose.disconnect();
}

archiveExpiredAllotments().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
