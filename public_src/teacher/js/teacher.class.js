const { fetchTeacherFromDB } = require('./teacher.db');

class Teacher extends EventTarget {
  constructor() {
    super();
    this._id = null;
    this.name = null;
    this.email = null;
    this.phone = null;
    this.branch = null;
    this.role = 'Teacher';
    this.students = [];
    this.resourceRequests = []; // Array of requests, each including studentInfo and machineId
    this.is_verified = null;
    this.verification_completed = null;
    this.createdAt = null;
  }

  async setTeacherDetails() {
    const data = await fetchTeacherFromDB();

    for (const [key, value] of Object.entries(data)) {
      if (key === 'students') {
        this.students = Array.isArray(value) ? value : [];
      } else if (key === 'resourceRequests') {
        this.resourceRequests = Array.isArray(value) ? value : [];
      } else {
        this[key] = value;
      }
    }

    console.log('Teacher details updated successfully:', this);
  }
}

module.exports = { Teacher };
