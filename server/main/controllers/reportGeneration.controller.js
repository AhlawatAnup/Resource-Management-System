const mongoose = require('mongoose');
const { getStatsConnection } = require('../database/connectStatsDB');
const { getMachineStatModel } = require('../database/machineStatsModel');
const MachineAllotment = require('../database/machineAllotmentModel');
const History = require('../database/machineHistoryModel');
const Student = require('../database/studentModel');
const Teacher = require('../database/teacherModel');
const doc = require('pdfkit');
const { default: index } = require('toastify');

async function getStatsByResReqId(req, res) {
  try {
    const { resourceRequestId } = req.params;

    const allotment = await MachineAllotment.findOne({
      resourceRequestId: new mongoose.Types.ObjectId(resourceRequestId),
    })
      .populate({
        path: 'machineId',
        options: { includeUnavailable: true, includeDeleted: true },
      })
      .setOptions({ includeInactive: true, includeDeleted: true });

    if (!allotment) return res.status(404).json({ message: 'Allotment not found' });

    const migid = allotment.machineId.MIGID;
    const { startTime, endTime } = allotment;

    const MachineStat = getMachineStatModel(getStatsConnection());
    const rawStats = await MachineStat.find({
      'metadata.MIGID': migid,
      timestamp: { $gte: startTime, $lte: endTime },
    })
      .sort({ timestamp: 1 })
      .lean();

    // Convert to % and clean structure
    let formatted = rawStats.map((s) => ({
      timestamp: s.timestamp,
      cpu: +(s.cpuPerc * 100).toFixed(2),
      mem: +((s.memUseMiB / s.memTotalMiB) * 100).toFixed(2),
      gpu: +((s.gpuVramMiB / s.gpuTotalMiB) * 100).toFixed(2),
    }));

    const averagedData = averageByInterval(formatted, 60);

    res.json({
      migid,
      startTime,
      endTime,
      data: averagedData,
    });
  } catch (err) {
    console.error('getMachineStats error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function averageByInterval(data, intervalMinutes = 60) {
  const intervalMs = intervalMinutes * 60 * 1000;
  const buckets = {};

  for (const point of data) {
    const key = Math.floor(new Date(point.timestamp).getTime() / intervalMs) * intervalMs;

    if (!buckets[key]) buckets[key] = { timestamp: new Date(key), cpu: [], mem: [], gpu: [] };
    buckets[key].cpu.push(point.cpu);
    buckets[key].mem.push(point.mem);
    buckets[key].gpu.push(point.gpu);
  }

  const avg = (arr) => +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2);

  return Object.values(buckets)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((b) => ({ timestamp: b.timestamp, cpu: avg(b.cpu), mem: avg(b.mem), gpu: avg(b.gpu) }));
}

async function getStatsForCombinedReport(req, res) {
  try {
    const { from_date, to_date } = req.query;
    const date_range_filter = {
      $match: {
        'machineAllotment.startTime': { $gte: new Date(from_date) },
        'machineAllotment.endTime': { $lte: new Date(to_date) },
      },
    };

    const [
      totals,
      unique,
      verifications,
      per_machine,
      per_branch,
      top_students,
      per_teacher,
      entries,
      currently_active,
      total_students,
      total_teachers,
    ] = await Promise.all([
      //totals
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: null,
            total_requests: { $sum: 1 },
            total_hours: {
              $sum: {
                $divide: [
                  { $subtract: ['$machineAllotment.endTime', '$machineAllotment.startTime'] },
                  3600000,
                ],
              },
            },
          },
        },
      ]),

      //unique
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: null,
            studentsSet: { $addToSet: '$resourceRequest.studentId' },
            teachersSet: { $addToSet: '$student.teacherId' },
            machinesSet: { $addToSet: '$machineAllotment.machineId' },
          },
        },
        {
          $project: {
            unique_students: { $size: '$studentsSet' },
            unique_teachers: { $size: '$teachersSet' },
            unique_machines: { $size: '$machinesSet' },
          },
        },
      ]),

      //verifications
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: null,
            admin_or_teacher_verified: {
              $sum: {
                $cond: [
                  {
                    $or: ['$resourceRequest.admin_verified', '$resourceRequest.teacher_verified'],
                  },
                  1,
                  0,
                ],
              },
            },
            both_verified: {
              $sum: {
                $cond: [
                  {
                    $and: ['$resourceRequest.admin_verified', '$resourceRequest.teacher_verified'],
                  },
                  1,
                  0,
                ],
              },
            },
            admin_only: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      '$resourceRequest.admin_verified',
                      { $not: '$resourceRequest.teacher_verified' },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            teacher_only: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      '$resourceRequest.teacher_verified',
                      { $not: '$resourceRequest.admin_verified' },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      //per_machine
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: { $ifNull: ['$machine.name', 'Unknown'] },
            count: { $sum: 1 },
            hours: {
              $sum: {
                $divide: [
                  { $subtract: ['$machineAllotment.endTime', '$machineAllotment.startTime'] },
                  3600000,
                ],
              },
            },
          },
        },
      ]),

      //per_branch
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: '$student.branch',
            count: { $sum: 1 },
          },
        },
      ]),

      //top_students
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: '$resourceRequest.studentId',
            name: { $first: '$student.name' },
            count: { $sum: 1 },
            hours: {
              $sum: {
                $divide: [
                  { $subtract: ['$machineAllotment.endTime', '$machineAllotment.startTime'] },
                  3600000,
                ],
              },
            },
          },
        },
        { $sort: { hours: -1 } },
        { $limit: 10 },
      ]),

      //per_teacher
      History.aggregate([
        date_range_filter,
        {
          $group: {
            _id: '$student.teacherId',
            name: { $first: '$teacher.name' },
            count: { $sum: 1 },
          },
        },
      ]),

      //entries
      History.aggregate([
        date_range_filter,
        {
          $match: {
            $or: [{ 'student.teacher_verified': true }, { 'student.admin_verified': true }],
          },
        },
        {
          $project: {
            _id: 0,
            id: '$_id',
            student_name: '$student.name',
            student_email: '$student.email',
            rollNo: '$student.rollNo',
            branch: '$student.branch',
            institute: '$student.instituteName',
            teacher_name: '$teacher.name',
            teacher_email: '$teacher.email',
            title: '$resourceRequest.title',
            purpose: '$resourceRequest.purpose',
            duration_requested_days: '$resourceRequest.duration',
            machine_name: '$machine.name',
            gpuRam: '$machine.gpuRam',
            ram: '$machine.ram',
            ip: '$machine.ip',
            port: '$machine.port',
            startTimeRaw: '$machineAllotment.startTime',
            endTimeRaw: '$machineAllotment.endTime',
            usage_hours: {
              $divide: [
                { $subtract: ['$machineAllotment.endTime', '$machineAllotment.startTime'] },
                3600000,
              ],
            },
            is_verified: {
              $or: ['$resourceRequest.admin_verified', '$resourceRequest.teacher_verified'],
            },
            admin_verified: '$resourceRequest.admin_verified',
            teacher_verified: '$resourceRequest.teacher_verified',
            deletedBy: '$deletedBy',
            createdAtRaw: '$createdAt',
            req_createdRaw: '$resourceRequest.createdAt',
          },
        },
      ]),

      //currently_active

      MachineAllotment.aggregate([
        {
          $match: {
            isActive: true,
            endTime: { $gte: new Date() },
          },
        },
        {
          $group: {
            _id: null,
            active_count: { $sum: { $cond: [{ $lte: ['$startTime', new Date()] }, 1, 0] } },
            active_hours: {
              $sum: {
                $cond: [
                  { $eq: ['$isActive', true] },
                  { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 3600000] },
                  0,
                ],
              },
            },
            upcoming_count: { $sum: { $cond: [{ $gte: ['$startTime', new Date()] }, 1, 0] } },
          },
        },
      ]),

      //total students (total on platform)
      Student.countDocuments(),

      //total teachers (on platform)
      Teacher.countDocuments(),
    ]);

    const total_counts = totals[0] || { total_requests: 0, total_hours: 0 };
    const totalHrsRounded = Number(total_counts.total_hours.toFixed(1));
    const total_days = Number((totalHrsRounded / 24).toFixed(1));
    const unique_counts = unique[0] || {
      unique_students: 0,
      unique_teachers: 0,
      unique_machines: 0,
    };
    const verification_counts = verifications[0] || {
      admin_or_teacher_verified: 0,
      both_verified: 0,
      admin_only: 0,
      teacher_only: 0,
    };
    const avg_hrs_per_req = total_counts.total_requests
      ? totalHrsRounded / total_counts.total_requests
      : 0;
    const start_date = new Date(from_date);
    const end_date = new Date(to_date);
    const per_machine_count = {};
    const per_machine_hours = {};
    per_machine.forEach((item) => {
      per_machine_count[item._id] = item.count;
      per_machine_hours[item._id] = item.hours;
    });
    const per_branch_count = {};
    per_branch.forEach((item) => {
      per_branch_count[item._id] = item.count;
    });

    const per_teacher_count = {};
    per_teacher.forEach((item) => {
      const teacherName = item.name || 'Unknown Teacher';

      // Check if "New Teacher" is ALREADY a key inside per_teacher_count
      if (per_teacher_count.hasOwnProperty(teacherName)) {
        // 🔴 TRUE: A teacher with this exact name was already added!
        // Create a unique key so we don't overwrite the first teacher's count
        const uniqueKey = `${teacherName} (${item._id})`;
        per_teacher_count[uniqueKey] = item.count;
      } else {
        // 🟢 FALSE: This is the first time we're seeing this teacher name!
        per_teacher_count[teacherName] = item.count;
      }
    });

    const active = currently_active[0] || {
      active_count: 0,
      active_hours: 0,
      upcoming_count: 0,
    };
    const currently_active_req = active.active_count;
    const active_hours = active.active_hours;
    const upcoming_req = active.upcoming_count;

    const formatDateTime = (d) => {
      if (!d) return '';
      const dateObj = new Date(d);
      const dateStr = dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = dateObj.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      return `${dateStr}, ${timeStr}`;
    };

    const formatDate = (d) => {
      if (!d) return '';
      const dateObj = new Date(d);

      return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);

    const formattedEntries = entries.map((doc, index) => {
      const rawHours = doc.usage_hours || 0;
      const usageHoursRounded = Number(rawHours.toFixed(1));
      const usageDaysRounded = Number((usageHoursRounded / 24).toFixed(2));

      return {
        idx: index + 1,
        id: String(doc.id),
        student_name: doc.student_name || '',
        student_email: doc.student_email || '',
        rollNo: doc.rollNo || '',
        branch: doc.branch || '',
        institute: doc.institute || '',
        teacher_name: doc.teacher_name || '',
        teacher_email: doc.teacher_email || '',
        title: doc.title || '',
        purpose: doc.purpose || '',
        duration_requested_days: doc.duration_requested_days || 0,
        machine_name: doc.machine_name || '',
        gpuRam: doc.gpuRam || 0,
        ram: doc.ram || 0,
        ip: doc.ip || '',
        port: doc.port || 0,
        start: formatDateTime(doc.startTimeRaw),
        end: formatDateTime(doc.endTimeRaw),
        usage_hours: usageHoursRounded,
        usage_days: usageDaysRounded,
        is_verified: Boolean(doc.is_verified),
        admin_verified: Boolean(doc.admin_verified),
        teacher_verified: Boolean(doc.teacher_verified),
        deletedBy: doc.deletedBy || 'system',
        createdAt: formatDateTime(doc.createdAtRaw),
        req_created: formatDateTime(doc.req_createdRaw),
      };
    });

    const payload = {
      dashboard: {
        total_requests: total_counts.total_requests,
        total_hours: totalHrsRounded,
        total_days: total_days,
        unique_students: unique_counts.unique_students,
        unique_teachers: unique_counts.unique_teachers,
        unique_machines: unique_counts.unique_machines,
        admin_or_teacher_verified: verification_counts.admin_or_teacher_verified,
        both_verified: verification_counts.both_verified,
        admin_only: verification_counts.admin_only,
        teacher_only: verification_counts.teacher_only,
        avg_hours_per_request: avg_hrs_per_req,
        date_range_start: formattedStartDate,
        date_range_end: formattedEndDate,
        per_machine_count: per_machine_count,
        per_machine_hours: per_machine_hours,
        per_branch_count: per_branch_count,
        top_students: top_students,
        per_teacher_count: per_teacher_count,
        excluded_count: 0,
        duplicates_removed: 0,
        currently_active_req: currently_active_req,
        currently_active_hrs: active_hours,
        upcoming_req_count: upcoming_req,
        total_students: total_students,
        total_teachers: total_teachers,
      },
      entries: formattedEntries,
    };

    return res.status(200).json({
      message: 'data processed and sent in payload successfully!',
      payload,
    });
  } catch (error) {
    console.log('error in generating and downloading report: ', error);
    return res.status(500).json({
      message: 'error in report generation!',
    });
  }
}

module.exports = { getStatsByResReqId, getStatsForCombinedReport };
