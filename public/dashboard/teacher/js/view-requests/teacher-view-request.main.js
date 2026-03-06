import { loadResourceRequestsHandler, filterRequestsHandler, updateRequestVerificationHandler, showEditModalHandler, submitEditRequestHandler, initUIComponentsHandler } from './teacher-view-request.handler.js';

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

  // Delegate approve/decline/edit buttons
  document.getElementById("requestsTableBody").addEventListener("click", (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn, .edit-btn');
    if (!button) return;

    const requestId = button.getAttribute('data-request-id');
    const action = button.getAttribute('data-action');

    if (action === 'edit') {
      showEditModalHandler(requestId);
    } else {
      const isVerified = action === 'approve';
      updateRequestVerificationHandler(requestId, isVerified);
    }
  });

  // Modal close
  document.getElementById('closeEditModal').onclick = () => {
    document.getElementById('editRequestModal').style.display = 'none';
  };

  // Modal form submit
  const editForm = document.getElementById('editRequestForm');
  if (editForm) {
    editForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = e.submitter || editForm.querySelector('button[type="submit"]');
      await submitEditRequestHandler(submitBtn);
    };
  }
});