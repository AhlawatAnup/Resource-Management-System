// HPACK CONFIG FILE
const path = require('path');

module.exports = {
  entries: {
    // dashboard: "./public_src/dashboard/html/dashboard.html",
    // inspection: "./public_src/control_system/html/inspection.control.html",
    home: './public_src/home/html/home.html',
    admin: './public_src/admin/html/admin.html',
    student: './public_src/student/html/student.html',
    teacher: './public_src/teacher/html/teacher.html',
    teacher_registration: './public_src/registration/teacher/html/teacher.registration.html',
    student_registration: './public_src/registration/student/html/student.registration.html',
  },

  output: {
    path: path.resolve(__dirname, 'public'),
  },
};
