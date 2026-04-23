import { loadStudentDetails } from './student-dashboard.handler.js';
import { registerServiceWorkerAndSubscribe } from '../../../common/js/notification.js';
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  loadStudentDetails();
  registerServiceWorkerAndSubscribe();
});
