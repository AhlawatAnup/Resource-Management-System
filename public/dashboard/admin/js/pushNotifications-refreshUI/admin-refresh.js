import { setupSWEventDispatcher } from '../../../common/js/sw-events.js';
import { loadResourceRequests } from '../admin-view-requests.js';

// Ensure SW event dispatcher is set up (safe to call multiple times)
setupSWEventDispatcher();

// Listen for relevant SW events and refresh the view-requests UI
window.addEventListener('sw-message', (e) => {
  if (e.detail?.type === 'ADMIN-RESOURCE_REQUEST_UPDATED') {
    loadResourceRequests();
  }
});