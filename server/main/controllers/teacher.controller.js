const Student = require('../database/studentModel');
const Teacher = require('../database/teacherModel');
const Admin = require('../database/adminModel');
const ResourceRequest = require('../database/resourceRequestModel.js');
const { student } = require('../../../public_src/student/js/student.init.js');

exports.teacher_dashboard_data = async (req, res) => {
  const role = req.session.user.role;
  const uid = req.session.user.id;
  // console.log("requested Dashboard data", role, uid);

  if (role === 'teacher') {
    try {
      const teacher = await Teacher.findOne({ _id: uid }).populate({
        path: 'students',
        select: '_id name email rollNo branch',
        populate: {
          path: 'resourceRequests',
          populate: {
            path: 'machineId',
            select: 'MIGID',
          },
        },
      });

      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      // console.log(`Found ${teacher.students.length} students for teacher ${uid}`);

      // Sort students by creation date (most recent first)
      teacher.students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Collect all resource requests from all students
      let allResourceRequests = [];
      for (const student of teacher.students) {
        if (student.resourceRequests && student.resourceRequests.length > 0) {
          // Add student info to each resource request for easier frontend handling
          const studentRequests = student.resourceRequests.map((request) => ({
            ...request._doc,
          }));
          allResourceRequests = allResourceRequests.concat(studentRequests);
        }
      }

      // Sort resource requests by creation date (most recent first)
      allResourceRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // console.log(`Found ${allResourceRequests.length} total resource requests`);

      const fetchedStudents = teacher.students.map((student) => ({
        _id: student._id,
        name: student.name ?? null,
        email: student.email ?? null,
        rollNo: student.rollNo ?? null,
        branch: student.branch ?? null,
      }));
      // Return teacher data with students and resource requests
      return res.json({
        ...teacher._doc,
        role: 'Teacher',
        students: fetchedStudents,
        resourceRequests: allResourceRequests, // All resource requests from students
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch teacher dashboard data' });
    }
  }
};
