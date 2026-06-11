import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import Swal from 'sweetalert2';
// Get request status (ADMIN version - includes teacher + admin states)
export function getRequestStatus(request) {
  // 0. Check if expired (isActive: false)

  // 2. Any rejection (highest priority after final)
  if (request.teacher_action && !request.teacher_verified) {
    return { text: 'Declined by Teacher', class: 'status-rejected' };
  }

  if (request.admin_action && !request.admin_verified) {
    return { text: 'Declined by Admin', class: 'status-rejected' };
  }
  // 1. FINAL → Fully verified
  if (request.is_verified && request.isActive == true) {
    return { text: 'Verified', class: 'status-approved' };
  }

  if (request.isActive === false) {
    return { text: 'Expired', class: 'expired' };
  }
  // 3. Any approval
  // if (request.teacher_action && request.teacher_verified) {
  //   return { text: "Approved by Teacher", class: "verified" };
  // }

  // if (request.admin_action && request.admin_verified) {
  //   return { text: "Approved by Admin", class: "verified" };
  // }

  // 4. Default → Pending
  return { text: 'Pending Admin', class: 'status-pending' };
}

// Filter requests (pure function)
export function filterRequestsList(requests, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return [...requests];
  }

  const term = searchTerm.toLowerCase();

  return requests.filter(
    (request) =>
      request.studentName?.toLowerCase().includes(term) ||
      request.rollNo?.toLowerCase().includes(term) ||
      request.teacherName?.toLowerCase().includes(term) ||
      request.title?.toLowerCase().includes(term) ||
      request.purpose?.toLowerCase().includes(term),
  );
}

// Merge updated request safely (preserve missing nested data)
export function mergeUpdatedRequest(oldRequest, updatedRequest) {
  const merged = { ...updatedRequest };

  if (!merged.studentInfo && oldRequest.studentInfo) {
    merged.studentInfo = oldRequest.studentInfo;
  }

  if (!merged.teacherInfo && oldRequest.teacherInfo) {
    merged.teacherInfo = oldRequest.teacherInfo;
  }

  return merged;
}

// Generate a secure random password
export function generatePassword(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$&';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

export async function confirmAction(action) {
  const result = await Swal.fire({
    title: `Confirm ${action}?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    focusCancel: true,
    reverseButtons: true,
  });
  return result.isConfirmed;
}

export async function getRejectionRemarks() {
  const { isConfirmed, value } = await Swal.fire({
    title: 'Reject Request',
    input: 'textarea',
    inputLabel: 'Enter remarks (optional)',
    inputPlaceholder: 'Write reason for rejection...',
    showCancelButton: true,
    confirmButtonText: 'Reject',
  });

  return isConfirmed ? value || '' : null;
}

export function showToast(message, type = 'success') {
  const bgColor = type === 'success' ? '#4CAF50' : '#F44336';
  Toastify({
    text: message,
    duration: type === 'success' ? 2000 : 2500,
    gravity: 'top',
    position: 'right',
    backgroundColor: bgColor,
    close: true,
  }).showToast();
}

// Helper to read the duration input
export function getEditDurationInput() {
  const val = parseInt(document.getElementById('editExtendDuration').value, 10);
  return val > 0 ? val : null;
}

// Helper to close modal
export function closeEditModal() {
  const modal = document.getElementById('editModal');
  modal.classList.add('hidden');
}

export function initMachineInfoTippy(tr, request) {
  if (!request.migId) return;
  const btn = tr.querySelector('.machine-info-btn');
  if (!btn) return;

  const machine = JSON.parse(btn.getAttribute('data-request'));
  tippy(btn, {
    content: `
      <p><b>MIG ID:</b> ${machine.migId ?? '-'}</p>
      <p><b>User:</b> ${machine.user ?? '-'}</p>
      <p><b>GPU:</b> ${machine.gpuRam ?? '-'} GB</p>
      <p><b>RAM:</b> ${machine.ram ?? '-'} GB</p>
      <p><b>IP:</b> ${machine.ip ?? '-'}</p>
      <p><b>Port:</b> ${machine.port ?? '-'}</p>
      <p><b>Name:</b> ${machine.name ?? '-'}</p>
    `,
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

export function initDurationTippy(tr, request, formatDate) {
  if (!request.startTime) return;
  const btn = tr.querySelector('.duration-info-btn');
  if (!btn) return;

  tippy(btn, {
    content: `
      <p><b>Start:</b> ${formatDate(request.startTime)}</p>
      <p><b>End:</b> ${formatDate(request.endTime)}</p>
    `,
    allowHTML: true,
    placement: 'right',
    arrow: true,
    animation: 'shift-away',
    duration: [150, 50],
    delay: [0, 0],
    maxWidth: 220,
    interactive: true,
    hideOnClick: true,
  });
}

export function initTitleTippy(tr, request) {
  if (!request.purpose) return;
  const btn = tr.querySelector('.title-info-btn');
  if (!btn) return;

  tippy(btn, {
    content: `<p><b>Purpose:</b> ${request.purpose}</p>`,
    allowHTML: true,
    placement: 'right',
    arrow: true,
    animation: 'shift-away',
    duration: [150, 50],
    delay: [0, 0],
    maxWidth: 260,
    interactive: true,
    hideOnClick: true,
  });
}
