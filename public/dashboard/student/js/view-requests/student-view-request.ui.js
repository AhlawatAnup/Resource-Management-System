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

    // Attach all event handlers
    attachPasswordToggleHandlers();
    attachCopyHandlers();
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
                    <h4>Username</h4>
                    <p>${request.username}</p>
                </div>

                <div class="request-purpose">
                    <h4>Purpose</h4>
                    <p>${request.purpose}</p>
                </div>
                
                <div class="request-specs">
                    <h4>Resource Specifications</h4>
                    <div class="specs-grid">
                        <div class="spec-item">
                            <div class="spec-label">GPU RAM</div>
                            <div class="spec-value">${request.gpuRam} GB</div>
                        </div>
                        <div class="spec-item">
                            <div class="spec-label">Duration</div>
                            <div class="spec-value">Until ${formatDate(request.expiryDate)}</div>
                        </div>

                        ${renderCredentials(request)}
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="request-footer" style="display:flex; justify-content:flex-end; gap:12px; margin-top:12px;">
                <small style="color:#888;">Request ID: ${request._id}</small>
                <small style="color:#666;">Submitted: ${formatDate(request.createdAt)}</small>
            </div>
        </div>
    `;
}

// ==============================
// Credentials Section
// ==============================

function renderCredentials(request) {
    if (!(request.teacher_verified && request.admin_verified && request.is_verified && request.vmCredentials && request.vmCredentials.password)) {
        return '';
    }

    return `
        <div class="request-credentials" style="background:#e6f7e6; border-radius:12px; width:30vw; padding:16px; margin:12px 0; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
            <h4 style="margin-bottom:12px; color:#2f6627;">Login Credentials</h4>
            <div class="credentials-grid" style="display:flex; flex-direction:column; gap:10px;">
                
                <!-- Username -->
                <div class="credential-item" style="display:flex; align-items:center; gap:10px; max-width:100%;">
                    <strong style="width:80px;">Username:</strong>
                    <span id="username-${request._id}" style="border:1px solid #c3e6c3; border-radius:6px; padding:6px 10px; background:#f0fff0; flex:1;">
                        ${request.username}
                    </span>
                    <button type="button" class="copy-btn" data-copytarget="username-${request._id}" style="background:none; border:none; cursor:pointer; padding:0 6px; flex-shrink:0;">
                        <span class="copy-label"><i class="fas fa-copy"></i></span>
                    </button>
                </div>

                <!-- Password -->
                <div class="credential-item" style="display:flex; align-items:flex-start; gap:10px; max-width:100%;">
                    <strong style="width:80px;">Password:</strong>
                    <div style="display:flex; align-items:center; border:1px solid #c3e6c3; border-radius:6px; padding:6px 10px; width:100%; background:#f0fff0;">
                        <span class="masked-password" id="masked-pw-${request._id}" style="flex:1; white-space:normal; word-break:break-word;">
                            ****************
                        </span>
                        <span class="real-password" id="real-pw-${request._id}" style="flex:1; display:none; white-space:normal; word-break:break-word;">
                            ${request.vmCredentials.password}
                        </span>
                        <button type="button" class="toggle-pw-btn" data-pwid="${request._id}" style="background:none; border:none; cursor:pointer; padding:0 6px; flex-shrink:0;">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                ${request.vmCredentials.ip ? `
                <div class="credential-item" style="display:flex; align-items:center; gap:10px; max-width:100%;">
                    <strong style="width:80px;">IP:</strong>
                    <span id="ip-${request._id}" style="border:1px solid #c3e6c3; border-radius:6px; padding:6px 10px; background:#f0fff0; flex:1;">
                        ${request.vmCredentials.ip}
                    </span>
                    <button type="button" class="copy-btn" data-copytarget="ip-${request._id}" style="background:none; border:none; cursor:pointer; padding:0 6px; flex-shrink:0;">
                        <span class="copy-label"><i class="fas fa-copy"></i></span>
                    </button>
                </div>` : ''}

                ${(request.machineId && request.machineId.MIGID) ? `
                <div class="credential-item" style="display:flex; align-items:center; gap:10px; max-width:100%;">
                    <strong style="width:80px;">MIG ID:</strong>
                    <span id="migid-${request._id}" style="border:1px solid #c3e6c3; border-radius:6px; padding:6px 10px; background:#f0fff0; flex:1;">
                        ${request.machineId.MIGID}
                    </span>
                    <button type="button" class="copy-btn" data-copytarget="migid-${request._id}" style="background:none; border:none; cursor:pointer; padding:0 6px; flex-shrink:0;">
                        <span class="copy-label"><i class="fas fa-copy"></i></span>
                    </button>
                </div>` : ''}
            </div>
        </div>
    `;
}

// ==============================
// Event Handlers
// ==============================

function attachPasswordToggleHandlers() {
    document.querySelectorAll('.toggle-pw-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const pwid = btn.getAttribute('data-pwid');
            const masked = document.getElementById('masked-pw-' + pwid);
            const real = document.getElementById('real-pw-' + pwid);
            if (masked.style.display === 'none') {
                masked.style.display = '';
                real.style.display = 'none';
                btn.innerHTML = '<i class="fas fa-eye"></i>';
            } else {
                masked.style.display = 'none';
                real.style.display = '';
                btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            }
        });
    });
}

function attachCopyHandlers() {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = btn.getAttribute('data-copytarget');
            const targetElem = document.getElementById(targetId);
            if (!targetElem) return;

            const text = targetElem.textContent.trim();

            const fallback = () => {
                const tempInput = document.createElement('input');
                tempInput.value = text;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            };

            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).catch(fallback);
            } else {
                fallback();
            }

            const labelSpan = btn.querySelector('.copy-label');
            if (!labelSpan) return;
            const originalContent = labelSpan.innerHTML;
            labelSpan.innerHTML = 'Copied!';
            setTimeout(() => labelSpan.innerHTML = originalContent, 1200);
        });
    });
}

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
