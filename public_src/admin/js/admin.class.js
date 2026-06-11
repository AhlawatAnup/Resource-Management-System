class Admin extends EventTarget {
  constructor() {
    super();
    // USER INFO
    this.allTeachers = null;
    this.verifiedTeachers = null;
    this.unverifiedTeachers = null;
    this.allStudents = null;
    this.verifiedStudents = null;
    this.unverifiedStudents = null;
    this.resource_requests = null;
  }
}

module.exports = { Admin };
