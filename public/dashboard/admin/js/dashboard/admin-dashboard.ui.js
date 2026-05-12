// ui.js

import {
  getTableHeaders,
  getPageHeaderContent,
  getEmptyMessage,
  getStudentStatus,
  getStudentStatusShort,
  getTeacherStatus,
} from './admin-dashboard.utils.js';

import { getInitials, getRandomNamedColor, formatDate } from '../../../common/js/commons.js';


// -----------------------------
// Table Headers
// -----------------------------
export function renderTableHeaders(currentType, currentStatus) {
  const headersContainer = document.getElementById('table-headers');
  const headers = getTableHeaders(currentType, currentStatus);

  headersContainer.innerHTML = headers.map((h) => `<th>${h}</th>`).join('');
}

// -----------------------------
// Empty State
// -----------------------------
export function renderEmptyState(currentType, currentStatus) {
  const tbody = document.getElementById('dataTableBody');
  const message = getEmptyMessage(currentType, currentStatus);

  tbody.innerHTML = `<tr><td colspan="9" class="loading">${message}</td></tr>`;
}

// -----------------------------
// Main Table Renderer
// -----------------------------
export function renderTable({ data, currentType, currentStatus, actions }) {
  const tbody = document.getElementById('dataTableBody');

  if (!data.length) {
    renderEmptyState(currentType, currentStatus);
    return;
  }

  tbody.innerHTML = '';

  data.forEach((item) => {
    const tr = document.createElement('tr');

    if (currentType === 'teacher') {
      if (currentStatus === 'unverified') {
        tr.innerHTML = renderUnverifiedTeacherRow(item, actions);
      } else if (currentStatus === 'rejected') {
        tr.innerHTML = renderRejectedTeacherRow(item);
      } else {
        tr.innerHTML = renderAllTeacherRow(item, currentStatus, actions);
      }
    } else {
      if (currentStatus === 'unverified') {
        tr.innerHTML = renderUnverifiedStudentRow(item, actions);
      } else if (currentStatus === 'rejected') {
        tr.innerHTML = renderRejectedStudentRow(item);
      } else {
        tr.innerHTML = renderAllStudentRow(item, currentStatus, actions);
      }
    }

    tbody.appendChild(tr);
  });
}

// -----------------------------
// Teacher Rows
// -----------------------------
function renderUnverifiedTeacherRow(teacher, actions) {
  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">${formatDate(teacher.createdAt)}</div>
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>
      <div class="admin-actions">
        <button class="btn-approve" data-id="${teacher._id}" data-action="approve-teacher">Approve</button>
        <button class="btn-reject" data-id="${teacher._id}" data-action="reject-teacher">Reject</button>
      </div>
    </td>
  `;
}

function renderAllTeacherRow(teacher, currentStatus, actions) {
  const { statusClass, statusText } = getTeacherStatus(teacher);

  let actionButtons = '';

  if (currentStatus === 'all' && !teacher.verification_completed) {
    actionButtons = `
      <button class="btn-approve" data-id="${teacher._id}" data-action="approve-teacher">Approve</button>
      <button class="btn-reject" data-id="${teacher._id}" data-action="reject-teacher">Reject</button>
    `;
  } else if (teacher.is_verified) {
    actionButtons = `
      <button class="btn-reject" data-id="${teacher._id}" data-action="unverify-teacher">Unverify</button>
    `;
  } else {
    actionButtons = `<span class="action-completed">Action Completed</span>`;
  }

  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">${formatDate(teacher.createdAt)}</div>
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>${teacher.students ? teacher.students.length : 0}</td>
    <td><span class="badge ${statusClass}">${statusText}</span></td>
    <td><div class="admin-actions">${actionButtons}</div></td>
  `;
}

function renderRejectedTeacherRow(teacher) {
  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">${formatDate(teacher.createdAt)}</div>
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>${teacher.students ? teacher.students.length : 0}</td>
    <td><span class="badge rejected">Rejected</span></td>
    <td><span class="action-completed">Action Completed</span></td>
  `;
}

// -----------------------------
// Student Rows
// -----------------------------
function renderUnverifiedStudentRow(student, actions) {
  const status = getStudentStatus(student);

  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(student.name || 'Student')}</div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">${formatDate(student.createdAt)}</div>
        </div>
      </div>
    </td>
    <td>${student.email || 'N/A'}</td>
    <td>${student.phone || 'N/A'}</td>
    <td>${student.branch || 'N/A'}</td>
    <td>${student.rollNo || 'N/A'}</td>
    <td>${student.teacher?.name || 'N/A'}</td>
    <td>${student.instituteName || 'N/A'}</td>
    <td><span class="badge ${status.class}">${status.text}</span></td>
    <td>
      <div class="admin-actions">
        <button class="btn-approve" data-id="${student._id}" data-action="approve-student">Approve</button>
        <button class="btn-reject" data-id="${student._id}" data-action="reject-student">Reject</button>
      </div>
    </td>
  `;
}

function renderAllStudentRow(student, currentStatus, actions) {
  const status = getStudentStatusShort(student);

  let actionButtons = '';

  if (currentStatus === 'all' && !student.admin_action) {
    actionButtons = `
      <button class="btn-approve" data-id="${student._id}" data-action="approve-student">Approve</button>
      <button class="btn-reject" data-id="${student._id}" data-action="reject-student">Reject</button>
    `;
  } else if (student.admin_verified && student.admin_action && student.is_verified) {
    actionButtons = `
      <button class="btn-reject" data-id="${student._id}" data-action="unverify-student">Unverify</button>
    `;
  } else {
    actionButtons = `<span class="action-completed">Action Completed</span>`;
  }

  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(student.name || 'Student')}</div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">${formatDate(student.createdAt)}</div>
        </div>
      </div>
    </td>
    <td>${student.email || 'N/A'}</td>
    <td>${student.phone || 'N/A'}</td>
    <td>${student.branch || 'N/A'}</td>
    <td>${student.rollNo || 'N/A'}</td>
    <td>${student.teacher?.name || 'N/A'}</td>
    <td>${student.instituteName || 'N/A'}</td>
    <td><span class="badge ${status.class}">${status.text}</span></td>
    <td><div class="admin-actions">${actionButtons}</div></td>
  `;
}

function renderRejectedStudentRow(student) {
  const status = getStudentStatus(student);

  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(student.name || 'Student')}</div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">${formatDate(student.createdAt)}</div>
        </div>
      </div>
    </td>
    <td>${student.email || 'N/A'}</td>
    <td>${student.phone || 'N/A'}</td>
    <td>${student.branch || 'N/A'}</td>
    <td>${student.rollNo || 'N/A'}</td>
    <td>${student.teacher?.name || 'N/A'}</td>
    <td>${student.instituteName || 'N/A'}</td>
    <td><span class="badge ${status.class}">${status.text}</span></td>
    <td><span class="action-completed">Action Completed</span></td>
  `;
}
//Status Count
export function updateStatusCounts(data, currentType) {
  let items = [];

  if (currentType === 'teacher') {
    items = data.teachers || [];
  } else {
    items = data.students || [];
  }

  const all = items.length;

  const verified = items.filter((i) => i.is_verified).length || 0;

  const rejected = items.filter(
    (i) =>
      (i.verification_completed && !i.is_verified) ||
      (i.admin_action && !i.admin_verified)
  ).length || 0;

  const unverified = all - verified - rejected || 0;

  document.getElementById('all-count').textContent = all;
  document.getElementById('verified-count').textContent = verified;
  document.getElementById('rejected-count').textContent = rejected;
  document.getElementById('unverified-count').textContent = unverified;
}
