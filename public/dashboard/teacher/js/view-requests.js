// Import common functions
import { 
  getInitials, 
  getRandomNamedColor, 
  formatDate,
  initializePurposePanel,
  createViewMoreButton,
  isValidUsername,
  logoutDirectly
} from '../../common/js/commons.js';

let resourceRequests = [];
let filteredRequests = [];
let teacherVerificationStatus = { is_verified: false };

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
      // If teacher account not found (404), logout user
      if (response.status === 404) {
        logoutDirectly();
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log("Teacher Dashboard Data:", data);

    // Store teacher verification status
    teacherVerificationStatus = {
      is_verified: data.is_verified,
      verification_completed: data.verification_completed
    };

    // Don't show requests if teacher is not verified
    if (!teacherVerificationStatus.is_verified) {
      document.getElementById("requestsTableBody").innerHTML =
        '<tr><td colspan="7" class="loading">Your account must be verified by admin to view resource requests</td></tr>';
      return;
    }

    // Extract resource requests from the dashboard data
    resourceRequests = data.resourceRequests || [];
    filteredRequests = [...resourceRequests];

    // console.log(`Found ${resourceRequests.length} resource requests`);
    renderResourceRequests(filteredRequests);

  } catch (error) {
    console.error("Error fetching resource requests:", error);
    logoutDirectly();
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
          <small>${request.title}</small>
          <div class="request-date"> ${formatDate(request.createdAt)}</div>
        </div>
      </td>
      <td>
        <div class="purpose-text">
          <span>${request.purpose.length > 20 ? request.purpose.substring(0, 20) + '...' : request.purpose}</span>
          ${createViewMoreButton(request._id, request.purpose)}
        </div>
      </td>
      <td>
        <div class="resource-specs">
          <!-- <div><strong>CPU:</strong> ${request.cpuCores} cores, ${request.cpuRam}GB RAM</div> -->
          <div><strong>GPU:</strong> ${request.gpuRam}GB</div>
        </div>
      </td>
      <td>
        <div class="expiry-date">
          ${formatDate(request.expiryDate)}
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
    <button class="icon-btn edit-btn" title="Edit Request" data-request-id="${request._id}" data-action="edit">
      <i class="fa-solid fa-pen-to-square"></i>
    </button>
  `;
}

// Update resource request verification status
async function updateRequestVerification(requestId, isVerified) {
  // Check if teacher is verified
  if (!teacherVerificationStatus.is_verified) {
    showNotification('You must be verified by admin before approving resource requests', 'error');
    return;
  }

  try {
    const action = isVerified ? 'approve' : 'decline';
    const result_confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this resource request?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action}`,
      cancelButtonText: 'Cancel',
      draggable: true,
      scrollbarPadding: false,
      heightAuto: false
    });
    
    if (!result_confirmation.isConfirmed) {
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
    // console.log('Request verification updated:', result);

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
  // Initialize purpose panel functionality
  initializePurposePanel();
  
  // Load resource requests when page loads
  loadResourceRequests();

  // Initialize Flatpickr calendar for expiry date
  flatpickr('#editExpiryDate', {
    mode: 'single',
    dateFormat: 'Y-m-d',
    minDate: 'today',
    enableTime: false,
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      filterRequests(e.target.value);
    });
  }

  // Event delegation for approve/decline/edit buttons
  document.getElementById("requestsTableBody").addEventListener("click", (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn, .edit-btn');
    if (button) {
      const requestId = button.getAttribute('data-request-id');
      const action = button.getAttribute('data-action');
      if (action === 'edit') {
        showEditModal(requestId);
      } else {
        const isVerified = action === 'approve';
        updateRequestVerification(requestId, isVerified);
      }
    }
  });

  // Modal close button
  document.getElementById('closeEditModal').onclick = function() {
    document.getElementById('editRequestModal').style.display = 'none';
  };

  // Modal form submit
  document.getElementById('editRequestForm').onsubmit = async function(e) {
    e.preventDefault();
    const submitBtn = e.submitter || this.querySelector('button[type="submit"]');
    await submitEditRequest(submitBtn);
  };
});

// Show edit modal and populate fields
function showEditModal(requestId) {
  const req = resourceRequests.find(r => r._id === requestId);
  if (!req) return;
  const submitBtn = document.querySelector('#editRequestForm button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '';
    submitBtn.style.cursor = '';
  }
  document.getElementById('editRequestId').value = req._id;
  document.getElementById('editTitle').value = req.title;
  document.getElementById('editPurpose').value = req.purpose;
  document.getElementById('editExpiryDate').value = req.expiryDate ? req.expiryDate.split('T')[0] : '';
  // document.getElementById('editCpuCores').value = req.cpuCores;
  // document.getElementById('editCpuRam').value = req.cpuRam;
  // document.getElementById('editGpuCount').value = req.gpuCount;
  document.getElementById('editGpuRam').value = req.gpuRam;
  document.getElementById('editUsername').value = req.username || '';
  document.getElementById('editRequestModal').style.display = 'block';
}

// Submit edit request to backend
async function submitEditRequest(submitBtn) {
  const requestId = document.getElementById('editRequestId').value;
  const payload = {
    title: document.getElementById('editTitle').value,
    purpose: document.getElementById('editPurpose').value,
    expiryDate: document.getElementById('editExpiryDate').value,
    // cpuCores: Number(document.getElementById('editCpuCores').value),
    // cpuRam: Number(document.getElementById('editCpuRam').value),
    // gpuCount: Number(document.getElementById('editGpuCount').value),
    gpuRam: Number(document.getElementById('editGpuRam').value),
    username: document.getElementById('editUsername').value
  };
  const usernameErrorDiv = document.getElementById('edit-username-error');
  if (!isValidUsername(payload.username)) {
    if (usernameErrorDiv) {
      usernameErrorDiv.textContent = 'Username can only contain letters, numbers, hyphens (-), and underscores (_), with no spaces or special characters';
    }
    return;
  } else if (usernameErrorDiv) {
    usernameErrorDiv.textContent = '';
  }
  // Title max length check
  const titleErrorDiv = document.getElementById('edit-title-error');
  if (payload.title.length > 50) {
    if (titleErrorDiv) {
      titleErrorDiv.textContent = 'Title must not exceed 50 characters';
    }
    return;
  } else if (titleErrorDiv) {
    titleErrorDiv.textContent = '';
  }
  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
    }
    const response = await fetch(`/dashboard/teacher/edit_request/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    // console.log("Status:", response.status);
    let result;
    try {
      result = await response.json();
    } catch (jsonErr) {
      console.error("Failed to parse JSON response:", jsonErr);
      throw new Error('Invalid server response');
    }
    // console.log("Response:", result);
    if (!response.ok || !result.success) {
      const errorMsg = result && result.error ? result.error : 'Failed to edit request';
      throw new Error(errorMsg);
    }
    // Update local data
    const idx = resourceRequests.findIndex(r => r._id === requestId);
    if (idx !== -1) {
      // Merge studentInfo from old request if missing in updated one
      if (!result.resourceRequest.studentInfo && resourceRequests[idx].studentInfo) {
        result.resourceRequest.studentInfo = resourceRequests[idx].studentInfo;
      }
      resourceRequests[idx] = result.resourceRequest;
    }
    filterRequests(document.getElementById('searchInput').value);
    document.getElementById('editRequestModal').style.display = 'none';
    showNotification('Resource request updated successfully!', 'success');
  } catch (err) {
    console.error('Edit request error:', err);
    showNotification(err.message || 'Failed to update resource request.', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';
      submitBtn.style.cursor = '';
    }
  }
}