import { loadStudentDetails } from './student-dashboard.handler.js';
import { registerServiceWorkerAndSubscribe } from '../../../common/js/notification.js';

document.addEventListener('DOMContentLoaded', () => {
    loadStudentDetails();
    registerServiceWorkerAndSubscribe();
});