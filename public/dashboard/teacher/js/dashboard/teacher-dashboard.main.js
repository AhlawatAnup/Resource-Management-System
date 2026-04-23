import { registerServiceWorkerAndSubscribe } from '../../../common/js/notification.js';

import {
  handleDashboardLoad,
  filterStudent,
  handleStudentVerification,
} from './teacher-dashboard.handler.js';

import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

// Init
document.addEventListener('DOMContentLoaded', function () {
  setupDarkMode();
  handleDashboardLoad();
  registerServiceWorkerAndSubscribe();
});

// Search
document.getElementById('searchInput').addEventListener('input', (e) => {
  filterStudent(e.target.value);
});

// Approve / Decline (event delegation)
document.getElementById('contactTableBody').addEventListener('click', (e) => {
  const button = e.target.closest('.approve-btn, .decline-btn');

  if (button) {
    const studentId = button.getAttribute('data-student-id');
    const action = button.getAttribute('data-action');
    const isVerified = action === 'approve';

    handleStudentVerification(studentId, isVerified);
  }
});
