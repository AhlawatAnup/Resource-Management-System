// Get request status (ADMIN version - includes teacher + admin states)
export function getRequestStatus(request) {
  // 0. Check if expired (isActive: false)
  if (request.isActive === false) {
    return { text: "Expired", class: "expired" };
  }

  // 1. FINAL → Fully verified
  if (request.is_verified) {
    return { text: "Verified", class: "verified" };
  }

  // 2. Any rejection (highest priority after final)
  if (request.teacher_action && !request.teacher_verified) {
    return { text: "Declined by Teacher", class: "declined" };
  }

  if (request.admin_action && !request.admin_verified) {
    return { text: "Declined by Admin", class: "declined" };
  }

  // 3. Any approval
  // if (request.teacher_action && request.teacher_verified) {
  //   return { text: "Approved by Teacher", class: "verified" };
  // }

  // if (request.admin_action && request.admin_verified) {
  //   return { text: "Approved by Admin", class: "verified" };
  // }

  // 4. Default → Pending
  return { text: "Pending Teacher", class: "pending-teacher" };
}


// Filter requests (pure function)
export function filterRequestsList(requests, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return [...requests];
  }

  const term = searchTerm.toLowerCase();

  return requests.filter((request) =>
    request.studentName?.toLowerCase().includes(term) ||
    request.rollNo?.toLowerCase().includes(term) ||
    request.teacherName?.toLowerCase().includes(term) ||
    request.title?.toLowerCase().includes(term) ||
    request.purpose?.toLowerCase().includes(term)
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
    reverseButtons: true
  });
  return result.isConfirmed;
}

export function showToast(message, type = 'success') {
  const bgColor = type === 'success' ? '#4CAF50' : '#F44336';
  Toastify({
    text: message,
    duration: type === 'success' ? 2000 : 2500,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor,
    close: true
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