// HPACK CONFIG FILE
const path = require('path');

module.exports = {
  entries: {
    // home: "./public_src/home/html/home.html",
    // dashboard: "./public_src/dashboard/html/dashboard.html",
    // inspection: "./public_src/control_system/html/inspection.control.html",
    admin: './public_src/admin/html/admin.html',
    student: './public_src/student/html/student.html',
    teacher:'./public_src/teacher/html/teacher.html'
  },

  output: {
    path: path.resolve(__dirname, 'public'),
  },
};
