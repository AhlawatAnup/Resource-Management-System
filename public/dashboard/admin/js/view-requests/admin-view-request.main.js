import {
  loadRequestsHandler,
  filterHandler,
  initHandler,
  copyHandler,
  getRequestById,
} from './admin-view-request.handler.js';
import { verifyAdminRequest, revokeStudentRequest, extendStudentRequest } from './admin-view-request.service.js';
import { generatePassword, confirmAction, showToast , getEditDurationInput, closeEditModal} from './admin-view-request.utils.js';
import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';
import { openEditModal } from './admin-view-request.ui.js';

document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  initHandler();
  loadRequestsHandler();

  // search
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    filterHandler(e.target.value);
  });

  // table actions
  document.getElementById("requestsTableBody")?.addEventListener("click", async (e) => {
    const approveDeclineBtn = e.target.closest('.approve-btn, .decline-btn');
    const revokeBtn = e.target.closest('.revoke-btn');
    const editBtn = e.target.closest('.edit-btn');

    // Approve/Decline
    if (approveDeclineBtn) {
      const id = approveDeclineBtn.dataset.requestId;
      const action = approveDeclineBtn.dataset.action;
      if (!id || !action) return;
      try {
        const confirmed = await confirmAction(action);
        if (!confirmed) return;
        await verifyAdminRequest(id, action === 'approve');
        await loadRequestsHandler();
        showToast(`Request ${action}d successfully!`, 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update request', 'error');
      }
      return;
    }

    // Revoke
    if (revokeBtn) {
      const id = revokeBtn.dataset.requestId;
      if (!id) return;
      try {
        const confirmed = await confirmAction('revoke');
        if (!confirmed) return;
        await revokeStudentRequest(id);
        await loadRequestsHandler();
        showToast('Request revoked successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to revoke request', 'error');
      }
      return;
    }

    // Edit
    if (editBtn) {
      const id = editBtn.dataset.requestId;
      if (!id) return;

      const request = getRequestById(id);
      if (!request) return; 

      openEditModal(request);

      document.getElementById('editSubmitBtn').onclick = async () => {
        const extend = getEditDurationInput();
        if (!extend) {
          showToast('Enter a valid positive number of days', 'error');
          return;
        }

        try {
          const result = await extendStudentRequest(id, extend);
          closeEditModal();
          await loadRequestsHandler();
          showToast(result.message || 'Request extended successfully', 'success');
        } catch (err) {
          showToast(err.message || 'Failed to extend request', 'error');
        }
      };

      return;
    }
  });

  // copy
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    copyHandler(btn.dataset.target);
  });

  // generate password
  document.getElementById('generateVmPasswordBtn')?.addEventListener('click', () => {
    const pwd = generatePassword(12);
    const pwdEl = document.getElementById('vmPassword');
    if (pwdEl) pwdEl.value = pwd;
  });

});