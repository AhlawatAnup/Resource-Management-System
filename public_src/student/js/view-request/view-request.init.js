import { getLoggedInStudentId, showLoadingState } from '../student.util.js';
import {
  renderRequestsPageStructure,
  renderAllRequests,
  filterRequests,
} from './view-request.ui.js';
import { logoutDirectly } from '../../../common/utils/commons.utils.js';
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
    attachCopyTokenHandlers();
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
  attachAccessMachineHandlers();
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
    if (!btn) return;

    const token = btn.getAttribute('data-token');
    const icon = btn.querySelector('i');

    if (!token || !icon) return;

    navigator.clipboard
      .writeText(token)
      .then(() => {
        icon.classList.replace('fa-copy', 'fa-check');
        btn.classList.add('copy-success');

        setTimeout(() => {
          icon.classList.replace('fa-check', 'fa-copy');
          btn.classList.remove('copy-success');
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
  await handleLoadViewRequests();
});

