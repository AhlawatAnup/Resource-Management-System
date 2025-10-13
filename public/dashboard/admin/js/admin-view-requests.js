// Import common functions
import { 
  getInitials, 
  getRandomNamedColor, 
  formatDate,
  showPurposePanel, 
  closePurposePanel, 
  initializePurposePanel,
  createViewMoreButton,
  isValidUsername
} from '../../Common/js/commons.js';

let resourceRequests = [];
let filteredRequests = [];

// Fetch all resource requests for admin
async function loadResourceRequests() {
  try {
    const response = await fetch("/dashboard/admin/resource-requests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Admin Resource Requests Data:", data);

    resourceRequests = data.requests || [];
    filteredRequests = [...resourceRequests];

    console.log(`Found ${resourceRequests.length} resource requests`);
    renderResourceRequests(filteredRequests);

  } catch (error) {
    console.error("Error fetching resource requests:", error);
    document.getElementById("requestsTableBody").innerHTML =
      '<tr><td colspan="8" class="loading">Error loading requests. Please refresh the page.</td></tr>';
  }
}

// Render resource requests in the table
function renderResourceRequests(requests) {
  const tbody = document.getElementById("requestsTableBody");
  
  if (!requests || requests.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="loading">No resource requests found.</td></tr>';
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
            <div class="contact-time">${request.studentInfo.rollNo}</div>
            <div class="contact-time">${request.studentInfo.branch}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="teacher-info">
          <h4>${request.teacherInfo.name}</h4>
        </div>
      </td>
      <td>
        <div class="request-title">
          <p>${request.title}<p>
          <div class="request-date"><span class="field-label">Created:</span> ${formatDate(request.createdAt)}</div>
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
          <!-- <div><span class="field-label">CPU:</span> ${request.cpuCores} cores, ${request.cpuRam}GB RAM</div> -->
          <div><span class="field-label">GPU:</span> ${request.gpuRam}GB</div>
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
        <div class="admin-actions">
          ${getActionButtons(request)}
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Get request status information
function getRequestStatus(request) {
  if (request.admin_action && request.admin_verified) {
    return { text: "Approved", class: "verified" };
  } else if (request.admin_action && !request.admin_verified) {
    return { text: "Declined by Admin", class: "declined" };
  } else if (request.teacher_action && !request.teacher_verified) {
    return { text: "Declined by Teacher", class: "declined" };
  } else if (request.teacher_verified && !request.admin_action) {
    return { text: "Pending Admin", class: "pending-admin" };
  } else if (!request.teacher_action) {
    return { text: "Pending Teacher", class: "pending-teacher" };
  } else {
    return { text: "Pending", class: "pending" };
  }
}

// Get action buttons based on request status (Admin perspective)
function getActionButtons(request) {

  // If admin has already taken action
  if (request.admin_action) {
    return '<span style="color: #666; font-style: italic;">Action Completed</span>';
  }

  // Admin can approve/decline/edit
  return `
    <button class="icon-btn approve-btn" title="Approve Request" data-request-id="${request._id}" data-action="approve">
      <i class="fas fa-check"></i>
    </button>
    <button class="icon-btn decline-btn" title="Decline Request" data-request-id="${request._id}" data-action="decline">
      <i class="fas fa-times"></i>
    </button>
    <button class="icon-btn edit-btn" title="Edit Request" data-request-id="${request._id}" data-action="edit">
      <i class="fas fa-edit"></i>
    </button>
  `;
}

// Update resource request verification status
async function updateRequestVerification(requestId, isVerified) {
  // For decline, show immediate confirmation
  if (!isVerified) {
    if (!confirm(`Are you sure you want to decline this resource request?`)) {
      return;
    }
    await submitVerification(requestId, isVerified);
    return;
  }

  // For approve, show the modal with credentials form
  showVerificationModal(requestId);
}

// Show verification modal for approval
function showVerificationModal(requestId) {
  const modal = document.getElementById('verificationModal');
  const request = resourceRequests.find(r => r._id === requestId);
  
  if (!request || !modal) {
    console.error('Request or modal not found');
    return;
  }

  // Populate request info in modal with more compact layout
  const requestInfo = document.getElementById('modalRequestInfo');
  requestInfo.innerHTML = `
    <div class="request-summary">
      <h5>${request.title}</h5>
      <div class="request-details">
        <p><strong>Student:</strong> ${request.studentInfo.name}</p>
        <p><strong>Roll No:</strong> ${request.studentInfo.rollNo}</p>
        <p><strong>Teacher:</strong> ${request.teacherInfo.name}</p>
        <!-- <p><strong>CPU:</strong> ${request.cpuCores} cores, ${request.cpuRam}GB RAM</p> -->
        <p><strong>GPU:</strong> ${request.gpuRam}GB</p>
        <p><strong>Purpose:</strong> ${request.purpose.length > 80 ? request.purpose.substring(0, 80) + '...' : request.purpose}</p>
      </div>
    </div>
  `;

  // Store request ID for form submission
  modal.setAttribute('data-request-id', requestId);

  // Clear form fields
  const vmUsernameEl = document.getElementById('vmUsername');
  const vmPasswordEl = document.getElementById('vmPassword');

  // Username is always required and provided by student, so prefill and make read-only
  if (vmUsernameEl) {
    vmUsernameEl.value = request.username;
    vmUsernameEl.readOnly = true;
  }

  if (vmPasswordEl) vmPasswordEl.value = '';
  // Populate available machines into the MIGID select
  populateAvailableMachinesSelect();

  // Show modal
  modal.style.display = 'block';
}

// Fetch machines and populate the MIGID select with unassigned machines
async function populateAvailableMachinesSelect() {
  const select = document.getElementById('vmMigId');
  if (!select) return;

  // Show loading option
  select.innerHTML = '<option value="" disabled selected>Loading available machines...</option>';

  try {
    const resp = await fetch('/dashboard/admin/machines', { credentials: 'include' });
    if (!resp.ok) throw new Error('Failed to load machines');
    const json = await resp.json();
    const machines = json.machines || [];

    // Filter unassigned machines (isAssigned false or assignedStudent null)
    const freeMachines = machines.filter(m => {
      // backend normalizes assignedStudent to null when unassigned
      const isAssigned = (typeof m.isAssigned === 'boolean') ? m.isAssigned : !!m.assignedStudent;
      return !isAssigned;
    });

    if (!freeMachines.length) {
      select.innerHTML = '<option value="" disabled selected>No available machines</option>';
      return;
    }

    // Build options
    select.innerHTML = '<option value="" disabled selected>Select a machine</option>' +
      freeMachines.map(m => `<option value="${m.MIGID}">${m.MIGID} (${m.gpuRam}GB GPU)</option>`).join('');
  } catch (err) {
    console.error('Error loading machines for MIGID select', err);
    select.innerHTML = '<option value="" disabled selected>Error loading machines</option>';
  }
}

// Close verification modal
function closeVerificationModal() {
  const modal = document.getElementById('verificationModal');
  modal.style.display = 'none';
}

// Submit verification with credentials
async function submitVerification(requestId, isVerified, credentials = null) {
  try {
    console.log('Submitting verification:', {
      requestId,
      isVerified,
      credentials
    });

    const requestBody = { 
      is_verified: isVerified,
      vmCredentials: credentials
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`/dashboard/admin/verify_request/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // Get the error details from response
      const errorText = await response.text();
      console.error('Server response:', response.status, errorText);
      
      let errorMessage = 'Failed to update request verification';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use the text as error message
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Request verification updated:', result);

    // Update the local data
    const requestIndex = resourceRequests.findIndex(r => r._id === requestId);
    if (requestIndex !== -1) {
      resourceRequests[requestIndex].admin_verified = isVerified;
      resourceRequests[requestIndex].admin_action = true;
      if (isVerified) {
        resourceRequests[requestIndex].is_verified = true;
        // Set teacher fields when admin approves (admin approval overrides teacher verification)
        resourceRequests[requestIndex].teacher_verified = true;
        resourceRequests[requestIndex].teacher_action = true;
        if (credentials) {
          resourceRequests[requestIndex].vmCredentials = credentials;
        }
      }
    }

    // Re-render the table
    filterRequests(document.getElementById('searchInput').value);

    // Show success message
    showNotification(`Resource request ${isVerified ? 'approved' : 'declined'} successfully!`, 'success');

  } catch (error) {
    console.error('Error updating request verification:', error);
    showNotification('Failed to update request verification. Please try again.', 'error');
    throw error;
  }
}

// Filter requests based on search term
function filterRequests(searchTerm) {
  if (!resourceRequests.length) {
    document.getElementById("requestsTableBody").innerHTML =
      '<tr><td colspan="8" class="loading">No resource requests found.</td></tr>';
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
        request.teacherInfo.name.toLowerCase().includes(term) ||
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

// Generate a secure random password using Web Crypto API
function generateSecurePassword(length = 12) {
  try {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const digits = '0123456789';
    const symbols = '@#$&';
    const all = upper + lower + digits + symbols;

    // Helper to get a secure random integer in [0, max)
    const randInt = (max) => {
      const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
      return uint32 % max;
    };

    // Ensure password has at least one char from each required set
    let passwordChars = [];
    passwordChars.push(upper[randInt(upper.length)]);
    passwordChars.push(lower[randInt(lower.length)]);
    passwordChars.push(digits[randInt(digits.length)]);
    passwordChars.push(symbols[randInt(symbols.length)]);

    // Fill the remaining length
    for (let i = passwordChars.length; i < length; i++) {
      passwordChars.push(all[randInt(all.length)]);
    }

    // Shuffle using Fisher-Yates with secure randomness
    for (let i = passwordChars.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      const tmp = passwordChars[i];
      passwordChars[i] = passwordChars[j];
      passwordChars[j] = tmp;
    }

    return passwordChars.join('');
  } catch (err) {
    // Fallback to simple random if crypto isn't available
    const fallbackChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    for (let i = 0; i < length; i++) {
      res += fallbackChars[Math.floor(Math.random() * fallbackChars.length)];
    }
    return res;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Initialize purpose panel and load resource requests
  initializePurposePanel();
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

  // Copy button delegation inside modals (copy username/password/migId)
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.copy-btn');
    if (!btn) return;
    const targetId = btn.getAttribute('data-target');
    if (!targetId) return;

    const el = document.getElementById(targetId);
    if (!el) {
      showNotification('Field not found to copy', 'error');
      return;
    }

    // Get value for select or input
    const value = (el.tagName.toLowerCase() === 'select') ? (el.value || '') : (el.value || '');

    if (!value) {
      showNotification('Nothing to copy', 'error');
      return;
    }

    // Use clipboard API
    navigator.clipboard.writeText(value).then(() => {
      showNotification('Copied to clipboard', 'success');
    }).catch(err => {
      console.error('Clipboard copy failed', err);
      showNotification('Failed to copy', 'error');
    });
  });

  // Generate VM password button handler
  document.body.addEventListener('click', (e) => {
    const genBtn = e.target.closest('#generateVmPasswordBtn');
    if (!genBtn) return;

    // Generate a secure random password and set it to the vmPassword field
    const pwd = generateSecurePassword(12);
    const pwdEl = document.getElementById('vmPassword');
    if (pwdEl) {
      pwdEl.value = pwd;
      // Attempt to copy to clipboard and notify user
      navigator.clipboard.writeText(pwd).then(() => {
        showNotification('Generated password copied to clipboard', 'success');
      }).catch(() => {
        showNotification('Generated password set (copy failed)', 'success');
      });
    } else {
      showNotification('Password field not found', 'error');
    }
  });

  // Modal form submit
  document.getElementById('editRequestForm').onsubmit = async function(e) {
    e.preventDefault();
    await submitEditRequest();
  };

  // Verification form submission handler
  const verificationForm = document.getElementById('verificationForm');
  if (verificationForm) {
    verificationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const modal = document.getElementById('verificationModal');
      const requestId = modal.getAttribute('data-request-id');
      
      if (!requestId) {
        showNotification('Error: Request ID not found', 'error');
        return;
      }
      
      const username = document.getElementById('vmUsername').value.trim();
      const password = document.getElementById('vmPassword').value.trim();
      const ip = document.getElementById('vmIp').value.trim();
      const migId = document.getElementById('vmMigId').value.trim();

      // Frontend validation
      if (!username || !password || !ip || !migId) {
        showNotification('Please fill in all credentials fields', 'error');
        return;
      }
      
      if (username.length < 3) {
        showNotification('Username must be at least 3 characters long', 'error');
        return;
      }
      
      if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
      }
      
      const credentials = {
        username,
        password,
        ip,
        migId
      };
      
      console.log('Form submission - credentials:', credentials);
      
      try {
        await submitVerification(requestId, true, credentials);
        closeVerificationModal();
      } catch (error) {
        // Error already handled in submitVerification
        console.error('Form submission error:', error);
      }
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    const modal = document.getElementById('verificationModal');
    if (e.target === modal) {
      closeVerificationModal();
    }
  });

});

// Show edit modal and populate fields
function showEditModal(requestId) {
  const req = resourceRequests.find(r => r._id === requestId);
  if (!req) return;
  document.getElementById('editRequestId').value = req._id;
  document.getElementById('editTitle').value = req.title;
  document.getElementById('editPurpose').value = req.purpose;
  document.getElementById('editExpiryDate').value = req.expiryDate ? req.expiryDate.split('T')[0] : '';
  // document.getElementById('editCpuCores').value = req.cpuCores;
  // document.getElementById('editCpuRam').value = req.cpuRam;
  // document.getElementById('editGpuCount').value = req.gpuCount;
  document.getElementById('editGpuRam').value = req.gpuRam;
  document.getElementById('editUsername').value=req.username;
  document.getElementById('editRequestModal').style.display = 'block';
}

// Submit edit request to backend
async function submitEditRequest() {
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
    // Use admin endpoint for editing
    const response = await fetch(`/dashboard/admin/edit_request/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("Status:", response.status);
    let result;
    try {
      result = await response.json();
    } catch (jsonErr) {
      console.error("Failed to parse JSON response:", jsonErr);
      throw new Error('Invalid server response');
    }
    console.log("Response:", result);
    if (!response.ok || !result.success) {
      const errorMsg = result && result.error ? result.error : 'Failed to edit request';
      throw new Error(errorMsg);
    }
    // Update local data
    const idx = resourceRequests.findIndex(r => r._id === requestId);
    if (idx !== -1) {
      // Merge studentInfo/teacherInfo from old request if missing in updated one
      if (!result.resourceRequest.studentInfo && resourceRequests[idx].studentInfo) {
        result.resourceRequest.studentInfo = resourceRequests[idx].studentInfo;
      }
      if (!result.resourceRequest.teacherInfo && resourceRequests[idx].teacherInfo) {
        result.resourceRequest.teacherInfo = resourceRequests[idx].teacherInfo;
      }
      resourceRequests[idx] = result.resourceRequest;
    }
    filterRequests(document.getElementById('searchInput').value);
    document.getElementById('editRequestModal').style.display = 'none';
    showNotification('Resource request updated successfully!', 'success');
  } catch (err) {
    console.error('Edit request error:', err);
    showNotification(err.message || 'Failed to update resource request.', 'error');
  }
}

// Close edit modal function
function closeEditModal() {
  document.getElementById('editRequestModal').style.display = 'none';
}

// Make functions globally available for HTML onclick handlers
window.closeVerificationModal = closeVerificationModal;
window.closeEditModal = closeEditModal;