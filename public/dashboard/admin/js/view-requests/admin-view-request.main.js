import {
  loadRequestsHandler,
  filterHandler,
  initHandler,
  copyHandler,
} from './admin-view-request.handler.js';
import { verifyAdminRequest, revokeStudentRequest } from './admin-view-request.service.js';
import { showMachinePopup } from './admin-view-request.ui.js';
import { generatePassword, confirmAction, showToast } from './admin-view-request.utils.js';

document.addEventListener('DOMContentLoaded', () => {

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


  document.addEventListener('click', (e) => {
  const btn = e.target.closest('.info-btn');
  if (!btn) return;

  const request = JSON.parse(btn.getAttribute('data-request') || '{}');
  showMachinePopup(request, btn);
});
});