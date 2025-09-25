const Student = require("../database/studentModel");
const Teacher = require("../database/teacherModel");
const Admin = require("../database/adminModel");

exports.teacher_dashboard_data = async (req, res) => {
  const role = req.session.user.role;
  const uid = req.session.user.id;
  console.log("requested Dashboard data", role, uid);

  if (role === "teacher") {
    try {
      const teacher = await Teacher.findOne({ _id: uid })
        .populate({
          path: 'students',
          populate: {
            path: 'resourceRequests'
          }
        });
      
      if (!teacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      console.log(`Found ${teacher.students.length} students for teacher ${uid}`);

      // Collect all resource requests from all students
      let allResourceRequests = [];
      for (const student of teacher.students) {
        if (student.resourceRequests && student.resourceRequests.length > 0) {
          // Add student info to each resource request for easier frontend handling
          const studentRequests = student.resourceRequests.map(request => ({
            ...request._doc,
            studentInfo: {
              _id: student._id,
              name: student.name,
              rollNo: student.rollNo,
              email: student.email,
              branch: student.branch
            }
          }));
          allResourceRequests = allResourceRequests.concat(studentRequests);
        }
      }

      // Sort resource requests by creation date (most recent first)
      allResourceRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log(`Found ${allResourceRequests.length} total resource requests`);

      // Return teacher data with students and resource requests
      return res.json({ 
        ...teacher._doc, 
        role: "Teacher",
        students: teacher.students.map(student => student._id), // Return array of student IDs for compatibility
        resourceRequests: allResourceRequests // All resource requests from students
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch teacher dashboard data" });
    }
  }
};
