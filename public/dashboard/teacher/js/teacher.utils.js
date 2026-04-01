// Get verification status text for teacher
export function getVerificationStatus(teacher) {
  if (teacher.is_verified) {
    return '✓ Verified';
  } else if (teacher.verification_completed && !teacher.is_verified) {
    return '✗ Rejected';
  } else {
    return '⏳ Pending Verification';
  }
}

// Get CSS class for teacher status
export function getStatusClass(teacher) {
  if (teacher.is_verified) {
    return 'verified';
  } else if (teacher.verification_completed && !teacher.is_verified) {
    return 'rejected';
  } else {
    return 'pending';
  }
}

// (kept as-is, even if deprecated — no logic change rule)
export function getStatusColor(isVerified) {
  return isVerified ? '#28a745' : '#ffc107';
}

// Student verification status (teacher perspective)
export function getStudentVerificationStatusForTeacher(student) {
  if (student.teacher_verified && student.admin_verified) {
    return "Verified";
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return "Pending on Admin";
    } else {
      return "Declined by Teacher";
    }
  }

  if (!student.teacher_action) {
    return "Pending on Teacher";
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return "Verified";
    } else {
      return "Declined by Admin";
    }
  }

  return "Pending";
}

// Student status CSS class
export function getStudentStatusClassForTeacher(student) {
  if (student.teacher_verified && student.admin_verified) {
    return "verified";
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return "pending-admin";
    } else {
      return "declined";
    }
  }

  if (!student.teacher_action) {
    return "pending-teacher";
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return "verified";
    } else {
      return "declined";
    }
  }

  return "pending";
}

// Get request status information
export function getRequestStatus(request) {
  if (request.is_verified) {
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

// Get action buttons HTML
export function getActionButtons(request) {
  // Hide action buttons if admin has already taken action
  if (request.admin_action) {
    return '<span style="color: #666; font-style: italic;">Action Completed</span>';
  }

  // Hide action buttons if teacher has already taken action
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

// Filter requests (pure function version)
export function filterRequestsList(resourceRequests, searchTerm) {
  if (!resourceRequests.length) return [];

  if (!searchTerm.trim()) {
    return [...resourceRequests];
  }

  const term = searchTerm.toLowerCase();

  return resourceRequests.filter(
    (request) =>
      request.studentInfo.name.toLowerCase().includes(term) ||
      request.studentInfo.rollNo.toLowerCase().includes(term) ||
      request.title.toLowerCase().includes(term) ||
      request.purpose.toLowerCase().includes(term)
  );
}