import { getLoggedInStudentId, showLoadingState } from '../student.util.js';
import Swal from 'sweetalert2';
import {
  renderRequestsPageStructure,
  renderAllRequests,
  filterRequests,
  updateRequestCounts,
} from './view-request.ui.js';
import { logoutDirectly } from '../../../common/utils/commons.utils.js';
import { generateReport } from '../../../common/generate-report/generate-report.init.js';
import { closeReportModal } from '../../../common/generate-report/generate-report.ui.js';
import { check_svg, copy_svg } from '../../../common/icons/icons.svg.js';

//import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';
// API CALLS
export async function fetchStudentRequests(studentId) {
  const response = await fetch(`/dashboard/student/resource-requests/${studentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export async function deleteStudentRequest(requestId) {
  const response = await fetch(`/dashboard/student/del_requests/${requestId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

export async function fetchRequestAllotmentTime(requestId) {
  const response = await fetch(`/dashboard/student/allotment-time/${requestId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) return null;
  return response.json();
}

export async function fetchTokenForMigid(migid, requestId) {
  if (!migid) throw new Error('MIGID is required');
  if (!requestId) throw new Error('requestId is required');
  const response = await fetch('/notebook/proxy/token', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-mig-id': migid,
      'x-request-id': requestId,
    },
  });
  return response;
}

// handlers.js
let allRequests = [];
let currentStatus = 'all';

function attachReportHandlers() {
  document.querySelectorAll('.report-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const requestId = btn.dataset.requestId;

      if (!requestId) return;

      const request = allRequests.find((r) => r._id === requestId);
      console.log(request);
      if (!request) return;

      try {
        const reportRequest = {
          studentName: request.studentId.name || '',
          rollNo: request.studentId.rollNo || '',
          migId: request.machineId?.MIGID || '',
          startTime: request.startTime || request.allotmentStartTime,
          endTime: request.endTime || request.allotmentEndTime,
          duration: request.duration,
        };

        await generateReport(requestId, reportRequest);
      } catch (err) {
        console.error(err);
      }
    });
  });
}

// ==============================
// Page Load
// ==============================

export async function handleLoadViewRequests() {
  try {
    showLoadingState('requests-content');

    const studentId = await getLoggedInStudentId();

    if (!studentId) {
      console.error('Student ID not found');
      logoutDirectly();
      return;
    }

    renderRequestsPageStructure(handleFilterChange);

    await loadRequests(studentId);
  } catch (error) {
    console.error('Error loading view requests page:', error);
    document.getElementById('requests-content').innerHTML = `
            <div class="error-message">
                <p>Failed to load requests. Please try again.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
  }
}

// ==============================
// Load Requests
// ==============================

async function loadRequests(studentId) {
  try {
    const response = await fetchStudentRequests(studentId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.status === 404) {
        logoutDirectly();
        return;
      }

      document.getElementById('all-requests-list').innerHTML =
        '<div class="no-requests"><p>No requests found.</p></div>';
      return;
    }

    const data = await response.json();
    allRequests = data;

    renderAllRequests(allRequests, handleDeleteRequest, reloadPage);
    updateRequestCounts(allRequests);
    attachCopyTokenHandlers();
    attachReportHandlers();
    await processVerifiedRequests();
  } catch (error) {
    console.error('Error loading requests:', error);
    document.getElementById('all-requests-list').innerHTML =
      '<div class="error-message"><p>Error loading requests.</p></div>';
  }
}

// ==============================
// Delete
// ==============================

async function handleDeleteRequest(requestId) {
  try {
    const response = await deleteStudentRequest(requestId);

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    await Swal.fire({
      title: 'Deleted!',
      text: 'Your request has been deleted.',
      icon: 'success',
      draggable: true,
    });
  } catch (error) {
    Swal.fire({
      title: 'Error!',
      text: 'Failed to delete request.',
      icon: 'error',
      draggable: true,
    });
  }
}

function attachAccessMachineHandlers() {
  document.querySelectorAll('.access-machine-btn').forEach((btn) => {
    btn.addEventListener('click', async function () {
      const migid = this.dataset.migid;
      const requestId = this.dataset.requestId;
      if (!migid || !requestId) return;

      try {
        const res = await fetch('/notebook/proxy/set-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // important for session
          body: JSON.stringify({ migid, requestId }),
        });
        const data = await res.json();

        if (res.ok) {
          window.open('/notebook', '_blank'); // open proxy only if session is set
        } else {
          alert(data.message || 'Failed to initialize session');
        }
      } catch (err) {
        console.error(err);
        alert('Error setting session');
      }
    });
  });
}

function attachOpenVSCodeHandlers() {
  document.querySelectorAll('.open-vscode-btn').forEach((btn) => {
    btn.addEventListener('click', async function () {
      const migid = this.dataset.migid;
      const requestId = this.dataset.requestId;
      const token = this.dataset.token;
      console.log(window.location.origin + '/' + requestId + '/' + migid + '/' + token);
      // if (!migid || !requestId || token == 0) return;
      const maya_url = window.location.origin + '/' + requestId + '/' + migid + '/' + token;
      window.open(
        'vscode://MenthosaSolutions.maya-vscode-connector/connect?maya_url=' + maya_url,
        '_blank',
      );

      // OPEN IN VS CODE
    });
  });
}

export async function processVerifiedRequests() {
  await Promise.all(
    allRequests.map(async (request) => {
      if (request.is_verified && request.machineId?.MIGID) {
        try {
          const allotment = await fetchRequestAllotmentTime(request._id);
          if (allotment && allotment.startTime && allotment.endTime) {
            // Store allotment times on the request object
            request.allotmentStartTime = allotment.startTime;
            request.allotmentEndTime = allotment.endTime;
            const now = Date.now();
            const start = new Date(allotment.startTime).getTime();
            const end = new Date(allotment.endTime).getTime();
            if (now >= start && now <= end) {
              request.isAllotmentActive = true;
              const token = await handleLoadToken(request.machineId.MIGID, request._id);
              request.token = token || null;
            } else {
              request.isAllotmentActive = false;
              request.token = null;
            }
          } else {
            request.isAllotmentActive = false;
            request.token = null;
            request.allotmentStartTime = null;
            request.allotmentEndTime = null;
          }
        } catch (err) {
          request.isAllotmentActive = false;
          request.token = null;
          request.allotmentStartTime = null;
          request.allotmentEndTime = null;
        }
      } else {
        request.isAllotmentActive = false;
        request.token = null;
        request.allotmentStartTime = null;
        request.allotmentEndTime = null;
      }
    }),
  );

  renderAllRequests(allRequests, handleDeleteRequest, reloadPage);
  updateRequestCounts(allRequests);
  attachAccessMachineHandlers();
  attachOpenVSCodeHandlers();
  attachReportHandlers();
}

async function handleLoadToken(migid, requestId) {
  try {
    const response = await fetchTokenForMigid(migid, requestId);
    if (!response.ok) return null;

    const data = await response.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

// ==============================
// Filter
// ==============================

function handleFilterChange(status) {
  filterRequests(status);
}

// ==============================
// Reload
// ==============================

function reloadPage() {
  handleLoadViewRequests();
}

// ==============================
// Copy Token Handler
// ==============================
export function attachCopyTokenHandlers() {
  const container = document.getElementById('all-requests-list');
  if (!container) return;

  function handleCopyClick(e) {
    const btn = e.target.closest('.copy-token-btn');
    const token = btn?.getAttribute('data-token');
    if (!btn || !token) return;

    navigator.clipboard
      .writeText(token)
      .then(() => {
        btn.innerHTML = check_svg;
        btn.classList.add('copy-success');

        setTimeout(() => {
          btn.classList.remove('copy-success');
          btn.innerHTML = copy_svg;
        }, 1200);
      })
      .catch((err) => console.error('Clipboard write failed:', err));
  }

  container.removeEventListener('click', handleCopyClick, true);
  container.addEventListener('click', handleCopyClick, true);
}

//INIT

document.addEventListener('DOMContentLoaded', async () => {
  //setupDarkMode();
  document.getElementById('closeReportBtn')?.addEventListener('click', closeReportModal);
  await handleLoadViewRequests();
});
