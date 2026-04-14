import {
  fetchAdminResourceRequests,
  fetchAvailableMachines
} from './admin-view-request.service.js';

import {
  renderResourceRequests,
  showEmptyState,
  showErrorState,
  showNotification,
  populateMachinesSelectUI,
  setSubmitButtonState,
  setFieldError,
  copyToClipboard,
  openEditModal,
} from './admin-view-request.ui.js';

import {
  getRequestStatus,
  filterRequestsList,
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

// ===== INIT =====
export function initHandler() {
  initializePurposePanel();
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
  const status = getRequestStatus(r);

  if (status.class === 'expired' || status.class === 'declined') {
    return '';
  }

  // VERIFIED
  if (status.class === 'verified') {
    return `
      <button class="icon-btn edit-btn" data-request-id="${r._id}" title="Edit">
        <i class="fas fa-pen-to-square"></i>
      </button>
  
      <button class="icon-btn revoke-btn" data-request-id="${r._id}">
        Revoke
      </button>

      <button class="icon-btn stats-report-btn" data-request-id="${r._id}">
        Report
      </button>
    `;
  }

  // PENDING TEACHER
  if (status.class === 'pending-teacher') {
    return `
      <button class="icon-btn approve-btn" data-request-id="${r._id}" data-action="approve" title="Approve">
        <i class="fas fa-check"></i>
      </button>

      <button class="icon-btn decline-btn" data-request-id="${r._id}" data-action="decline" title="Decline">
        <i class="fas fa-times"></i>
      </button>
    `;
  }
  return '';
}

// ===== EDIT =====
export function handleEditClick(requestId) {
  const request = resourceRequests.find(r => r._id === requestId);
  if (!request) return;

  openEditModal(request);
}

export function getRequestById(requestId) {
  return resourceRequests.find(r => r._id === requestId);
}

// initAdminRefresh(loadRequestsHandler);