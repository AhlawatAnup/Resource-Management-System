// main.js

import { handleLoadViewRequests } from './student-view-request.handler.js';
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

document.addEventListener('DOMContentLoaded', async () => {
    setupDarkMode();
    await handleLoadViewRequests();
});