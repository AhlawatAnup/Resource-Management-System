import { registerServiceWorkerAndSubscribe } from '../../../common/notifications/notification.js';
import {
  showLoadingState,
  getStudentVerificationStatus,
  getStudentStatusClass,
} from '../student.util.js';
import { logoutDirectly, formatDate } from '../../../common/utils/commons.utils.js';
import { displayStudentDetails, updateDashboardElements } from './dashboard.ui.js';
import { setupDarkMode } from '../../../common/darkmode/darkmode.js';
// API CALLS
export async function fetchStudentDetails(studentId) {
  const response = await fetch(`/dashboard/student/student_data/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export async function getLoggedInStudentId() {
  try {
    const response = await fetch('/dashboard/current-user-id', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.id) {
        // Store for future use
        // localStorage.setItem('studentId', data.id);
        return data.id;
      }
    }
  } catch (error) {
    console.error('Error fetching user ID from session:', error);
  }

  return null;
}

//HANDLERS
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


//INIT

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  loadStudentDetails();
  registerServiceWorkerAndSubscribe();
});