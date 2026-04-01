import { loadResourceRequestsHandler, filterRequestsHandler, updateRequestVerificationHandler, initUIComponentsHandler } from './teacher-view-request.handler.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize purpose panel & date pickers
  initUIComponentsHandler();

  // Load resource requests
  loadResourceRequestsHandler();

  // Search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterRequestsHandler(e.target.value);
    });
  }

  // Delegate approve/decline buttons
  document.getElementById("requestsTableBody").addEventListener("click", (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn');
    if (!button) return;

    const requestId = button.getAttribute('data-request-id');
    const action = button.getAttribute('data-action');
    
    const isVerified = action === 'approve';
    updateRequestVerificationHandler(requestId, isVerified);
    
  });
});