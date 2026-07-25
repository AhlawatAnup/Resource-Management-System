import {
  getInitials,
  getRandomNamedColor,
  formatDate,
  createViewMoreButton,
} from '../../../../common/utils/commons.utils.js';
import { getRequestStatus, getActionButtons, initTitleTippy } from '../teacher.utils.js';
import Swal from 'sweetalert2';

// Render resource requests in table
export function renderResourceRequests(requests) {
  const tbody = document.getElementById('requestsTableBody');

  if (!requests || requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No resource requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  requests.forEach((request) => {
    const tr = document.createElement('tr');

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
          <p>
            ${
              request.purpose
                ? `
                <button class="title-info-btn info-btn" title="Request Purpose">
                  <i class="fa fa-info-circle"></i>
                </button>
              `
                : ''
            }
          ${request.title}
          </p>
          <div class="request-date"> ${formatDate(request.createdAt)}</div>
        </div>
      </td>
     
      <td>
        
      
        <span>${request.machineId && request?.machineId?.MIGID ? request?.machineId?.MIGID : '-'}</span>
      </td>
      <td>
       
        <span>${request.duration ? request.duration : '-'}</span>
      </td>
      <td>
        <span class="badge ${statusInfo.class}">${statusInfo.text}</span>
      </td>
      
    `;

    tbody.appendChild(tr);

    initTitleTippy(tr, request);
  });
}

// Show "not verified" message
export function showNotVerifiedMessage() {
  const tbody = document.getElementById('requestsTableBody');
  tbody.innerHTML =
    '<tr><td colspan="7" class="loading">Your account must be verified by admin to view resource requests</td></tr>';
}

// Show empty state
export function showEmptyState() {
  const tbody = document.getElementById('requestsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" class="loading">No resource requests found.</td></tr>';
}

// Toast notification
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

// Handle button loading state
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

// Set validation error
export function setFieldError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = message;
}
