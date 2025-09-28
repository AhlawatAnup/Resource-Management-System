// Import common functions
import { formatDate } from '/dashboard/common/js/commons.js';
import { getLoggedInStudentId, showLoadingState, showErrorMessage } from './student.utils.js';

document.addEventListener('DOMContentLoaded', function() {
    // Load the view requests page when DOM is ready
    loadViewRequestsPage();
});

async function loadViewRequestsPage() {
    try {
        // Show loading state
        showLoadingState('requests-content');
        
        // Get the logged-in student's ID from session/storage
        const studentId = await getLoggedInStudentId();
        
        if (!studentId) {
            throw new Error('Student ID not found. Please login again.');
        }
        
        // Display the requests page structure
        displayRequestsPageStructure();
        
        // Load all requests for this student
        loadAllRequests(studentId);
        
    } catch (error) {
        console.error('Error loading view requests page:', error);
        showErrorMessage('Failed to load requests. Please try again.', 'requests-content');
    }
}

function displayRequestsPageStructure() {
    const requestsContent = document.getElementById('requests-content');
    
    requestsContent.innerHTML = `
        <div class="requests-page">
            <!-- All Requests Section -->
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
                <div id="all-requests-list">
                    <!-- All requests will be loaded here -->
                </div>
            </div>
        </div>
    `;
    
    // Add event listener for status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterRequestsByStatus(this.value);
        });
    }
}

async function loadAllRequests(studentId) {
    try {
        const response = await fetch(`/dashboard/student/resource-requests/${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const requests = await response.json();
            displayAllRequests(requests);
        } else {
            console.warn('Failed to load requests');
            document.getElementById('all-requests-list').innerHTML = '<div class="no-requests"><p>No requests found.</p></div>';
        }
    } catch (error) {
        console.error('Error loading requests:', error);
        document.getElementById('all-requests-list').innerHTML = '<div class="error-message"><p>Error loading requests. Please try again.</p></div>';
    }
}

let allRequestsData = []; // Store all requests for filtering

function displayAllRequests(requests) {
    allRequestsData = requests; // Store for filtering
    const requestsList = document.getElementById('all-requests-list');
    
    if (!requests || requests.length === 0) {
        requestsList.innerHTML = `
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
    const sortedRequests = requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const requestsHTML = sortedRequests.map(request => {
        const statusClass = getRequestStatusClass(request);
        const statusIcon = getRequestStatusIcon(request);
        const statusText = getRequestStatusText(request);
        
        return `
            <div class="request-item detailed" data-status="${getRequestStatus(request)}">
                <div class="request-header">
                    <div class="request-title">
                        <h3>${request.title}</h3>
                        <span class="status-badge ${statusClass}">
                            ${statusIcon} ${statusText}
                        </span>
                    </div>
                    <div class="request-dates">
                        <small style="color: #888; display: block; margin-bottom: 4px;">
                            Request ID: ${request._id}
                        </small>
                        <small style="color: #666;">
                            Submitted: ${formatDate(request.createdAt)}
                        </small>
                    </div>
                </div>

                
                <div class="request-body">
                    <div class="request-purpose">
                        <h4>Purpose</h4>
                        <p>${request.purpose}</p>
                    </div>
                    
                    <div class="request-specs">
                        <h4>Resource Specifications</h4>
                        <div class="specs-grid">
                            <div class="spec-item">
                                <div class="spec-label">CPU Cores</div>
                                <div class="spec-value">${request.cpuCores} cores</div>
                            </div>
                            <div class="spec-item">
                                <div class="spec-label">CPU RAM</div>
                                <div class="spec-value">${request.cpuRam} GB</div>
                            </div>
                            <div class="spec-item">
                                <div class="spec-label">GPU Count</div>
                                <div class="spec-value">${request.gpuCount} GPUs</div>
                            </div>
                            <div class="spec-item">
                                <div class="spec-label">GPU RAM (each)</div>
                                <div class="spec-value">${request.gpuRam} GB</div>
                            </div>
                            <div class="spec-item">
                                <div class="spec-label">Duration</div>
                                <div class="spec-value">Until ${formatDate(request.expiryDate)}</div>
                            </div>
                            
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
    }).join('');
    
    requestsList.innerHTML = requestsHTML;
}

function getRequestStatus(request) {
    // Simplified status for filtering
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return 'approved';
    }
    
    if ((request.teacher_action && !request.teacher_verified) || 
        (request.admin_action && !request.admin_verified)) {
        return 'rejected';
    }
    
    return 'pending';
}

function filterRequestsByStatus(status) {
    const requestItems = document.querySelectorAll('.request-item.detailed');
    
    requestItems.forEach(item => {
        if (status === 'all' || item.dataset.status === status) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update the count display
    const visibleItems = document.querySelectorAll('.request-item.detailed[style="display: block"], .request-item.detailed:not([style*="display: none"])').length;
    const totalItems = requestItems.length;
    
    // Add/update filter info
    let filterInfo = document.getElementById('filter-info');
    if (!filterInfo) {
        filterInfo = document.createElement('div');
        filterInfo.id = 'filter-info';
        filterInfo.style.cssText = 'margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; color: #666; font-size: 0.9em;';
        document.getElementById('all-requests-list').insertBefore(filterInfo, document.getElementById('all-requests-list').firstChild);
    }
    
    const statusText = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
    filterInfo.innerHTML = `Showing ${visibleItems} of ${totalItems} requests (${statusText})`;
}

// Reuse utility functions from student.request.js
function getRequestStatusClass(request) {
    // Check verification status based on database model fields
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return 'status-approved';
    }
    
    if (request.teacher_action && !request.teacher_verified) {
        return 'status-rejected';
    }
    
    if (request.admin_action && !request.admin_verified) {
        return 'status-rejected';
    }
    
    if (request.teacher_action && request.teacher_verified && !request.admin_action) {
        return 'status-in-progress';
    }
    
    return 'status-pending';
}

function getRequestStatusIcon(request) {
    // Check verification status based on database model fields
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return '✓';
    }
    
    if ((request.teacher_action && !request.teacher_verified) || 
        (request.admin_action && !request.admin_verified)) {
        return '✗';
    }
    
    if (request.teacher_action && request.teacher_verified && !request.admin_action) {
        return '⏳';
    }
    
    return '⏳';
}

function getRequestStatusText(request) {
    // Check verification status based on database model fields
    if (request.teacher_verified && request.admin_verified && request.is_verified) {
        return 'Approved';
    }
    
    if (request.teacher_action && !request.teacher_verified) {
        return 'Rejected by Teacher';
    }
    
    if (request.admin_action && !request.admin_verified) {
        return 'Rejected by Admin';
    }
    
    if (request.teacher_action && request.teacher_verified && !request.admin_action) {
        return 'Pending Admin Approval';
    }
    
    if (!request.teacher_action) {
        return 'Pending Teacher Review';
    }
    
    return 'Pending Review';
}