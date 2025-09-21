const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");
const path = require("path");
const publicPath = path.join(__dirname, "../../../public");

exports.roleBasedDashboard = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/"); // redirect if not logged in
  }

  const role = req.session.user?.role;
  if (!role) {
    return res.redirect("/"); // fallback if role missing
  }

  // You can customize which HTML to send based on role
  switch (role.toLowerCase()) {
    case "student":
      return res.sendFile(path.join(publicPath, "dashboard/student", "student.dashboard.html"));
    case "teacher":
      return res.sendFile(path.join(publicPath, "dashboard/teacher", "teacher.dashboard.html"));
    case "admin":
      return res.sendFile(path.join(publicPath, "dashboard/admin", "admin.dashboard.html"));
  }
};

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
