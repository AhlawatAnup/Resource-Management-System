import { formatDate } from '../../../common/utils/commons.utils.js';
import {
  getRequestStatus,
  getRequestStatusText,
  getRequestStatusClass,
  canDeleteRequest,
} from '../student.util.js';
import Swal from 'sweetalert2';
import { setActiveSidebar } from '../../../common/aside/aside.js';
import {
  calendar_svg,
  chart_column_svg,
  copy_svg,
  cpu_svg,
  fingerprint_svg,
  machine_cloud_svg,
  monitor_play_svg,
  vscode_svg,
} from '../../../common/icons/icons.svg.js';

import { add_svg } from '../../../common/icons/icons.svg.js';

// ==============================
// Page Structure
// ==============================

export function renderRequestsPageStructure(onFilterChange) {
  const container = document.getElementById('requests-content');

  container.innerHTML = `
       
            <div id="all-requests" class="resource-request-section">
      
                <div id="all-requests-list"></div>
            </div>
      
    `;

  document.querySelectorAll('.status-btn-resources').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;

      document
        .querySelectorAll('.status-btn-resources')
        .forEach((b) => b.classList.remove('active'));

      btn.classList.add('active');

      onFilterChange(status);
    });
  });
}

// ==============================
// Render Requests
// ==============================

export function renderAllRequests(requests, onDelete, onReload) {
  const container = document.getElementById('all-requests-list');

  if (!requests || requests.length === 0) {
    container.innerHTML = `
            <div class="no-requests">
                <div class="empty-state">
                    <i class="fas fa-inbox" style="font-size: 4em; color: #ddd; margin-bottom: 20px; color:blue;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Request Found</h3>
                    <p style="color: #888; margin-bottom: 20px;">You haven't submitted any resource requests yet.</p>
                    <div class="rms-btn-v1" style="justify-content:center">
                      <button class="btn-primary empty-request-btn">   
                         ${add_svg}Submit Your First Request
                      </button>
                    </div>
                </div>
            </div>
        `;

    document.querySelector('.empty-request-btn')?.addEventListener('click', () => {
      document.querySelector('.view-request')?.classList.add('hide-default');

      document.querySelector('.raise-request')?.classList.remove('hide-default');

      setActiveSidebar('raise-request');
    });
    return;
  }

  // Sort requests by creation date (newest first)
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  container.innerHTML = sortedRequests.map((request) => createRequestCard(request)).join('');

  attachDeleteHandlers(onDelete, onReload);
}

// ==============================
// Filter
// ==============================

