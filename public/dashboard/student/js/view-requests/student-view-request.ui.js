// ui.js

import { formatDate } from '../../../common/js/commons.js';
import {
    getRequestStatus,
    getRequestStatusText,
    getRequestStatusClass,
    getRequestStatusIcon,
    canDeleteRequest
} from '../student.utils.js';

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
    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    container.innerHTML = sortedRequests.map(request => createRequestCard(request)).join('');

    attachDeleteHandlers(onDelete, onReload);
}

// ==============================
// Filter
// ==============================

export function filterRequests(status) {
    const requestItems = document.querySelectorAll('.request-item.detailed');

    requestItems.forEach(item => {
        if (status === 'all' || item.dataset.status === status) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });

    // Update the count display
    const visibleItems = document.querySelectorAll('.request-item.detailed:not([style*="display: none"])').length;
    const totalItems = requestItems.length;

    let filterInfo = document.getElementById('filter-info');
    if (!filterInfo) {
        filterInfo = document.createElement('div');
        filterInfo.id = 'filter-info';
        filterInfo.style.cssText = 'margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; color: #666; font-size: 0.9em;';
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
    const editedBadge = request.isEdited ? '<span class="edited-badge" style="margin-left: 8px; color: #ff7a45; font-size: 0.85em; font-weight: 500;">(edited by teacher/admin)</span>' : '';

    const canDelete = canDeleteRequest(request);

    const isVerified = request.is_verified && request.machineId && request.machineId.MIGID;
    const showTokenAndButtons = isVerified && request.isAllotmentActive;

    return `
        <div class="request-item detailed" data-status="${status}" style="position:relative; border:1px solid #ddd; border-radius:12px; padding:16px; margin-bottom:16px; background:#fff; box-shadow:0 2px 6px rgba(0,0,0,0.05);">

            <!-- Delete Button Top-Right -->
            ${canDelete ? `<button type="button" class="delete-request-btn" data-request-id="${request._id}" style="position:absolute; top:16px; right:16px; background:#ff4d4f; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:500; transition:0.2s;">Delete</button>` : ''}

            <!-- Header -->
            <div class="request-header">
                <div class="request-title">
                    <h3>${request.title}</h3>
                    <span class="status-badge ${statusClass}">
                        ${statusIcon} ${statusText}${editedBadge}
                    </span>
                </div>
            </div>

            <!-- Body -->
            <div class="request-body">
                <div class="request-purpose">
                    <h4>Purpose</h4>
                    <p>${request.purpose}</p>
                </div>
            </div>

            <!-- Token Section and Buttons -->
            ${showTokenAndButtons ? `
                <div class="request-token" id="token-field-${request._id}"
                     style="margin:12px 0; padding:10px; background:#f6ffed; border-left:4px solid #52c41a; border-radius:6px; color:#237804;">
                    
                    ${request.token 
                        ? `<strong>Token:</strong> 
                           <span class="token-value" style="font-family:monospace;">${request.token}</span>`
                        : `<span style="color:#999;">Token not generated yet</span>`
                    }
                </div>

                    <button class="raise-token-btn" 
                            data-request-id="${request._id}" 
                            style="cursor:pointer">
                        Raise Token
                    </button>

                    <button class="access-machine-btn" 
                            data-request-id="${request._id}" 
                            data-migid="${request.machineId.MIGID}" 
                            style="cursor:pointer">
                        Access Machine
                    </button>
                    `
                    : ''}

            <!-- Footer -->
            <div class="request-footer" 
                 style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px; align-items:center;">
                <small style="color:#666;">Submitted: ${formatDate(request.createdAt)}</small>
            </div>
        </div>
    `;
}

// ==============================
// Event Handlers
// ==============================


function attachDeleteHandlers(onDelete, onReload) {
    document.querySelectorAll('.delete-request-btn').forEach(btn => {
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
                heightAuto: false
            });

            if (result.isConfirmed) {
                await onDelete(requestId);
                onReload();
            }
        });
    });
}
