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
            <h4 title="Teacher: ${request.teacherName}">${request.studentName}</h4>
            <div class="contact-time">${request.rollNo}</div>
            <div class="contact-time">${request.branch}</div>
          </div>
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
        ${request.migId ? `
          <button class="info-btn" title="Machine Info" data-request='${JSON.stringify(request)}'>
            <i class="fa fa-info-circle"></i>
          </button>
        ` : ''}
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
    
    // info-btn logic starts
    if (request.migId) {
      const infoBtn = tr.querySelector('.info-btn');
      if (infoBtn) {
        initializeMachineInfoTippy(infoBtn);
      }
    }
    
    function initializeMachineInfoTippy(infoBtn) {
      const machine = JSON.parse(infoBtn.getAttribute('data-request'));
      const htmlContent = `
      <p><b>MIG ID:</b> ${machine.migId ?? '-'}</p>
      <p><b>User:</b> ${machine.user ?? '-'}</p>
      <p><b>GPU:</b> ${machine.gpuRam ?? '-'} GB</p>
      <p><b>RAM:</b> ${machine.ram ?? '-'} GB</p>
      <p><b>IP:</b> ${machine.ip ?? '-'}</p>
      <p><b>Port:</b> ${machine.port ?? '-'}</p>
      <p><b>Name:</b> ${machine.name ?? '-'}</p>
      `;
      
      tippy(infoBtn, {
        content: htmlContent,
        allowHTML: true,
        placement: 'right',
        arrow: true,
        animation: 'shift-away',
        duration: [150, 50],
        delay: [0, 0],
        maxWidth: 250,
        interactive: true,
        hideOnClick: true,
      });
    }
    // info-btn logic ends
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
