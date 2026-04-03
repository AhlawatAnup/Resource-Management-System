// main.js

import { handleLoadRequestResources } from './student-request.handler.js';
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

// App initialization
document.addEventListener('DOMContentLoaded', () => {
    setupDarkMode();
    handleLoadRequestResources();
});