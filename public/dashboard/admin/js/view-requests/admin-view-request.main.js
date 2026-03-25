import {
  loadRequestsHandler,
  filterHandler,
  initHandler,
  copyHandler,
} from './admin-view-request.handler.js';

import { showMachinePopup } from './admin-view-request.ui.js';
import { generatePassword } from './admin-view-request.utils.js';

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