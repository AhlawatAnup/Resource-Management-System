const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");

exports.dashboard_data = async (req, res) => {
  const role = req.session.user.role;
  const uid = req.session.user.id;
  console.log("requested Dashboard data", role, uid);

  if (role === "student") {
    const { name, rollNo, branch, teacher_id } = req.body;
    if (!name || !rollNo || !branch || !teacher_id) {
      return res.status(400).json({ error: "All student fields required" });
    }
    const student = new Student({
      email: req.session.email,
      name,
      rollNo,
      branch,
      teacher: teacher_id,
    });

    const savedStudent = await student.save();

    //   ADD THIS STUDENT TO THE TEACHER DB AS WELL
    const teacher = await Teacher.findById(teacher_id);
    teacher.students.push(savedStudent._id);
    await teacher.save();

    // Attach session
    req.session.user = {
      email: req.session.email,
      role: req.session.role,
      id: savedStudent._id,
    };

    return res.json({ message: "Student registered successfully" });
  }

  if (role === "teacher") {
    try {
      const teacher = await Teacher.findOne({ _id: uid });
      // console.log(teacher);
      return res.json({ ...teacher._doc, role: "Teacher" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch teachers" });
    }
  }
};

exports.student_data = async (req, res) => {
  const { stu_id } = req.params;
  console.log("requested Student data", stu_id);

  try {
    const student = await Student.findOne({ _id: stu_id });
    console.log(student);
    return res.json({ ...student._doc });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch student" });
  }
};
