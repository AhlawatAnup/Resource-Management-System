const Student = require('../database/studentModel');
const ResourceRequest = require('../database/resourceRequestModel');

/**
 * Utility functions to manage the bidirectional relationship between 
 * students and their resource requests
 */

/**
 * Add a resource request ID to a student's resourceRequests array
 */
async function addResourceRequestToStudent(studentId, resourceRequestId) {
  try {
    await Student.findByIdAndUpdate(
      studentId,
      { $addToSet: { resourceRequests: resourceRequestId } }
    );
    // console.log(`Added resource request ${resourceRequestId} to student ${studentId}`);
    return true;
  } catch (error) {
    console.error('Error adding resource request to student:', error);
    return false;
  }
}
module.exports = {
  addResourceRequestToStudent,
};