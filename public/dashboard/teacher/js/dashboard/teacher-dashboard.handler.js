import {
  fetchTeacherDashboardData,
  fetchStudentData,
  updateStudentVerificationAPI
} from './teacher-dashboard.service.js';

import {
  renderTeacherProfile,
  renderStudentsTable,
  showNotification
} from './teacher-dashboard.ui.js';

import {
  getInitials,
  getRandomNamedColor,
  renderDashboardHeader
} from '../../../common/js/commons.js';

import {
  getStudentVerificationStatusForTeacher,
  getStudentStatusClassForTeacher
} from '../teacher.utils.js';

import { logoutDirectly } from '../../../common/js/commons.js';

// Local state (kept here instead of main)
const student_data = [];
let teacherVerificationStatus = { is_verified: false };


// =========================
// DASHBOARD LOAD
// =========================
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
      verification_completed: data.verification_completed
    };

    renderDashboardHeader(data);
    renderTeacherProfile(data);

    // Not verified
    if (!teacherVerificationStatus.is_verified) {
      document.getElementById("contactTableBody").innerHTML =
        '<tr><td colspan="6" class="loading">Your account must be verified by admin to view students</td></tr>';
      return;
    }

    // No students
    if (!data.students.length) {
      document.getElementById("contactTableBody").innerHTML =
        '<tr><td colspan="6" class="loading">No student registered with you</td></tr>';
      return;
    }

    // Load students
    for (let i = 0; i < data.students.length; i++) {
      await handleStudentFetch(data.students[i]);
    }

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    logoutDirectly();
  }
}


// =========================
// FETCH STUDENT
// =========================
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

    renderStudentsTable(student);
    student_data.push(student);

  } catch (error) {
    console.error("Error fetching student data:", error);
  }
}


// =========================
// FILTER
// =========================
let filtered_student = [];

export function filterStudent(searchTerm) {
  if (!student_data.length) {
    document.getElementById("contactTableBody").innerHTML =
      '<tr><td colspan="6" class="loading">No student registered with you</td></tr>';
    return;
  }

  const tbody = document.getElementById("contactTableBody");
  tbody.innerHTML = "";

  if (!searchTerm.trim()) {
    filtered_student = [...student_data];
  } else {
    const term = searchTerm.toLowerCase();
    filtered_student = student_data.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.rollNo.toLowerCase().includes(term)
    );
  }

  filtered_student.forEach((student) => {
    renderStudentsTable(student);
  });
}


// =========================
// VERIFY STUDENT
// =========================
export async function handleStudentVerification(studentId, isVerified) {
  if (!teacherVerificationStatus.is_verified) {
    showNotification('You must be verified by admin before approving students', 'error');
    return;
  }

  try {
    const action = isVerified ? 'approve' : 'decline';

    const result_confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this student?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Approve`,
      cancelButtonText: 'Cancel',
      draggable: true,
      scrollbarPadding: false,
      heightAuto: false
    });

    if (!result_confirmation.isConfirmed) return;

    const response = await updateStudentVerificationAPI(studentId, isVerified);

    if (!response.ok) {
      throw new Error('Failed to update student verification');
    }

    await response.json();

    // Update local state
    const studentIndex = student_data.findIndex(s => s._id === studentId);

    if (studentIndex !== -1) {
      student_data[studentIndex].teacher_verified = isVerified;
      student_data[studentIndex].teacher_action = true;
    }

    // Update UI row (same logic)
    const studentRow = document
      .querySelector(`[data-student-id="${studentId}"]`)
      ?.closest('tr');

    if (studentRow && studentIndex !== -1) {
      const tbody = document.getElementById("contactTableBody");
      const newTr = document.createElement("tr");
      newTr.innerHTML = studentRow.innerHTML;

      const updatedStudent = student_data[studentIndex];

      const verificationStatus =
        getStudentVerificationStatusForTeacher(updatedStudent);

      const statusClass =
        getStudentStatusClassForTeacher(updatedStudent);

      const statusBadge = newTr.querySelector('.badge');
      if (statusBadge) {
        statusBadge.textContent = verificationStatus;
        statusBadge.className = `badge ${statusClass}`;
      }

      const buttonContainer = newTr.querySelector('.owner-info');
      if (buttonContainer) {
        buttonContainer.innerHTML =
          '<span style="color: #666; font-style: italic;">Action Completed</span>';
      }

      tbody.replaceChild(newTr, studentRow);
    }

    showNotification(
      `Student ${isVerified ? 'approved' : 'declined'} successfully!`,
      'success'
    );

  } catch (error) {
    console.error('Error updating student verification:', error);
    showNotification(
      'Failed to update student verification. Please try again.',
      'error'
    );
  }
}