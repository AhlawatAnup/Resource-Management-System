import {
  loadRequestsHandler,
  filterHandler,
  verifyHandler,
  initHandler,
  copyHandler,
  closeVerificationModalHandler,
  submitVerificationHandler
} from './admin-view-request.handler.js';

import { showMachinePopup } from './admin-view-request.ui.js';
import { generatePassword } from './admin-view-request.utils.js';

// Expose modal close handlers to window for inline onclick handlers
window.closeVerificationModal = closeVerificationModalHandler;

document.addEventListener('DOMContentLoaded', () => {

  initHandler();
  loadRequestsHandler();

  // search
  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    filterHandler(e.target.value);
  });

  // table actions
  document.getElementById("requestsTableBody")?.addEventListener("click", (e) => {
    const btn = e.target.closest('.approve-btn, .decline-btn');
    if (!btn) return;

    const id = btn.dataset.requestId;
    const action = btn.dataset.action;

    verifyHandler(id, action === 'approve');
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

  // verification submit
  document.getElementById('verificationForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const modal = document.getElementById('verificationModal');
    const id = modal.getAttribute('data-request-id');

    const credentials = {
      username: document.getElementById('vmUsername').value.trim(),
      password: document.getElementById('vmPassword').value.trim(),
      ip: document.getElementById('vmIp').value.trim(),
      migId: document.getElementById('vmMigId').value.trim()
    };

    closeVerificationModalHandler();
    await submitVerificationHandler(id, true, credentials);
  });

  document.addEventListener('click', (e) => {
  const btn = e.target.closest('.info-btn');
  if (!btn) return;

  const request = JSON.parse(btn.getAttribute('data-request') || '{}');
  showMachinePopup(request, btn);
});
});