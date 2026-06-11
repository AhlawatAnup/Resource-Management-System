// Returns true if the request's allotment has expired
export function isRequestExpired(request) {
  if (
    request.is_verified &&
    request.allotmentEndTime &&
    new Date(request.allotmentEndTime).getTime() < Date.now()
  ) {
    return true;
  }
  return false;
}
// Student-specific utility functions

export async function getLoggedInStudentId() {
  try {
    const response = await fetch('/dashboard/current-user-id', {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.id) {
        // Store for future use
        // localStorage.setItem('studentId', data.id);
        return data.id;
      }
    }
  } catch (error) {
    console.error('Error fetching user ID from session:', error);
  }

  return null;
}

export function showLoadingState(containerId = 'student-profile') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading...</p>
            </div>
        `;
  }
}

export function showErrorMessage(message, containerId = 'student-profile') {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="retry-btn" onclick="this.disabled=true; location.reload()">Retry</button>
            </div>
        `;
  }
}

// utils.js

// Function to determine student verification status based on schema
export function getStudentVerificationStatus(student) {
  if (student.teacher_verified && student.admin_verified) {
    return '✓ Verified';
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return '⏳ Pending on Admin';
    } else {
      return '❌ Rejected by Teacher';
    }
  }

  if (!student.teacher_action) {
    return '⏳ Pending on Teacher';
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return '✓ Verified';
    } else {
      return '❌ Rejected by Admin';
    }
  }

  return '⏳ Pending Verification';
}

// Function to get CSS class for student verification status
export function getStudentStatusClass(student) {
  if (student.teacher_verified && student.admin_verified) {
    return 'status-verified';
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return 'status-pending-admin';
    } else {
      return 'status-rejected';
    }
  }

  if (!student.teacher_action) {
    return 'status-pending-teacher';
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return 'status-verified';
    } else {
      return 'status-rejected';
    }
  }

  return 'status-pending';
}

export function getRequestStatus(request) {
  if (request.isActive === false || isRequestExpired(request)) {
    return 'completed';
  }
  if (request.is_verified) {
    return 'approved';
  }

  if (
    (request.teacher_action && !request.teacher_verified) ||
    (request.admin_action && !request.admin_verified)
  ) {
    return 'rejected';
  }

  return 'pending';
}

export function getRequestStatusClass(request) {
  if (isRequestExpired(request)) {
    return 'status-completed';
  }
  if (request.is_verified) {
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

export function getRequestStatusIcon(request) {
  if (isRequestExpired(request)) {
    return '⏰';
  }
  if (request.is_verified) {
    return '✓';
  }

  if (
    (request.teacher_action && !request.teacher_verified) ||
    (request.admin_action && !request.admin_verified)
  ) {
    return '✗';
  }

  if (request.teacher_action && request.teacher_verified && !request.admin_action) {
    return '⏳';
  }

  return '⏳';
}

export function getRequestStatusText(request) {
  if (isRequestExpired(request)) {
    return 'Completed';
  }
  if (request.is_verified) {
    return 'Approved';
  }

  if (request.teacher_action && !request.teacher_verified) {
    return 'Rejected by Teacher';
  }

  if (request.admin_action && !request.admin_verified) {
    return 'Rejected by Admin';
  }

  if (request.teacher_action && request.teacher_verified && !request.admin_action) {
    return 'Pending for Admin Approval';
  }

  if (!request.teacher_action) {
    return 'Pending Teacher';
  }

  return 'Pending Review';
}

// ==============================
// Pure Helpers
// ==============================

export function sortRequestsByDate(requests) {
  return [...requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function canDeleteRequest(request) {
  return (
    !request.teacher_action &&
    !request.admin_action &&
    !request.is_verified &&
    request.isActive !== false
  );
}

export function isValidDuration(duration) {
  return Number.isInteger(duration) && duration >= 1 && duration <= 15;
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString();
}

export const DataUtils = {
  formatAllotments(allotments = []) {
    return allotments.map((entry) => ({
      from: new Date(entry.startTime?.$date || entry.startTime),
      to: new Date(entry.endTime?.$date || entry.endTime),
    }));
  },
};

//Machine Allotment Calculations
export const AllotmentsUtils = {
  formatAllotments(allotments = []) {
    return allotments.map((entry) => ({
      from: new Date(entry.startTime?.$date || entry.startTime),
      to: new Date(entry.endTime?.$date || entry.endTime),
      bookedBy: entry.resourceRequestId?.studentId?.name || 'Unknown',
    }));
  },
  getAvailableFrom(allotments = []) {
    if (!allotments.length) {
      return 'Today';
    }

    const latestEnd = allotments.reduce((latest, entry) => {
      const end = new Date(entry.to);

      return end > latest ? end : latest;
    }, new Date(0));

    latestEnd.setDate(latestEnd.getDate());

    const today = new Date();

    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffTime = latestEnd.getTime() - startOfToday.getTime();

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Today';
    }

    if (diffDays === 1) {
      return 'Tomorrow';
    }

    if (diffDays <= 3) {
      return 'Within 3 Days';
    }

    if (diffDays <= 7) {
      return 'Within 7 Days';
    }

    return latestEnd.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  },
};
