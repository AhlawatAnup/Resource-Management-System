import { formatDate } from '../../../common/utils/commons.utils.js';
import {
  getRequestStatus,
  getRequestStatusText,
  getRequestStatusClass,
  getRequestStatusIcon,
  canDeleteRequest,
} from '../student.util.js';
import Swal from 'sweetalert2';
import { setActiveSidebar } from '../../../common/aside/aside.js';

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
                    <h3 style="color: #666; margin-bottom: 10px;">No Requests Found</h3>
                    <p style="color: #888; margin-bottom: 20px;">You haven't submitted any resource requests yet.</p>
                    <button class="btn-primary empty-request-btn">   
                        <i class="fas fa-plus-circle"></i>
                        Submit Your First Request
                    </button>
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
  const statusIcon = getRequestStatusIcon(request);
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

  const isActive = start && end && now >= start && now <= end;
  const isExpired = end && now > end;

  const showReportButton = isActive || isExpired;
  const editedBadge = request.isEdited
    ? '<span class="edited-badge" style="margin-left: 8px; color: #ff7a45; font-size: 0.85em; font-weight: 500;">(edited by teacher/admin)</span>'
    : '';

  const canDelete = canDeleteRequest(request);

  const isVerified = request.is_verified && request.machineId && request.machineId.MIGID;
  const showTokenAndButtons = isVerified && request.isAllotmentActive;

  let tokenMessage = '';

  if (showTokenAndButtons) {
    tokenMessage = request.token ? `Token: ${request.token}` : 'Token not generated yet';
  } else {
    if (statusText == 'Approved') {
      tokenMessage =
        'Your request has been approved. Access will be available during the allotted time window.';
    } else if (statusText == 'Completed') {
      tokenMessage = 'This resource allocation has ended. Usage session completed successfully.';
    } else if (statusText == 'Pending Teacher') {
      tokenMessage = 'Teacher approval received. Awaiting final admin approval.';
    } else if (statusText == 'Rejected by Admin') {
      tokenMessage = 'This request was not approved by the admin';
    } else if (statusText == 'Rejected by Teacher') {
      tokenMessage = 'This request was not approved by the teacher.';
    } else if (statusText == 'Pending for Admin Approval') {
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
            <i class="fas fa-microchip"></i>
          </div>
          <div class='request-title-area'>
            <h3>
                ${request.title}
            </h3>
            </div>

              <span class="status-badge ${statusClass}">
            ${statusIcon} ${statusText}
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
    <i class="fas fa-fingerprint"></i>
    <span>
        <strong>MIGID:</strong> ${request.machineId.MIGID}
    </span>
    </div>

 
    <div class='meta-item'>
     <i class="fas fa-memory"></i>
    <span>
        <strong>GPU RAM:</strong> ${request.machineId.gpuRam} GB
    </span>
    </div>
   
    <div class='meta-item'>
      <i class="fas fa-calendar-days"></i>
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
        <i class="fas fa-copy"></i>
      </button>
      `
      : ''
  }

</div>

    <!-- Bottom Row -->
    <div class="request-footer">

        <!-- Buttons -->
        <div class="request-actions">

        ${
          showTokenAndButtons
            ? `
                <button
                    class="access-machine-btn"
                    data-request-id="${request._id}"
                    data-migid="${request.machineId.MIGID}">
                    <i class="fas fa-desktop" style="font-size:13px;"></i>
                    Access Machine
                </button>
            `
            : ''
        }
           ${
             showReportButton
               ? `
    <button class="report-btn"  data-request-id="${request._id}">
        <i class="fas fa-file-alt"></i>
        View Usage
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
