// handlers.js

import {
  fetchDashboardData,
  verifyTeacherService,
  verifyStudentService,
  unverifyTeacherService,
  unverifyStudentService
} from './admin-dashboard.service.js';

import {
  getEndpoint,
  extractDataByTypeAndStatus,
  filterData
} from './admin-dashboard.utils.js';

import {
  renderPageHeader,
  renderTableHeaders,
  renderTable
} from './admin-dashboard.ui.js';

// -----------------------------
// Load & Render Flow
// -----------------------------
export async function loadAndRender({
  state,
  logout
}) {
  renderPageHeader(state.currentType, state.currentStatus);
  renderTableHeaders(state.currentType, state.currentStatus);

  const endpoint = getEndpoint(state.currentType, state.currentStatus);

  const data = await fetchDashboardData(endpoint, { logout });
  if (!data) return;

  state.currentData = extractDataByTypeAndStatus(
    data,
    state.currentType,
    state.currentStatus
  );

  renderTable({
    data: state.currentData,
    currentType: state.currentType,
    currentStatus: state.currentStatus
  });
}

// -----------------------------
// Navigation Handlers
// -----------------------------
export function setupNavigation({ state, reload }) {
  const typeButtons = document.querySelectorAll('.nav-btn[data-type]');
  const statusButtons = document.querySelectorAll('.status-btn[data-status]');

  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.currentType = btn.getAttribute('data-type');
      reload();
    });
  });

  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      statusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.currentStatus = btn.getAttribute('data-status');
      reload();
    });
  });
}

// -----------------------------
// Action Delegation (Table)
// -----------------------------
export function setupActionHandlers({ reload }) {
  document.getElementById('dataTableBody').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'approve-teacher') {
      await handleVerifyTeacher(id, true, reload);
    }

    if (action === 'reject-teacher') {
      await handleVerifyTeacher(id, false, reload);
    }

    if (action === 'unverify-teacher') {
      await handleUnverifyTeacher(id, reload);
    }

    if (action === 'approve-student') {
      await handleVerifyStudent(id, true, reload);
    }

    if (action === 'reject-student') {
      await handleVerifyStudent(id, false, reload);
    }

    if (action === 'unverify-student') {
      await handleUnverifyStudent(id, reload);
    }
  });
}

// -----------------------------
// Search Handler
// -----------------------------
export function setupSearch({ state }) {
  document.getElementById('searchInput').addEventListener('input', (e) => {
    const filtered = filterData(
      state.currentData,
      state.currentType,
      e.target.value
    );

    renderTable({
      data: filtered,
      currentType: state.currentType,
      currentStatus: state.currentStatus
    });
  });
}

// -----------------------------
// Teacher Actions
// -----------------------------
async function handleVerifyTeacher(id, isVerified, reload) {
  const action = isVerified ? 'approve' : 'reject';

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to ${action} this teacher profile?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: `Yes, ${action}`
  });

  if (!result.isConfirmed) return;

  try {
    const response = await verifyTeacherService(id, isVerified);

    if (response.ok) {
      await reload();

      Swal.fire({
        title: 'Success!',
        text: `Teacher ${action}d successfully!`,
        icon: 'success'
      });
    } else {
      Swal.fire('Error', 'Failed to update teacher', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Error updating teacher', 'error');
  }
}

// -----------------------------
// Student Actions
// -----------------------------
async function handleVerifyStudent(id, isVerified, reload) {
  const action = isVerified ? 'approve' : 'decline';

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: isVerified
      ? 'Do you want to approve this student profile?'
      : 'Rejecting this student will permanently delete their account and all associated data. However, they will still be eligible to register again.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isVerified ? '#3085d6' : '#d33',
    cancelButtonColor: '#6c757d',
    confirmButtonText: isVerified ? 'Yes, approve' : 'Reject & Delete',
    cancelButtonText: 'Cancel'
  });
  if (!result.isConfirmed) return;

  try {
    const response = await verifyStudentService(id, isVerified);

    if (response.ok) {
      await reload();

      Swal.fire('Success', `Student ${action}d successfully!`, 'success');
    } else {
      const err = await response.json();
      Swal.fire('Error', err.error || 'Failed', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Error updating student', 'error');
  }
}

// -----------------------------
// Unverify Student
// -----------------------------
async function handleUnverifyStudent(id, reload) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "Unverifying this student will permanently delete all their resource requests and machine allotments. Do you want to continue?",
    icon: 'warning',
    showCancelButton: true
  });

  if (!result.isConfirmed) return;

  try {
    const response = await unverifyStudentService(id);

    if (response.ok) {
      const data = await response.json();
      await reload();

      Swal.fire('Success', data.message || 'Unverified', 'success');
    } else {
      const err = await response.json();
      Swal.fire('Error', err.error || 'Failed', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Error occurred', 'error');
  }
}

// -----------------------------
// Unverify Teacher
// -----------------------------
async function handleUnverifyTeacher(id, reload) {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Unverify this teacher and all its students?',
    icon: 'warning',
    showCancelButton: true
  });

  if (!result.isConfirmed) return;

  try {
    const response = await unverifyTeacherService(id);

    if (response.ok) {
      const data = await response.json();
      await reload();

      Swal.fire('Success', data.message || 'Unverified', 'success');
    } else {
      const err = await response.json();

      if (err.studentsWithResources?.length) {
        const list = err.studentsWithResources
          .map(s => `• ${s.rollNo} - ${s.name}`)
          .join('\n');

        Swal.fire({
          title: 'Cannot Unverify',
          html: `<pre>${list}</pre>`,
          icon: 'error'
        });
      } else {
        Swal.fire('Error', err.error || 'Failed', 'error');
      }
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Error', 'Error occurred', 'error');
  }
}