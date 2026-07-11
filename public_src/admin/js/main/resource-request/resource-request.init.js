import Swal from 'sweetalert2';
import { generateReport } from '../../../../common/generate-report/generate-report.init.js';
import { closeReportModal } from '../../../../common/generate-report/generate-report.ui.js';
import {
  showErrorState,
  showNotification,
  populateMachinesSelectUI,
  setSubmitButtonState,
  showEmptyState,
  setFieldError,
  copyToClipboard,
  openEditModal,
  renderResourceRequests,
} from './resource-request.ui.js';
import {
  getRequestStatus,
  filterRequestsList,
  mergeUpdatedRequest,
  generatePassword,
  confirmAction,
  showToast,
  getEditDurationInput,
  closeEditModal,
  getRejectionRemarks,
} from './resource-request.utils.js';
import {
  getInitials,
  getRandomNamedColor,
  formatDate,
} from '../../../../common/utils/commons.utils.js';

import {
  chart_column_svg,
  check_svg,
  square_pen_svg,
  trash_2_svg,
} from '../../../../common/icons/icons.svg.js';

// API CALLS

//Fetch data
export async function fetchAdminResourceRequests() {
  const response = await fetch('/dashboard/admin/resource-requests', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return { error: true, status: response.status };
  }

  const data = await response.json();

  return {
    error: false,
    data,
  };
}
// Verify (approve/decline) request with optional credentials
export async function verifyAdminRequest(requestId, isVerified, remarks = '') {
  const requestBody = {
    is_verified: isVerified,
    remarks: remarks,
  };

  const response = await fetch(`/dashboard/admin/verify_request/${requestId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();

    let errorMessage = 'Failed to update request verification';

    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result;
}

// Fetch available machines
export async function fetchAvailableMachines() {
  const response = await fetch('/dashboard/admin/machines', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to load machines');
  }

  const data = await response.json();
  return data.machines || [];
}

// Revoke a resource request (admin)
export async function revokeStudentRequest(requestId) {
  const res = await fetch(`/dashboard/admin/revoke/${requestId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Failed to revoke request');
  }
  return res.json();
}

export async function extendStudentRequest(requestId, extraDuration) {
  const res = await fetch(`/dashboard/admin/edit-resourceRequest/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extraDuration }),
  });

  const data = await res.json(); // parse JSON response

  if (!res.ok) {
    throw new Error(data.message || 'Failed to extend request');
  }

  return data;
}

//HANDLERS

// ===== STATE =====
let currentStatus = 'all';

let resourceRequests = [];
let filteredRequests = [];

let upcomingRequests = [];
let activeRequests = [];
let expiredRequests = [];
let rejectedRequests = [];

function getUIStatus(r) {
  const now = new Date();

  // Any rejection (teacher OR admin)
  if ((r.teacher_action && !r.teacher_verified) || (r.admin_action && !r.admin_verified)) {
    return 'rejected';
  }

  // Fully approved
  if (r.teacher_verified || r.admin_verified) {
    if (r.startTime && r.endTime) {
      const start = new Date(r.startTime);
      const end = new Date(r.endTime);

      if (now < start) return 'upcoming'; // not started yet
      if (now >= start && now <= end) return 'active'; // currently running
      if (now > end) return 'expired'; // finished
    }

    // Fallback if no time exists
    return 'active';
  }

  // Still waiting for approvals
  return 'active';
}

// ===== LOAD =====
export async function loadRequestsHandler() {
  try {
    const { error, data } = await fetchAdminResourceRequests();

    if (error) throw new Error();

    // Flatten status object into top-level for each request
    resourceRequests = (data.requests || []).map((r) => {
      if (r.status && typeof r.status === 'object') {
        return { ...r, ...r.status };
      }
      return r;
    });
    upcomingRequests = [];
    expiredRequests = [];
    rejectedRequests = [];
    activeRequests = [];

    resourceRequests.forEach((r) => {
      const status = getUIStatus(r);

      if (status === 'upcoming') upcomingRequests.push(r);
      else if (status === 'active') activeRequests.push(r);
      else if (status === 'expired') expiredRequests.push(r);
      else if (status === 'rejected') rejectedRequests.push(r);
    });
    filteredRequests = [...resourceRequests];

    render();
  } catch (err) {
    console.error(err);
    showErrorState();
  }
}

export function setStatusFilter(status) {
  currentStatus = status;
  render();
}

// ===== RENDER =====
function render() {
  let baseData = [];

  if (currentStatus === 'all') baseData = resourceRequests;
  else if (currentStatus === 'upcoming') baseData = upcomingRequests;
  else if (currentStatus === 'expired') baseData = expiredRequests;
  else if (currentStatus === 'rejected') baseData = rejectedRequests;
  else if (currentStatus === 'active') baseData = activeRequests;

  const resources = document.querySelectorAll('.count-badge-resource');
  // apply search on selected set
  const data = filterRequestsList(
    baseData,
    document.getElementById('searchInputResources')?.value || '',
  );
  resources[0].textContent = resourceRequests.length;
  resources[1].textContent = activeRequests.length;
  resources[2].textContent = upcomingRequests.length;
  resources[3].textContent = expiredRequests.length;
  resources[4].textContent = rejectedRequests.length;

  renderResourceRequests(data, {
    getRequestStatus,
    getActionButtons,
    getInitials,
    getRandomNamedColor,
    formatDate,
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
  const status = getUIStatus(r);
  let isPending = true;

  // MAJOR BUG : IF DATE IS LESS THAN 13 JUNE  GET isPending from r.teacher_verified if more than 13 June than r.admin_verified
  const createdAt = new Date(r.createdAt);
  const targetDate = new Date('2026-06-13');

  if (createdAt > targetDate) {
    isPending = !r.admin_verified;
  } else if (createdAt < targetDate) {
    isPending = !r.teacher_verified && !r.admin_verified;
  } else {
    isPending = !r.admin_verified;
  }

  // EXPIRED → only report
  if (status === 'expired') {
    return `
    <div class='rms-img-btn'>
      <button class="icon-btn stats-report-btn" data-request-id="${r._id} title="View Usage">
          ${chart_column_svg}
      </button>
    </div>
    `;
  }

  // UPCOMING → edit + revoke
  if (status === 'upcoming') {
    return `
    <div class='rms-img-btn'>
      <button class="icon-btn edit-btn warn" data-request-id="${r._id}" title="Edit Request">
         ${square_pen_svg}
      </button>
      
      <button class="icon-btn revoke-btn danger" data-request-id="${r._id}" title="Remove Request">
       ${trash_2_svg}
      </button>
    </div>
    `;
  }

  //  ACTIVE → all 3
  if (status === 'active') {
    return `
  <div class="rms-img-btn">
    ${
      isPending
        ? `
      <button class="icon-btn approve-btn normal" data-request-id="${r._id}" data-action="approve">
        ${check_svg}
      </button>
        `
        : ''
    }

      ${
        !isPending
          ? `   
        <button class="icon-btn stats-report-btn normal" data-request-id="${r._id}" title="View Usage">
        ${chart_column_svg}
        </button>
      `
          : ``
      }



    <button class="icon-btn edit-btn warn" data-request-id="${r._id}" title="Edit Request">
      ${square_pen_svg}
    </button>


    ${
      !isPending
        ? `          
        <button class="icon-btn revoke-btn danger" data-request-id="${r._id}" title="Remove Request">
          ${trash_2_svg}
        </button>
         `
        : ``
    }

    ${
      isPending
        ? `
        <button class="icon-btn decline-btn danger" data-request-id="${r._id}" data-action="decline" title="Remove Request">
        ${trash_2_svg}
        </button>
      `
        : ``
    }
  </div>
    `;
  }

  return '';
}

// ===== EDIT =====
export function handleEditClick(requestId) {
  const request = resourceRequests.find((r) => r._id === requestId);
  if (!request) return;

  openEditModal(request);
}

export function getRequestById(requestId) {
  return resourceRequests.find((r) => r._id === requestId);
}

//INIT

document.addEventListener('DOMContentLoaded', () => {
  // setupDarkMode();
  loadRequestsHandler();

  //Handling Navigation
  const navEntry = performance.getEntriesByType('navigation')[0];
  const isReload = navEntry && navEntry.type === 'reload';

  let savedStatus = 'active';

  if (isReload) {
    // only restore on reload
    savedStatus = localStorage.getItem('selectedStatus') || 'active';
  } else {
    // coming from another page → RESET
    localStorage.removeItem('selectedStatus');
  }

  setStatusFilter(savedStatus);

  // set active button UI
  document.querySelectorAll('.status-btn-resources').forEach((btn) => {
    btn.classList.remove('active');

    if (btn.dataset.status === savedStatus) {
      btn.classList.add('active');
    }
  });
  // search
  document.getElementById('searchInputResources')?.addEventListener('input', (e) => {
    filterHandler(e.target.value);
  });

  // AUTO FOCUS SEARCH ON TYPING
  document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInputResources');

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA'
    ) {
      return;
    }

    if (e.key.length === 1) {
      searchInput.focus();
    }
  });

  //Filter
  document.querySelectorAll('.status-btn-resources').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;

      // remove active from all
      document
        .querySelectorAll('.status-btn-resources')
        .forEach((b) => b.classList.remove('active'));

      // add active to clicked
      btn.classList.add('active');

      // SAVE TO LOCAL STORAGE
      localStorage.setItem('selectedStatus', status);

      setStatusFilter(status);
    });
  });
  // table actions
  document.getElementById('requestsTableBody')?.addEventListener('click', async (e) => {
    const approveDeclineBtn = e.target.closest('.approve-btn, .decline-btn');
    const revokeBtn = e.target.closest('.revoke-btn');
    const editBtn = e.target.closest('.edit-btn');
    const reportBtn = e.target.closest('.stats-report-btn');

    // Approve/Decline
    if (approveDeclineBtn) {
      const id = approveDeclineBtn.dataset.requestId;
      const action = approveDeclineBtn.dataset.action;
      if (!id || !action) return;

      try {
        let remarks = '';

        if (action === 'decline') {
          const result = await getRejectionRemarks();
          if (result === null) return;
          remarks = result;
        } else {
          const confirmed = await confirmAction(action);
          if (!confirmed) return;
        }

        await verifyAdminRequest(id, action === 'approve', remarks);
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

    if (reportBtn) {
      const requestId = reportBtn.dataset.requestId;
      if (!requestId) return;
      const request = getRequestById(requestId);

      try {
        await generateReport(requestId, request);
      } catch (err) {
        showToast(err.message || 'Failed to generate report', 'error');
      }

      return;
    }
  });

  document.getElementById('closeReportBtn')?.addEventListener('click', () => {
    closeReportModal();
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
