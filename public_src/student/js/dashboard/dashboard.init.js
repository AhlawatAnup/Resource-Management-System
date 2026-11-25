import { registerServiceWorkerAndSubscribe } from '../../../common/notifications/notification.js';

import {
  showLoadingState,
  getStudentVerificationStatus,
  getStudentStatusClass,
} from '../student.util.js';

import { logoutDirectly } from '../../../common/utils/commons.utils.js';

// import { displayStudentDetails, updateDashboardElements } from './dashboard.utils.js';

import { setupDarkMode } from '../../../common/darkmode/darkmode.js';

import { student } from '../student.init.js';
import './dashboard.ui.js';

// //set student object details
// export async function fetchStudentDetails() {
//   await student.setStudentDetails();
// }

//HANDLERS
export async function loadStudentDetails() {
  try {
    showLoadingState();
    await student.setStudentDetails();
    getStudentStatusClass(student);
    getStudentVerificationStatus(student);

    // console.log('student details: ', student);

    student.dispatchEvent(new CustomEvent('student_ready'));
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
