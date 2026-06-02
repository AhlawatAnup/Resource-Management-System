// ui.js

import { formatDate } from '../../../common/utils/commons.utils.js';
import {
  getRequestStatus,
  getRequestStatusText,
  getRequestStatusClass,
  getRequestStatusIcon,
  canDeleteRequest,
} from '../student.util.js';

// ==============================
// Page Structure
// ==============================

export function renderRequestsPageStructure(onFilterChange) {
  const container = document.getElementById('requests-content');

  container.innerHTML = `
        <div class="requests-page">
            <div id="all-requests" class="resource-request-section">
                <div class="section-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>
                        <i class="fas fa-list-ul"></i>
                        All Your Resource Requests
                    </h2>
                    <div class="filter-controls" style="display: flex; gap: 10px; align-items: center;">
                        <label for="status-filter" style="font-weight: 600; color: #666;">Filter by Status:</label>
                        <select id="status-filter" class="form-control" style="width: auto; min-width: 150px;">
                            <option value="all">All Requests</option>
                            <option value="pending">Pending Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
                <div class="delete-note" style="margin-bottom: 16px; padding: 10px 16px; background: #fffbe6; border-left: 4px solid #faad14; border-radius: 6px; color: #8c6d1f; font-size: 1em;">
                    <strong>Note:</strong> You can delete a request only if it has not been acted upon by your teacher or admin.
                </div>
                <div id="all-requests-list"></div>
            </div>
        </div>
    `;

  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', function () {
      onFilterChange(this.value);
    });
  }
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
                    <i class="fas fa-inbox" style="font-size: 4em; color: #ddd; margin-bottom: 20px;"></i>
                    <h3 style="color: #666; margin-bottom: 10px;">No Requests Found</h3>
                    <p style="color: #888; margin-bottom: 20px;">You haven't submitted any resource requests yet.</p>
                    <a href="/dashboard/student/request-resources.html" class="btn-primary">
                        <i class="fas fa-plus-circle"></i>
                        Submit Your First Request
                    </a>
                </div>
            </div>
        `;
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

  // Update the count display
  const visibleItems = document.querySelectorAll(
    '.request-item.detailed:not([style*="display: none"])',
  ).length;
  const totalItems = requestItems.length;

  let filterInfo = document.getElementById('filter-info');
  if (!filterInfo) {
    filterInfo = document.createElement('div');
    filterInfo.id = 'filter-info';
    filterInfo.style.cssText =
      'margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; color: #666; font-size: 0.9em;';
    const list = document.getElementById('all-requests-list');
    list.insertBefore(filterInfo, list.firstChild);
  }

  const statusText = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
  filterInfo.innerHTML = `Showing ${visibleItems} of ${totalItems} requests (${statusText})`;
}

// ==============================
// Card UI
// ==============================

function createRequestCard(request) {
  const status = getRequestStatus(request);
  const statusText = getRequestStatusText(request);
  const statusClass = getRequestStatusClass(request);
  const statusIcon = getRequestStatusIcon(request);
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

  return `
       <div class="request-item detailed" data-status="${status}"
     style="
        position:relative;
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:14px 16px;
        margin-bottom:12px;
        background:#fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.04);
     ">

    <!-- Header -->
    <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        margin-bottom:10px;
    ">
        <div style="display:flex; align-items:center; gap:10px;">
            <h3 style="
                margin:0;
                font-size:16px;
                font-weight:600;
                color:#111827;
            ">
                ${request.title}
            </h3>

            <span class="status-badge ${statusClass}">
                ${statusIcon} ${statusText}
            </span>
        </div>

        ${
          canDelete
            ? `
            <button
                type="button"
                class="delete-request-btn"
                data-request-id="${request._id}"
                style="
                    background:#ef4444;
                    color:#fff;
                    border:none;
                    border-radius:6px;
                    padding:6px 10px;
                    cursor:pointer;
                    font-size:12px;
                ">
                Delete
            </button>
        `
            : ''
        }
    </div>

    <!-- Meta Row -->
   <div style="
    display:flex;
    flex-wrap:wrap;
    align-items:center;
    gap:8px;
    font-size:13px;
    color:#4b5563;
    margin-bottom:10px;
">
    <span>
        <strong>MIGID:</strong> ${request.machineId.MIGID}
    </span>

    <span style="color:#d1d5db;">|</span>

    <span>
        <strong>GPU RAM:</strong> ${request.machineId.gpuRam} GB
    </span>

    <span style="color:#d1d5db;">|</span>

    <span>
        <strong>Allotment:</strong>
        ${formatDate(request.allotmentStartTime)}
        -
        ${formatDate(request.allotmentEndTime)}
    </span>
</div>

    <!-- Purpose -->
    <div style="
        font-size:13px;
        color:#374151;
        margin-bottom:10px;
        line-height:1.4;
    ">
        <strong>Purpose:</strong>
        ${request.purpose}
    </div>

    <!-- Token -->
    ${
      showTokenAndButtons
        ? `
        <div style="
            display:flex;
            align-items:center;
            gap:8px;
            background:#f0fdf4;
            border:1px solid #dcfce7;
            border-radius:8px;
            padding:8px 12px;
            margin-bottom:10px;
            font-size:13px;
            color:#166534;
        ">
            <i class="fas fa-check-circle"></i>

            ${
              request.token
                ? `
                <span>
                    Token:
                    <strong>${request.token}</strong>
                </span>
            `
                : `
                <span>Token not generated yet</span>
            `
            }
        </div>
    `
        : ''
    }

    <!-- Bottom Row -->
    <div style="
        display:flex;
        justify-content:space-between;
        align-items:center;
        margin-top:6px;
    ">

        <!-- Buttons -->
        <div style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
        ">

           ${
             showReportButton
               ? `
    <button class="report-btn"
        style="
            display:inline-flex;
            align-items:center;
            gap:6px;
            background:#fff;
            color:#2563eb;
            border:1.5px solid #bfdbfe;
            border-radius:8px;
            padding:7px 14px;
            font-size:13px;
            font-weight:500;
            cursor:pointer;
        ">
        <i class="fas fa-file-alt"></i>
        Generate Report
    </button>
`
               : ''
           }

            ${
              showTokenAndButtons
                ? `
                <button
                    class="access-machine-btn"
                    data-request-id="${request._id}"
                    data-migid="${request.machineId.MIGID}"
                    style="
                        display:inline-flex;
                        align-items:center;
                        gap:6px;
                        background:#fff;
                        color:#0d9488;
                        border:1.5px solid #99f6e4;
                        border-radius:8px;
                        padding:7px 14px;
                        font-size:13px;
                        font-weight:500;
                        cursor:pointer;
                    ">
                    <i class="fas fa-desktop" style="font-size:13px;"></i>
                    Access Machine
                </button>
            `
                : ''
            }

            <button class="feedback-btn"
                style="
                    display:inline-flex;
                    align-items:center;
                    gap:6px;
                    background:#fff;
                    color:#16a34a;
                    border:1.5px solid #bbf7d0;
                    border-radius:8px;
                    padding:7px 14px;
                    font-size:13px;
                    font-weight:500;
                    cursor:pointer;
                ">
                <i class="fas fa-comment-dots" style="font-size:13px;"></i>
                Feedback
            </button>
        </div>

        <!-- Date -->
        <small style="
            color:#6b7280;
            white-space:nowrap;
            font-size:12px;
        ">
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
