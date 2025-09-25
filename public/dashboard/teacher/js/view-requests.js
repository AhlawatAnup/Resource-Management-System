// Import common functions
import { getInitials, getRandomNamedColor } from '../../Common/js/commons.js';

let resourceRequests = [];
let filteredRequests = [];

// Fetch resource requests from teacher dashboard data
async function loadResourceRequests() {
  try {
    const response = await fetch("/dashboard/teacher/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Teacher Dashboard Data:", data);

    // Extract resource requests from the dashboard data
    resourceRequests = data.resourceRequests || [];
    filteredRequests = [...resourceRequests];

    console.log(`Found ${resourceRequests.length} resource requests`);
    renderResourceRequests(filteredRequests);

  } catch (error) {
    console.error("Error fetching resource requests:", error);
    document.getElementById("requestsTableBody").innerHTML =
      '<tr><td colspan="7" class="loading">Error loading requests. Please refresh the page.</td></tr>';
  }
}

// Render resource requests in the table
function renderResourceRequests(requests) {
  const tbody = document.getElementById("requestsTableBody");
  
  if (!requests || requests.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="7" class="loading">No resource requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = "";

  requests.forEach((request) => {
    const tr = document.createElement("tr");
    
    // Get status info
    const statusInfo = getRequestStatus(request);
    
    tr.innerHTML = `
      <td>
        <div class="contact-info">
          <div class="avatar ${getRandomNamedColor()}">${getInitials(request.studentInfo.name)}</div>
          <div class="contact-details">
            <h4>${request.studentInfo.name}</h4>
            <div class="contact-time">${request.studentInfo.rollNo} - ${request.studentInfo.branch}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="request-title">
          <h4>${request.title}</h4>
          <div class="request-date">Created: ${formatDate(request.createdAt)}</div>
        </div>
      </td>
      <td>
        <div class="purpose-text">
          ${request.purpose.length > 50 ? request.purpose.substring(0, 50) + '...' : request.purpose}
        </div>
      </td>
      <td>
        <div class="resource-specs">
          <div><strong>CPU:</strong> ${request.cpuCores} cores, ${request.cpuRam}GB RAM</div>
          <div><strong>GPU:</strong> ${request.gpuCount} × ${request.gpuRam}GB</div>
        </div>
      </td>
      <td>
        <div class="expiry-date">
          ${formatDate(request.expiryDate)}
          ${isExpiringSoon(request.expiryDate) ? '<span class="expiring-soon">⚠️ Soon</span>' : ''}
        </div>
      </td>
      <td>
        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
      </td>
      <td>
        <div class="owner-info">
          ${getActionButtons(request)}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Get request status information
function getRequestStatus(request) {
  if (request.teacher_verified && request.admin_verified) {
    return { text: "Approved", class: "verified" };
  } else if (request.teacher_action && !request.teacher_verified) {
    return { text: "Declined by Teacher", class: "declined" };
  } else if (request.admin_action && !request.admin_verified) {
    return { text: "Declined by Admin", class: "declined" };
  } else if (request.teacher_verified && !request.admin_action) {
    return { text: "Pending Admin", class: "pending-admin" };
  } else if (!request.teacher_action) {
    return { text: "Pending Teacher", class: "pending-teacher" };
  } else {
    return { text: "Pending", class: "pending" };
  }
}

// Get action buttons based on request status
function getActionButtons(request) {
  if (request.teacher_action) {
    return '<span style="color: #666; font-style: italic;">Action Completed</span>';
  }

  return `
    <button class="icon-btn approve-btn" title="Approve Request" data-request-id="${request._id}" data-action="approve">
      <i class="fa-solid fa-check"></i>
    </button>
    <button class="icon-btn decline-btn" title="Decline Request" data-request-id="${request._id}" data-action="decline">
      <i class="fa-solid fa-times"></i>
    </button>
  `;
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Check if date is expiring soon (within 7 days)
function isExpiringSoon(dateString) {
  if (!dateString) return false;
  const expiryDate = new Date(dateString);
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
}

// Update resource request verification status
async function updateRequestVerification(requestId, isVerified) {
  try {
    const action = isVerified ? 'approve' : 'decline';
    if (!confirm(`Are you sure you want to ${action} this resource request?`)) {
      return;
    }

    const response = await fetch(`/dashboard/teacher/verify_request/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_verified: isVerified })
    });

    if (!response.ok) {
      throw new Error('Failed to update request verification');
    }

    const result = await response.json();
    console.log('Request verification updated:', result);

    // Update the local data
    const requestIndex = resourceRequests.findIndex(r => r._id === requestId);
    if (requestIndex !== -1) {
      resourceRequests[requestIndex].teacher_verified = isVerified;
      resourceRequests[requestIndex].teacher_action = true;
    }

    // Re-render the table
    filterRequests(document.getElementById('searchInput').value);

    // Show success message
    showNotification(`Resource request ${isVerified ? 'approved' : 'declined'} successfully!`, 'success');

  } catch (error) {
    console.error('Error updating request verification:', error);
    showNotification('Failed to update request verification. Please try again.', 'error');
  }
}

// Filter requests based on search term
function filterRequests(searchTerm) {
  if (!resourceRequests.length) {
    document.getElementById("requestsTableBody").innerHTML =
      '<tr><td colspan="7" class="loading">No resource requests found.</td></tr>';
    return;
  }

  if (!searchTerm.trim()) {
    filteredRequests = [...resourceRequests];
  } else {
    const term = searchTerm.toLowerCase();
    filteredRequests = resourceRequests.filter(
      (request) =>
        request.studentInfo.name.toLowerCase().includes(term) ||
        request.studentInfo.rollNo.toLowerCase().includes(term) ||
        request.title.toLowerCase().includes(term) ||
        request.purpose.toLowerCase().includes(term)
    );
  }

  renderResourceRequests(filteredRequests);
}

// Show popup toast notifications
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Load resource requests when page loads
  loadResourceRequests();

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterRequests(e.target.value);
    });
  }

  // Event delegation for approve/decline buttons
  document.getElementById("requestsTableBody").addEventListener("click", (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn');
    if (button) {
      const requestId = button.getAttribute('data-request-id');
      const action = button.getAttribute('data-action');
      const isVerified = action === 'approve';
      updateRequestVerification(requestId, isVerified);
    }
  });
});