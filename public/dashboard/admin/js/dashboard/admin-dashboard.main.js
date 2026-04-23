// main.js

import { logoutDirectly } from '../../../common/js/commons.js';
import { registerServiceWorkerAndSubscribe } from '../../../common/js/notification.js';
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';
import {
  loadAndRender,
  setupNavigation,
  setupActionHandlers,
  setupSearch,
} from './admin-dashboard.handler.js';

// -----------------------------
// Global State (Single Source)
// -----------------------------
const state = {
  currentData: [],
  currentType: 'teacher',
  currentStatus: 'all',
};

// -----------------------------
// Reload Function (Injected)
// -----------------------------
async function reload() {
  await loadAndRender({
    state,
    logout: logoutDirectly,
  });
}

// -----------------------------
// Initialize App
// -----------------------------
function initialize() {
  setupDarkMode();

  setupNavigation({ state, reload });
  setupActionHandlers({ reload });
  setupSearch({ state });

  // Initial load
  reload();

  // Register service worker (existing behavior preserved)
  registerServiceWorkerAndSubscribe();
}

// -----------------------------
// Bootstrapping
// -----------------------------
document.addEventListener('DOMContentLoaded', initialize);
