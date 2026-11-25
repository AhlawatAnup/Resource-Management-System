const { fetchStudentFromDB } = require('./student.db');

class Student extends EventTarget {
  constructor() {
    super();
    this._id = null;
    this.name = null;
    this.email = null;
    this.rollNo = null;
    this.phone = null;
    this.branch = null;
    this.instituteName = null;
    this.instituteAddress = null;
    this.teacher = null; // sent by "dashboard/student/:stu_id" in the format: teacher:{id: .... , name: .....}
    this.resourceRequests = null;
    this.teacher_action = null;
    this.teacher_verified = null;
    this.admin_action = null;
    this.admin_verified = null;
    this.is_verified = null;
    this.createdAt = null;
    this.status = null;
    this.verificationStatus = null;
    this.verificationCode = 0;
    this.resourceUtilizationScore = null;
  }

  async setStudentDetails() {
    const data = await fetchStudentFromDB();

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key) && key in this) {
        this[key] = data[key];
      }
    }

    // console.log('Student details updated successfully:', this);
  }
}

module.exports = { Student };