export function filterRequests(status) {
  const requestItems = document.querySelectorAll('.request-item.detailed');

  requestItems.forEach((item) => {
    if (status === 'all' || item.dataset.status === status) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

export function updateRequestCounts(requests) {
  const counts = {
    all: requests.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  };

  requests.forEach((request) => {
    const status = getRequestStatus(request);

    if (status === 'pending') counts.pending++;
    else if (status === 'approved') counts.approved++;
    else if (status === 'rejected') counts.rejected++;
    else if (status === 'completed') counts.completed++;
  });

  document.querySelector('.count-badge-resource.all').textContent = counts.all;

  document.querySelector('.count-badge-resource.pending').textContent = counts.pending;

  document.querySelector('.count-badge-resource.approved').textContent = counts.approved;

  document.querySelector('.count-badge-resource.rejected').textContent = counts.rejected;

  document.querySelector('.count-badge-resource.completed').textContent = counts.completed;
}
// ==============================
// Card UI
// ==============================

function createRequestCard(request) {
  const status = getRequestStatus(request);
  const statusText = getRequestStatusText(request);
  const statusClass = getRequestStatusClass(request);

  let requestStatusClass = '';

  switch (status) {
    case 'approved':
      requestStatusClass = 'request-approved';
      break;

    case 'pending':
      requestStatusClass = 'request-pending';

      break;

    case 'rejected':
      requestStatusClass = 'request-rejected';
      break;

    case 'completed':
      requestStatusClass = 'request-completed';
      break;
  }
  // Check expired or active
  const now = Date.now();

  const start = request.allotmentStartTime ? new Date(request.allotmentStartTime).getTime() : null;

  const end = request.allotmentEndTime ? new Date(request.allotmentEndTime).getTime() : null;

  const isActive = request.isActive && request.is_verified;
  const isExpired = request.is_verified && !request.is_verified;

  const showReportButton = isActive || isExpired;
  const editedBadge = request.isEdited
    ? '<span class="edited-badge" style="margin-left: 8px; color: #ff7a45; font-size: 0.85em; font-weight: 500;">(edited by teacher/admin)</span>'
    : '';

  const canDelete = canDeleteRequest(request);

  const isVerified = request.is_verified && request.machineId && request.machineId.MIGID;
  console.log(isVerified);
  const showTokenAndButtons = isVerified && request.isActive;

  let tokenMessage = '';

  if (showTokenAndButtons) {
    tokenMessage = request.token ? `Token: ${request.token}` : 'Token not generated yet';
  } else {
    if (statusText.key == 'APPROVED') {
      tokenMessage =
        'Your request has been approved. Access will be available during the allotted time window.';
    } else if (statusText.key == 'COMPLETED') {
      tokenMessage = 'This resource allocation has ended. Usage session completed successfully.';
    } else if (statusText.key == 'PENDING_TEACHER') {
      tokenMessage = 'Teacher approval received. Awaiting final admin approval.';
    } else if (statusText.key == 'REJECTED_BY_ADMIN') {
      tokenMessage = 'This request was not approved by the admin';
    } else if (statusText.key == 'REJECTED_BY_TEACHER') {
      tokenMessage = 'This request was not approved by the teacher.';
    } else if (statusText.key == 'PENDING_ADMIN_APPROVAL') {
      tokenMessage =
        'This request is pending administrator approval. You will be notified by email once it has been approved.';
    }
  }

  return `
       <div class="request-item detailed ${requestStatusClass}" data-status="${status}">

    <!-- Header -->
    <div class='request-header'>

        <div class='request-header-left'>
           <div class="request-icon  ${requestStatusClass}">
           ${machine_cloud_svg} 
           </div>
          <div class='request-title-area'>
            <h3>
                ${request.title}
            </h3>
            </div>

              <span class="status-badge ${statusClass}">
            ${statusText.text}
        </span>
        </div>


    <div class="request-header-right">
        ${
          canDelete
            ? `
            <button
                type="button"
                class="delete-request-btn"
                data-request-id="${request._id}">
                Delete
            </button>
        `
            : ''
        }
        </div>
    </div>

    <!-- Meta Row -->
   <div class='request-meta'>
   <div class='meta-item'>
    ${fingerprint_svg}
    <span>
        <strong>MIGID:</strong> ${request.machineId?.MIGID ?? '-'}
    </span>
    </div>

 
    <div class='meta-item'>
         ${cpu_svg}
    <span>
        <strong>GPU RAM:</strong> ${request.machineId?.gpuRam ?? 0} GB
    </span>
    </div>
   
    <div class='meta-item'>
      ${calendar_svg}
    <span>
        <strong>Allotment:</strong>
        ${formatDate(request.allotmentStartTime)}
        -
        ${formatDate(request.allotmentEndTime)}
    </span>
      </div>

</div>

    <!-- Purpose -->
    <div class='request-purpose'>
        <strong>Purpose:</strong>
        ${request.purpose}
    </div>

    <!-- Token -->
    <div class="request-token">
      ${tokenMessage}
      ${
        request.token
          ? `
          <button
            class="copy-token-btn"
            data-token="${request.token}"
            title="Copy Token">
            ${copy_svg}
          </button>
          `
          : ''
      }

    </div>

    <!-- Bottom Row -->
    <div class="request-footer">

        <!-- Buttons -->
      <div class="rms-btn-v1">

        ${
          showTokenAndButtons
            ? `
                <button
                    class="access-machine-btn"
                    data-request-id="${request._id}"
                    data-migid="${request?.machineId?.MIGID}">
                    ${monitor_play_svg}
                    Access Machine
                </button>
            `
            : ''
        }
        ${
          showTokenAndButtons
            ? `
            <button
                class="open-vscode-btn unfill" 
                data-request-id="${request._id}"
                data-migid="${request?.machineId?.MIGID}"
                data-token="${request.token ? request.token : 0}">
                ${vscode_svg}
                Open in VS Code
            </button>
         `
            : ''
        }

        ${
          showReportButton
            ? `
              <button class="report-btn unfill"  data-request-id="${request._id}">
                ${chart_column_svg} View Usage
              </button>
            `
            : ''
        }

        ${
          showReportButton
            ? `
        <button class="feedback-btn" style='display:none'>
            <i class="fas fa-comment-dots" style="font-size:13px;"></i>
            Send Feedback
        </button>
        `
            : ''
        }
        </div>

        <!-- Date -->
        <small class='request-date'>
            ${formatDate(request.createdAt)}
        </small>
    </div>
</div>
    `;
}

// ==============================
// Event Handlers
// ==============================

function attachDeleteHandlers(onDelete, onReload) {
  document.querySelectorAll('.delete-request-btn').forEach((btn) => {
    btn.addEventListener('click', async function () {
      const requestId = btn.getAttribute('data-request-id');
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this request?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        draggable: true,
        scrollbarPadding: false,
        heightAuto: false,
      });

      if (result.isConfirmed) {
        await onDelete(requestId);
        onReload();
      }
    });
  });
}
