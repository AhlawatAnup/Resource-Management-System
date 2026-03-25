import {
  fetchAdminResourceRequests,
  verifyAdminRequest,
  editAdminRequest,
  fetchAvailableMachines
} from './admin-view-request.service.js';

import {
  renderResourceRequests,
  showEmptyState,
  showErrorState,
  showNotification,
  showVerificationModalUI,
  closeVerificationModalUI,
  populateMachinesSelectUI,
  showEditModalUI,
  closeEditModalUI,
  getEditFormData,
  setSubmitButtonState,
  setFieldError,
  copyToClipboard
} from './admin-view-request.ui.js';

import {
  getRequestStatus,
  filterRequestsList,
  buildEditPayload,
  mergeUpdatedRequest
} from './admin-view-request.utils.js'

import {
  getInitials,
  getRandomNamedColor,
  formatDate,
  createViewMoreButton,
  initializePurposePanel,
  isValidUsername
} from '../../../common/js/commons.js';

// import {initAdminRefresh} from'../pushNotifications-refreshUI/admin-refresh.js'

// ===== STATE =====
let resourceRequests = [];
let filteredRequests = [];


// ===== LOAD =====
export async function loadRequestsHandler() {
  try {
    const { error, data } = await fetchAdminResourceRequests();

    if (error) throw new Error();


    // Flatten status object into top-level for each request
    resourceRequests = (data.requests || []).map(r => {
      if (r.status && typeof r.status === 'object') {
        return { ...r, ...r.status };
      }
      return r;
    });
    filteredRequests = [...resourceRequests];

    render();

  } catch (err) {
    console.error(err);
    showErrorState();
  }
}


// ===== RENDER =====
function render() {
  renderResourceRequests(filteredRequests, {
    getRequestStatus,
    getActionButtons,
    getInitials,
    getRandomNamedColor,
    formatDate,
    createViewMoreButton
  });
}


// ===== FILTER =====
export function filterHandler(term) {
  if (!resourceRequests.length) {
    showEmptyState();
    return;
  }

  filteredRequests = filterRequestsList(resourceRequests, term);
  render();
}


// ===== VERIFY =====
export async function verifyHandler(requestId, isVerified) {
  const request = resourceRequests.find(r => r._id === requestId);
  if (!request) {
    showNotification('Request not found.', 'error');
    return;
  }

  // expiry check
  if (isVerified) {
    const d = new Date(request.expiryDate);
    const now = new Date();
    d.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    if (d < now) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid Request',
        text: 'The expiry date is in the past. Please update the expiry date to proceed'
      });
      return;
    }

    await openVerificationModalHandler(requestId);
    return;
  }

  const res = await Swal.fire({
    title: 'Are you sure?',
    text: 'Decline request?',
    icon: 'warning',
    showCancelButton: true
  });

  if (!res.isConfirmed) return;

  await submitVerificationHandler(requestId, false);
}


// ===== MODAL =====
export async function openVerificationModalHandler(requestId) {
  const request = resourceRequests.find(r => r._id === requestId);
  if (!request) return;

  showVerificationModalUI(request);

  try {
    const machines = await fetchAvailableMachines();
    populateMachinesSelectUI(machines);
  } catch (err) {
    console.error(err);
  }
}

export function closeVerificationModalHandler() {
  closeVerificationModalUI();
}

export function closeEditModalHandler() {
  closeEditModalUI();
}


// ===== SUBMIT VERIFY =====
export async function submitVerificationHandler(requestId, isVerified, credentials = null) {
  try {
    await verifyAdminRequest(requestId, isVerified, credentials);

    const idx = resourceRequests.findIndex(r => r._id === requestId);

    if (idx !== -1) {
      resourceRequests[idx].admin_verified = isVerified;
      resourceRequests[idx].admin_action = true;

      if (isVerified) {
        resourceRequests[idx].teacher_verified = true;
        resourceRequests[idx].teacher_action = true;
        if (credentials) {
          resourceRequests[idx].vmCredentials = credentials;
        }
      }
    }

    filterHandler(document.getElementById('searchInput').value);
    showNotification(`Request ${isVerified ? 'approved' : 'declined'}`, 'success');

  } catch (err) {
    console.error(err);
    showNotification('Failed to update request', 'error');
  }
}


// ===== EDIT =====
export function showEditHandler(id) {
  const req = resourceRequests.find(r => r._id === id);
  if (!req) return;
  showEditModalUI(req);
}

export async function submitEditHandler(btn) {
  const { requestId, formValues } = getEditFormData();

  if (!isValidUsername(formValues.username)) {
    setFieldError('edit-username-error', 'Invalid username');
    return;
  }

  const payload = buildEditPayload(formValues);

  try {
    setSubmitButtonState(btn, true);

    const result = await editAdminRequest(requestId, payload);

    const idx = resourceRequests.findIndex(r => r._id === requestId);
    if (idx !== -1) {
      resourceRequests[idx] = mergeUpdatedRequest(resourceRequests[idx], result.resourceRequest);
    }

    filterHandler(document.getElementById('searchInput').value);
    closeEditModalUI();
    showNotification('Updated successfully', 'success');

  } catch (err) {
    showNotification(err.message, 'error');
  } finally {
    setSubmitButtonState(btn, false);
  }
}


// ===== INIT =====
export function initHandler() {
  initializePurposePanel();

  flatpickr('#editExpiryDate', {
    dateFormat: 'Y-m-d',
    minDate: 'today'
  });
}


// ===== COPY =====
export async function copyHandler(targetId) {
  const el = document.getElementById(targetId);
  if (!el) return showNotification('Not found', 'error');

  const value = el.value || '';
  if (!value) return showNotification('Nothing to copy', 'error');

  try {
    await copyToClipboard(value);
    showNotification('Copied', 'success');
  } catch {
    showNotification('Copy failed', 'error');
  }
}


function getActionButtons(r) {
  if (r.admin_action) {
    return `
      <button class="icon-btn edit-btn" data-request-id="${r._id}" data-action="edit"></button>
    `;
  }

  return `
    <button class="icon-btn approve-btn" data-request-id="${r._id}" data-action="approve"></button>
    <button class="icon-btn decline-btn" data-request-id="${r._id}" data-action="decline"></button>
    <button class="icon-btn edit-btn" data-request-id="${r._id}" data-action="edit"></button>
  `;
}

// initAdminRefresh(loadRequestsHandler);