const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");

exports.teacher_dashboard_data = async (req, res) => {
  const role = req.session.user.role;
  const uid = req.session.user.id;
  console.log("requested Dashboard data", role, uid);

  if (role === "student") {
  try {
    const student = await Student.findOne({ _id: uid });
    return res.json({ ...student._doc, role: "Student" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch student" });
  }
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
