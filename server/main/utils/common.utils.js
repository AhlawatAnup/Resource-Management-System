const mongoose = require("mongoose");
const Student = require("../database/studentModel.js");
const Teacher = require("../database/teacherModel.js");
const ResourceRequest = require("../database/resourceRequestModel");
const Machine = require("../database/machineModel");
const MachineAllotment = require("../database/machineAllotmentModel.js");

const isValidDuration = function (duration) {
  return Number.isInteger(duration) && duration >= 1 && duration <= 15;
};

const fetchMachineById = async (machineId) => {
  if (!mongoose.Types.ObjectId.isValid(machineId)) return null;
  return Machine.findById(machineId)
    .select("_id MIGID gpuRam")
    .lean();
};

// IST offset in ms
const IST_OFFSET = 5.5 * 60 * 60 * 1000;

// Convert UTC date → IST date parts (year, month, day)
const getISTDateParts = (date) => {
  const istTime = new Date(date.getTime() + IST_OFFSET);

  return {
    year: istTime.getUTCFullYear(),
    month: istTime.getUTCMonth(),
    day: istTime.getUTCDate()
  };
};

// Create UTC Date from IST time
const createUTCFromIST = (year, month, day, hour, minute) => {
  // IST → UTC (subtract 5:30)
  return new Date(Date.UTC(year, month, day, hour - 5, minute - 30));
};

// Get next IST day (based on a UTC date)
const getNextISTDay = (date) => {
  const { year, month, day } = getISTDateParts(date);

  return {
    year,
    month,
    day: day + 1
  };
};

// Main function: calculate start & end time
const calculateAllotmentWindow = (lastEndTime, durationDays) => {
  const baseDate = lastEndTime ? new Date(lastEndTime) : new Date();

  // Step 1: next IST day
  const { year, month, day } = getNextISTDay(baseDate);

  // Step 2: start → 00:30 IST
  const startTime = createUTCFromIST(year, month, day, 0, 30);

  // Step 3: end → duration days later at 23:30 IST
  const endDay = day + (durationDays - 1);

  const endTime = createUTCFromIST(year, month, endDay, 23, 30);

  return { startTime, endTime };
};

const validateMachineInput = (body) => {
  let {
    MIGID,
    gpuRam,
    ram,
    ip,
    port,
    user,
    name,
  } = body;

  // --- Trim strings ---
  MIGID = MIGID?.trim();
  ip = ip?.trim();
  user = user?.trim();
  name = name?.trim();

  // --- Required string fields ---
  if (!MIGID) return { error: 'MIGID is required' };
  if (!ip) return { error: 'ip is required' };
  if (!user) return { error: 'user is required' };
  if (!name) return { error: 'name is required' };

  // --- GPU (optional) ---
  let gpu = null;
  if (gpuRam !== '' && gpuRam !== undefined && gpuRam !== null) {
    gpu = Number(gpuRam);
    if (Number.isNaN(gpu) || gpu < 0) {
      return { error: 'gpuRam must be a non-negative number' };
    }
  }

  // --- RAM (required) ---
  if (ram === '' || ram === undefined || ram === null) {
    return { error: 'ram is required' };
  }

  const systemRam = Number(ram);
  if (Number.isNaN(systemRam) || systemRam <= 0) {
    return { error: 'ram must be a positive number' };
  }

  // --- PORT (required, no default) ---
  if (port === '' || port === undefined || port === null) {
    return { error: 'port is required' };
  }

  const machinePort = Number(port);
  if (Number.isNaN(machinePort) || machinePort <= 0) {
    return { error: 'port must be a valid number' };
  }

  // --- Cleaned data ---
  return {
    value: {
      MIGID,
      gpuRam: gpu,
      ram: systemRam,
      ip,
      port: machinePort,
      user,
      name,
    }
  };
};

const deleteStudentDependencies = async (student) => {
  try {
    console.log("delete student dependcies called")
    if (!student) {
      throw new Error("Student object is required");
    }

    //TO DO: add to history first

    // 1️⃣ Fetch all resource request IDs
    const requests = await ResourceRequest.find({ studentId: student._id }).select('_id');
    const requestIds = requests.map(r => r._id);

    // 2️⃣ Delete MachineAllotments
    await MachineAllotment.deleteMany({
      resourceRequestId: { $in: requestIds }
    });

    // 3️⃣ Delete ResourceRequests
    await ResourceRequest.deleteMany({
      _id: { $in: requestIds }
    });

    // 4️⃣ Clear student's resourceRequests array
    await Student.updateOne(
      { _id: student._id },
      { $set: { resourceRequests: [] } }
    );

    return {
      success: true,
      message: "Student dependencies deleted & references cleared"
    };

  } catch (err) {
    console.error("Error deleting student dependencies:", err.message);
    throw err;
  }
};
const resetStudentVerificationFlags = async (studentId) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        $set: {
          teacher_verified: false,
          teacher_action: false,
          admin_verified: false,
          admin_action: false,
          is_verified: false
        }
      },
      { new: true } 
    );

    if (!updatedStudent) {
      throw new Error("Student not found");
    }

    return {
      success: true,
      message: "Student verification flags reset",
      data: updatedStudent
    };

  } catch (err) {
    console.error("Error resetting student flags:", err.message);
    throw err;
  }
};

const unverifyStudent = async (studentId) => {
  try {
    if (!studentId) {
      throw new Error("studentId is required");
    }

    // 1️⃣ Fetch student once
    const student = await Student.findById(studentId);

    if (!student) {
      throw new Error("Student not found");
    }

    // 2️⃣ Delete all dependencies (requests + allotments + clear array)
    await deleteStudentDependencies(student);

    // 3️⃣ Reset verification flags on student
    const updatedStudent = await resetStudentVerificationFlags(studentId);

    return {
      success: true,
      message: "Student unverified successfully",
      data: updatedStudent
    };

  } catch (err) {
    console.error("Error unverifying student:", err.message);
    throw err;
  }
};


const deleteStudent = async (studentId) => {
  console.log("detle student called")
  try {

    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const student = await Student.findById(studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    await deleteStudentDependencies(student);

    // Delete student
    await Student.deleteOne({ _id: studentId });

    return {
      success: true,
      message: "Student and related data deleted successfully"
    };

  } catch (err) {
    console.error("Error deleting student:", err.message);
    throw new Error(err.message || "Failed to delete student");
  }
};


const deleteTeacher = async (teacherId) => {

  console.log("detle teacher called")
  if (!teacherId) {
    throw new Error("Teacher ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new Error("Invalid Teacher ID");
  }

  // 1. Get teacher
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const studentIds = teacher.students || [];

  // 2. Delete all students (this will cascade further)
  for (const studentId of studentIds) {
    await deleteStudent(studentId);
  }

  // 3. Delete teacher
  await Teacher.deleteOne({ _id: teacherId });

  return "Teacher and all associated students deleted successfully";
};


module.exports = {
  isValidDuration,
  fetchMachineById,
  calculateAllotmentWindow,
  validateMachineInput,
  deleteStudentDependencies,
  deleteStudent,
  deleteTeacher
};