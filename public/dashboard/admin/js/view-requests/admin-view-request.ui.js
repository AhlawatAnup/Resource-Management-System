// Render resource requests table
export function renderResourceRequests(requests, deps) {
  const {
    getRequestStatus,
    getActionButtons,
    getInitials,
    getRandomNamedColor,
    formatDate,
    createViewMoreButton
  } = deps;

  const tbody = document.getElementById("requestsTableBody");

  if (!requests || requests.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="8" class="loading">No resource requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = "";

  requests.forEach((request) => {
    const statusInfo = getRequestStatus(request);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <div class="contact-info">
          <div class="avatar ${getRandomNamedColor()}">${getInitials(request.studentName)}</div>
          <div class="contact-details">
            <h4>${request.studentName}</h4>
            <div class="contact-time">${request.rollNo}</div>
            <div class="contact-time">${request.branch}</div>
          </div>
        </div>
      </td>
      <td>
        <div class="teacher-info">
          <h4>${request.teacherName}</h4>
        </div>
      </td>
      <td>
        <div class="request-title">
          <p>${request.title}<p>
          <div class="request-date">${formatDate ? formatDate(request.createdAt) : ''}</div>
        </div>
      </td>
      <td>
        <div class="purpose-text">
          <span>${request.purpose.length > 20 ? request.purpose.substring(0, 20) + '...' : request.purpose}</span>
          ${createViewMoreButton(request._id, request.purpose)}
        </div>
      </td>
      <td>
        <span>${request.duration ?? '-'}</span>
      </td>
      <td>
        <span>${request.migId ?? '-'}</span>
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


// Empty + error states
export function showEmptyState() {
  document.getElementById("requestsTableBody").innerHTML =
    '<tr><td colspan="8" class="loading">No resource requests found.</td></tr>';
}

export function showErrorState() {
  document.getElementById("requestsTableBody").innerHTML =
    '<tr><td colspan="8" class="loading">Error loading requests. Please refresh the page.</td></tr>';
}


// Notification toast
export function showNotification(message, type) {
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


// ===== VERIFICATION MODAL =====

// Populate and show verification modal
export function showVerificationModalUI(request) {
  const modal = document.getElementById('verificationModal');
  const requestInfo = document.getElementById('modalRequestInfo');

  if (!modal || !request) return;

  requestInfo.innerHTML = `
    <div class="request-summary">
      <h5>${request.title}</h5>
      <div class="request-details">
        <p><strong>Student:</strong> ${request.studentInfo.name}</p>
        <p><strong>Roll No:</strong> ${request.studentInfo.rollNo}</p>
        <p><strong>Teacher:</strong> ${request.teacherInfo.name}</p>
        <p><strong>GPU:</strong> ${request.gpuRam}GB</p>
        <p><strong>Purpose:</strong> ${request.purpose.length > 80 ? request.purpose.substring(0, 80) + '...' : request.purpose}</p>
      </div>
    </div>
  `;

  modal.setAttribute('data-request-id', request._id);

  const usernameEl = document.getElementById('vmUsername');
  const passwordEl = document.getElementById('vmPassword');

  if (usernameEl) {
    usernameEl.value = request.username;
    usernameEl.readOnly = true;
  }

  if (passwordEl) passwordEl.value = '';

  modal.style.display = 'block';
}

// Close modal
export function closeVerificationModalUI() {
  const modal = document.getElementById('verificationModal');
  if (modal) modal.style.display = 'none';
}


// Populate MIG select
export function populateMachinesSelectUI(machines) {
  const select = document.getElementById('vmMigId');
  if (!select) return;

  const freeMachines = machines.filter(m => {
    const isAssigned = (typeof m.isAssigned === 'boolean') ? m.isAssigned : !!m.assignedStudent;
    return !isAssigned;
  });

  if (!freeMachines.length) {
    select.innerHTML = '<option value="" disabled selected>No available machines</option>';
    return;
  }

  select.innerHTML =
    '<option value="" disabled selected>Select a machine</option>' +
    freeMachines.map(m =>
      `<option value="${m.MIGID}">${m.MIGID} (${m.gpuRam}GB GPU)</option>`
    ).join('');
}


// ===== EDIT MODAL =====

// Configure edit form fields for approved requests (only expiry date editable)
function setEditFormApprovedState(isApproved) {
  const fieldsToDisable = ['editTitle', 'editPurpose', 'editGpuRam', 'editUsername'];
  const opacity = isApproved ? '0.6' : '';

  fieldsToDisable.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.disabled = isApproved;
      el.style.opacity = opacity;
    }
  });
}

export function showEditModalUI(request) {
  const submitBtn = document.querySelector('#editRequestForm button[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '';
    submitBtn.style.cursor = '';
  }

  document.getElementById('editRequestId').value = request._id;
  document.getElementById('editTitle').value = request.title;
  document.getElementById('editPurpose').value = request.purpose;
  setEditFormApprovedState(request.admin_action === true);

  document.getElementById('editRequestModal').style.display = 'block';
}

export function closeEditModalUI() {
  document.getElementById('editRequestModal').style.display = 'none';
}


// Read edit form data
export function getEditFormData() {
  return {
    requestId: document.getElementById('editRequestId').value,
    formValues: {
      title: document.getElementById('editTitle').value,
      purpose: document.getElementById('editPurpose').value,
    }
  };
}


// Button state
export function setSubmitButtonState(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.style.opacity = '0.6';
    button.style.cursor = 'not-allowed';
  } else {
    button.disabled = false;
    button.style.opacity = '';
    button.style.cursor = '';
  }
}


// Field error
export function setFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}


// Clipboard copy
export function copyToClipboard(value) {
  return navigator.clipboard.writeText(value);
}