import { registerServiceWorkerAndSubscribe } from '../../../../common/notifications/notification.js';
import {
  getInitials,
  getRandomNamedColor,
  renderDashboardHeader,
  logoutDirectly,
} from '../../../../common/utils/commons.utils.js';
import {
  renderTeacherProfile,
  renderStudentsTable,
  renderPendingRequestsTable,
  showNotification,
} from './dashboard.ui.js';
import {
  getStudentVerificationStatusForTeacher,
  getStudentStatusClassForTeacher,
} from '../teacher.utils.js';
import Swal from 'sweetalert2';
import { setupDarkMode } from '../../../../common/darkmode/darkmode.js';

// API CALLS -------------------->
export async function fetchTeacherDashboardData() {
  const response = await fetch('/dashboard/teacher/data', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

// Fetch individual student data
export async function fetchStudentData(stu_id) {
  const response = await fetch('/dashboard/teacher/student_data/' + stu_id, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response;
}

// Update student verification
export async function updateStudentVerificationAPI(studentId, isVerified) {
  const response = await fetch(`/dashboard/teacher/verify_student/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_verified: isVerified }),
  });

  return response;
}

//HANDLER ----------------->
const student_data = [];
let teacherVerificationStatus = { is_verified: false };

// DASHBOARD LOAD
export async function handleDashboardLoad() {
  try {
    const response = await fetchTeacherDashboardData();

    if (!response.ok) {
      if (response.status === 404) {
        logoutDirectly();
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    teacherVerificationStatus = {
      is_verified: data.is_verified,
      verification_completed: data.verification_completed,
    };

    renderDashboardHeader(data);
    renderTeacherProfile(data);

    // Not verified
    if (!teacherVerificationStatus.is_verified) {
      const tableBody =
        document.getElementById('contactTableBody') ||
        document.getElementById('pendingRequestsTableBody');

      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="loading">Your account must be verified by admin to view students</td></tr>';
      }
      return;
    }

    // No students
    if (!data.students.length) {
      const tableBody =
        document.getElementById('contactTableBody') ||
        document.getElementById('pendingRequestsTableBody');

      if (tableBody) {
        tableBody.innerHTML =
          '<tr><td colspan="6" class="loading">No student registered with you</td></tr>';
      }
      return;
    }

    // Load students
    for (let i = 0; i < data.students.length; i++) {
      await handleStudentFetch(data.students[i]);
    }
    // Pending Requests page
    const pendingTable = document.getElementById('pendingRequestsTableBody');

    if (pendingTable && pendingTable.children.length === 0) {
      pendingTable.innerHTML = `
    <tr>
      <td colspan="6" class="loading">
        No pending requests
      </td>
    </tr>
  `;
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    logoutDirectly();
  }
}

// FETCH STUDENT
export async function handleStudentFetch(stu_id) {
  try {
    const response = await fetchStudentData(stu_id);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const student = {
      ...data,
      avatarColor: getRandomNamedColor(),
      avatar: getInitials(data.name),
    };

    student_data.push(student);

    // Assigned Students page
    if (document.getElementById('contactTableBody')) {
      renderStudentsTable(student);
    }

    // Pending Requests page
    if (document.getElementById('pendingRequestsTableBody') && !student.teacher_action) {
      renderPendingRequestsTable(student);
    }
  } catch (error) {
    console.error('Error fetching student data:', error);
  }
}

// FILTER
let filtered_student = [];

export function filterStudent(searchTerm) {
  const tbody = document.getElementById('contactTableBody');

  if (!tbody) return;
  if (!student_data.length) {
    document.getElementById('contactTableBody').innerHTML =
      '<tr><td colspan="6" class="loading">No student registered with you</td></tr>';
    return;
  }

  tbody.innerHTML = '';

  if (!searchTerm.trim()) {
    filtered_student = [...student_data];
  } else {
    const term = searchTerm.toLowerCase();
    filtered_student = student_data.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.rollNo.toLowerCase().includes(term),
    );
  }

  filtered_student.forEach((student) => {
    renderStudentsTable(student);
  });
}

// VERIFY STUDENT
export async function handleStudentVerification(studentId, isVerified) {
  if (!teacherVerificationStatus.is_verified) {
    showNotification('You must be verified by admin before approving students', 'error');
    return;
  }

  try {
    const action = isVerified ? 'approve' : 'decline';

    const result_confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: isVerified
        ? 'Do you want to approve this student?'
        : 'Rejecting this student will permanently delete their account and all associated data. However, they will still be eligible to register again.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isVerified ? '#3085d6' : '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: isVerified ? 'Approve' : 'Reject',
      cancelButtonText: 'Cancel',
      draggable: true,
      scrollbarPadding: false,
      heightAuto: false,
    });

    if (!result_confirmation.isConfirmed) return;

    const response = await updateStudentVerificationAPI(studentId, isVerified);

    if (!response.ok) {
      throw new Error('Failed to update student verification');
    }

    await response.json();

    // Update local state
    const studentIndex = student_data.findIndex((s) => s._id === studentId);

    if (studentIndex !== -1) {
      student_data[studentIndex].teacher_verified = isVerified;
      student_data[studentIndex].teacher_action = true;
    }

    // Update UI row (same logic)
    const studentRow = document.querySelector(`[data-student-id="${studentId}"]`)?.closest('tr');

    if (studentRow && studentIndex !== -1) {
      const tbody = studentRow?.parentElement;
      const newTr = document.createElement('tr');
      newTr.innerHTML = studentRow.innerHTML;

      const updatedStudent = student_data[studentIndex];

      const verificationStatus = getStudentVerificationStatusForTeacher(updatedStudent);

      const statusClass = getStudentStatusClassForTeacher(updatedStudent);

      const statusBadge = newTr.querySelector('.badge');
      if (statusBadge) {
        statusBadge.textContent = verificationStatus;
        statusBadge.className = `badge ${statusClass}`;
      }

      if (document.getElementById('pendingRequestsTableBody')) {
        studentRow.remove();
      } else {
        const buttonContainer = newTr.querySelector('.owner-info');

        if (buttonContainer) {
          buttonContainer.innerHTML =
            '<span style="color: #666; font-style: italic;">Action Completed</span>';
        }

        tbody.replaceChild(newTr, studentRow);
      }
    }

    showNotification(`Student ${isVerified ? 'approved' : 'declined'} successfully!`, 'success');
  } catch (error) {
    console.error('Error updating student verification:', error);
    showNotification('Failed to update student verification. Please try again.', 'error');
  }
}
//INIT

// Init
document.addEventListener('DOMContentLoaded', function () {
  setupDarkMode();
  handleDashboardLoad();
  registerServiceWorkerAndSubscribe();
});

// Search
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    filterStudent(e.target.value);
  });
  // AUTO FOCUS SEARCH ON TYPING
  document.addEventListener('keydown', (e) => {
    const searchInput = document.getElementById('searchInput');

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (
      document.activeElement.tagName === 'INPUT' ||
      document.activeElement.tagName === 'TEXTAREA'
    ) {
      return;
    }

    if (e.key.length === 1) {
      searchInput.focus();
    }
  });
}

// Approve / Decline (event delegation)
const contactTable = document.getElementById('contactTableBody');

if (contactTable) {
  contactTable.addEventListener('click', (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn');

    if (button) {
      const studentId = button.getAttribute('data-student-id');
      const action = button.getAttribute('data-action');
      const isVerified = action === 'approve';

      handleStudentVerification(studentId, isVerified);
    }
  });
}

const pendingTable = document.getElementById('pendingRequestsTableBody');

if (pendingTable) {
  pendingTable.addEventListener('click', (e) => {
    const button = e.target.closest('.approve-btn, .decline-btn');

    if (button) {
      const studentId = button.getAttribute('data-student-id');
      const action = button.getAttribute('data-action');
      const isVerified = action === 'approve';

      handleStudentVerification(studentId, isVerified);
    }
  });
}
