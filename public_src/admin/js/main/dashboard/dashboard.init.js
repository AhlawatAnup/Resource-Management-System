
import { appendAllTeachers, appendAllStudents, updateStatusCounts } from './dashboard.ui.js';
import {
  getEndpoint,
  extractDataByTypeAndStatus,
  filterData,
  getTableHeaders,
} from './dashboard.utils.js';

import { admin } from '../../admin.js';

// THROW AN EVENT OF DASHBOARD_READY

//TOGGLE BUTTON FOR TEACHER AND STUDENT
const state = {
  currentType: 'teacher',
  currentStatus: 2,
  currentData: [],
};

let teacherBtn;
let studentBtn;
let statusBtns;

//Toggling student/teacher button
function updateActiveButton() {
  teacherBtn.classList.toggle('active', state.currentType === 'teacher');
  studentBtn.classList.toggle('active', state.currentType === 'student');
}

//Setup Teacher/Student Navigation
function setupNavigation() {
  teacherBtn.addEventListener('click', async () => {
    if (state.currentType === 'teacher') return;

    state.currentType = 'teacher';
    state.currentStatus = 2;
    updateActiveButton();
    updateActiveStatus();
    await loadDashboard();
  });

  studentBtn.addEventListener('click', async () => {
    if (state.currentType === 'student') return;

    state.currentType = 'student';
    state.currentStatus = 2;
    updateActiveButton();
    updateActiveStatus();
    await loadDashboard();
  });
}

//Toggling status
function updateActiveStatus() {
  statusBtns.forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.status) === state.currentStatus);
  });
}
//Setup status navigation
function setupStatusNavigation() {
  statusBtns.forEach((btn) => {
    btn.addEventListener('click', async () => {
      state.currentStatus = Number(btn.dataset.status);

      updateActiveStatus();

      if (state.currentType == 'teacher') {
        switch (state.currentStatus) {
          case 0:
            appendAllTeachers(admin.unverifiedTeachers);
            break;
          case 1:
            appendAllTeachers(admin.verifiedTeachers);
            break;
          case 2:
            appendAllTeachers(admin.allTeachers);
            break;
          case 3:
           appendAllTeachers([]);
            break;

          default:
            break;
        }
      } else {
  switch (state.currentStatus) {
    case 0:
      appendAllStudents(admin.unverifiedStudents);
      break;
    case 1:
      appendAllStudents(admin.verifiedStudents);
      break;
    case 2:
      appendAllStudents(admin.allStudents);
      break;
    case 3:
      appendAllStudents(admin.rejectedStudents);
      break;
  }
}
    });
  });
}

function updateTableHeaders() {
  const headerRow = document.getElementById('table-headers');

  const headers = getTableHeaders(state.currentType, state.currentStatus);

  headerRow.innerHTML = headers.map((header) => `<th>${header}</th>`).join('');
}

// Fetch + Render Dashboard Data
async function loadDashboard() {
  try {
    updateTableHeaders();
    const endpoint = getEndpoint(state.currentType, state.currentStatus);

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch dashboard data: ${response.status}`);
    }

    const data = await response.json();

    // FETCH COMPLETE DATA FOR COUNTS
    const allEndpoint =
      state.currentType === 'teacher' ? '/dashboard/admin/teachers' : '/dashboard/admin/students';

    const allData = await fetchDashboardData(allEndpoint);


    state.currentData = extractDataByTypeAndStatus(data, state.currentType, state.currentStatus);

    if (state.currentType === 'teacher') {
      admin.allTeachers = state.currentData;
      admin.verifiedTeachers = admin.allTeachers.filter((m) => m.is_verified == true);
      admin.unverifiedTeachers = admin.allTeachers.filter((m) => m.is_verified == false);

      updateStatusCounts(
        admin.allTeachers.length,
        admin.verifiedTeachers.length,
        admin.unverifiedTeachers.length,
      );

        appendAllTeachers(state.currentData);
      } else {
        admin.allStudents = state.currentData;
        admin.verifiedStudents = admin.allStudents.filter((m) => m.admin_verified === true && m.is_verified === true);
        admin.unverifiedStudents = admin.allStudents.filter((m) => !m.admin_action);
        admin.rejectedStudents = admin.allStudents.filter((m) => m.admin_action === true && m.admin_verified === false);

        updateStatusCounts(admin.allStudents.length,
           admin.verifiedStudents.length,
           admin.unverifiedStudents.length,
          admin.rejectedStudents.length
          );

appendAllStudents(state.currentData);
    }
  } catch (error) {
    console.error('Dashboard Load Error:', error);
  }
}

//UNVERIFY LOGIC
//TEACHER
export async function verifyTeacher(id, isVerified) {
  await fetch(`/dashboard/admin/verify_teacher/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      is_verified: isVerified,
    }),
  });

  await loadDashboard();
}
//STUDENT
export async function verifyStudent(id, isVerified) {
  await fetch(`/dashboard/admin/verify_student/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      is_verified: isVerified,
    }),
  });

  await loadDashboard();
}
export async function fetchDashboardData(endpoint) {
  try {
    const response = await fetch(endpoint);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      throw new Error(`Failed to load dashboard data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    logout();
    return null;
  }
}

//VERIFY LOGIC
//TEACHER
export async function unverifyTeacher(id) {
  await fetch(`/dashboard/admin/unverify_teacher/${id}`, {
    method: 'PUT',
  });

  await loadDashboard();
}
//STUDENT
export async function unverifyStudent(id) {
  await fetch(`/dashboard/admin/unverify_student/${id}`, {
    method: 'PUT',
  });

  await loadDashboard();
}

//SEARCH FUNCTIONALITIES
function setupSearch() {
  const searchInput = document.getElementById('searchInput');

  searchInput.addEventListener('input', (e) => {
    const filtered = filterData(state.currentData, state.currentType, e.target.value);

    if (state.currentType === 'teacher') {
      appendAllTeachers(filtered, {
        verifyTeacher,
        unverifyTeacher,
      });
    } else {
      appendAllStudents(filtered, {
        verifyStudent,
        unverifyStudent,
      });
    }
  });
  // AUTO FOCUS SEARCH WHEN USER STARTS TYPING
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

async function initDashboard() {
  teacherBtn = document.querySelector('[data-type="teacher"]');
  studentBtn = document.querySelector('[data-type="student"]');
  statusBtns = document.querySelectorAll('[data-status]');

  setupNavigation();
  updateActiveButton();
  setupStatusNavigation();
  updateActiveStatus();
  await loadDashboard();
  setupSearch();
}

document.addEventListener('DOMContentLoaded', initDashboard);
