const MachineAllotments = require('../../../server/main/database/machineAllotmentModel');
const { student } = require('./student.init');
// Student-specific utility functions

// export async function getLoggedInStudentId() {
//   try {
//     const response = await fetch('/dashboard/current-user-id', {
//       method: 'GET',
//       credentials: 'include',
//     });

//     if (response.ok) {
//       const data = await response.json();
//       if (data.id) {
//         return data.id;
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching user ID from session:', error);
//   }

//   return null;
// }

export function showLoadingState(containerId = 'student-profile') {
  return;
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
    return (student.verificationStatus = 'Verified') && (student.verificationCode = 1);
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return (student.verificationStatus = 'Pending on Admin') && (student.verificationCode = 0);
    } else {
      return (student.verificationStatus = 'Rejected by Teacher') && (student.verificationCode = 0);
    }
  }

  if (!student.teacher_action) {
    return (student.verificationStatus = 'Pending on Teacher') && (student.verificationCode = 0);
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return (student.verificationStatus = 'Verified') && (student.verificationCode = 1);
    } else {
      return (student.verificationStatus = 'Rejected by Admin.') && (student.verificationCode = 0);
    }
  }

  return (student.verificationStatus = 'Pending Verification') && (student.verificationCode = 0);
}

// Function to get CSS class for student verification status
export function getStudentStatusClass(student) {
  if (student.teacher_verified && student.admin_verified) {
    return (student.status = 'status-verified');
  }

  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return (student.status = 'status-pending-admin');
    } else {
      return (student.status = 'status-rejected');
    }
  }

  if (!student.teacher_action) {
    return (student.status = 'status-pending-teacher');
  }

  if (student.admin_action) {
    if (student.admin_verified) {
      return (student.status = 'status-verified');
    } else {
      return (student.status = 'status-rejected');
    }
  }

  return (student.status = 'status-pending');
}

export function getRequestStatus(request) {
  if (request.is_verified && !request.isActive) {
    // console.log('request-expired');
    return 'completed';
  }

  if (request.admin_action && !request.admin_verified) {
    return 'rejected';
  }

  if (request.isActive && !request.is_verified) {
    return 'pending';
  }

  if (request.is_verified && request.admin_verified && request.isActive) {
    return 'approved';
  }
}

export function getRequestStatusClass(request) {
  if (request.is_verified && !request.isActive) {
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
    return 'status-in-progress status-pending';
  }
  if (request.isActive && !request.is_verified) {
    return 'pending';
  }
}

export function getRequestStatusText(request) {
  if (request.is_verified && !request.isActive) {
    return {
      key: 'COMPLETED',
      text: 'Completed',
    };
  }

  if (request.is_verified) {
    return {
      key: 'APPROVED',
      text: 'Approved',
    };
  }

  if (request.teacher_action && !request.teacher_verified) {
    return {
      key: 'REJECTED_BY_TEACHER',
      text: 'Rejected by Teacher',
    };
  }

  if (request.admin_action && !request.admin_verified) {
    return {
      key: 'REJECTED_BY_ADMIN',
      text: 'Rejected by Admin. Please check your mail for detailed remarks.',
    };
  }

  if (request.teacher_action && request.teacher_verified && !request.admin_action) {
    return {
      key: 'PENDING_ADMIN_APPROVAL',
      text: 'Pending for Admin Approval',
    };
  }

  if (!request.teacher_action) {
    return {
      key: 'PENDING_TEACHER',
      text: 'Pending Teacher',
    };
  }

  if (request.isActive && !request.is_verified) {
    return {
      key: 'PENDING_REVIEW',
      text: 'Pending Review',
    };
  }
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
