import { fetchStudentDetails } from './student-dashboard.service.js';
import { logoutDirectly, formatDate } from '../../../common/js/commons.js';
import { displayStudentDetails, updateDashboardElements } from './student-dashboard.ui.js';
import {
  getLoggedInStudentId,
  showLoadingState,
  getStudentVerificationStatus,
  getStudentStatusClass,
} from '../student.utils.js';

export async function loadStudentDetails() {
  try {
    showLoadingState();

    const studentId = await getLoggedInStudentId();

    if (!studentId) {
      throw new Error('Student ID not found. Please login again.');
    }

    const response = await fetchStudentDetails(studentId);

    if (!response.ok) {
      if (response.status === 404) {
        logoutDirectly();
        return;
      }
      throw new Error('Failed to fetch student details');
    }

    const studentData = await response.json();

    displayStudentDetails(studentData, {
      getStudentVerificationStatus,
      getStudentStatusClass,
      formatDate,
    });

    updateDashboardElements(studentData);
  } catch (error) {
    console.error('Error loading student details:', error);
    logoutDirectly();
  }
}
