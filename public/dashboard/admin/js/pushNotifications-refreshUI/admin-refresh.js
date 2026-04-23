import { setupSWEventDispatcher } from '../../../common/js/sw-events.js';

export function initAdminRefresh(loadResourceRequests) {
  // safe to call multiple times
  setupSWEventDispatcher();

  window.addEventListener('sw-message', (e) => {
    if (e.detail?.type === 'ADMIN_RESOURCE_REQUEST_UPDATED') {
      loadResourceRequests();
    }
  });
}
