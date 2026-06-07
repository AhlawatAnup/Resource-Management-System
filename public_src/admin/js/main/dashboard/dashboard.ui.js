// RENDER ALL TEACHERS
import {
  getTableHeaders,
  getPageHeaderContent,
  getEmptyMessage,
  getStudentStatus,
  getStudentStatusShort,
  getTeacherStatus,
} from './dashboard.utils.js';

import * as common_utils from '../../../../common/utils/commons.utils.js';

import {
  verifyStudent,
  unverifyStudent,
  verifyTeacher,
  unverifyTeacher,
} from './dashboard.init.js';

import Swal from 'sweetalert2';
import { admin } from '../../admin.js';

// const tableHeader=;
const dashboardTBody = document.getElementById('dashboard-tbody');

//TEACHERS
export function appendAllTeachers(teachers) {
  dashboardTBody.innerHTML = ``;
  teachers.forEach((teacher) => {
    renderTeacherRow(teacher);
  });
  //
}

function renderTeacherRow(teacher) {
  const teacherRow = document.createElement('tr');

  const { statusClass, statusText } = getTeacherStatus(teacher);

  let actionButtons = '';

  if (teacher.is_verified) {
    actionButtons = `
    <div class='rms-button rms-action-reject'>
      <button class="btn-reject ">Unverify</button>
      </div>
    `;
  } else if (!teacher.verification_completed) {
    actionButtons = `
      <div class='rms-button rms-action-approve'>
      <button class="btn-approve">Approve</button>
      </div>
      <div class='rms-button rms-action-reject'>
      <button class="btn-reject">Reject</button>
      </div>
    `;
  } else {
    actionButtons = `<button class="btn-delete">Delete</button>`;
  }

  teacherRow.innerHTML = `
    <td>
      <div class="contact-info">
        <div class="avatar ${common_utils.getRandomNamedColor()}">
          ${common_utils.getInitials(teacher.name || 'Teacher')}
        </div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${common_utils.formatDate(teacher.createdAt)}
          </div>
        </div>
      </div>
    </td>

    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>${teacher.students?.length || 0}</td>
    <td><span class="badge ${statusClass}">${statusText}</span></td>
    <td><div class="admin-actions">${actionButtons}</div></td>
  `;

  dashboardTBody.appendChild(teacherRow);

  attachTeacherListeners(teacherRow, teacher);
}

async function attachTeacherListeners(row, teacher) {
  const approveBtn = row.querySelector('.btn-approve');
  const rejectBtn = row.querySelector('.btn-reject');

  approveBtn?.addEventListener('click', async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this teacher profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
    });

    if (result.isConfirmed) {
      verifyTeacher(teacher._id, true);
    }
  });

  rejectBtn?.addEventListener('click', async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: teacher.is_verified
        ? 'Unverify this teacher and all its students?'
        : 'Do you want to reject this teacher profile?',
      icon: 'warning',
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    if (teacher.is_verified) {
      unverifyTeacher(teacher._id);
    } else {
      verifyTeacher(teacher._id, false);
    }
  });
}
// STUDENTS
export function appendAllStudents(students) {
  dashboardTBody.innerHTML = '';

  students.forEach((student) => {
    renderStudentRow(student);
  });
}

function renderStudentRow(student) {
  const studentRow = document.createElement('tr');

  const status = getStudentStatusShort(student);

  let actionButtons = '';

  if (student.admin_verified && student.admin_action && student.is_verified) {
    actionButtons = `
       <div class='rms-button rms-action-reject'>
      <button class="btn-reject ">Unverify</button>
      </div>
    `;
  } else if (!student.admin_action) {
    actionButtons = `
     <div class='rms-button rms-action-approve'>
      <button class="btn-approve">Approve</button>
      </div>
      <div class='rms-button rms-action-reject'>
      <button class="btn-reject">Reject</button>
      </div>
    `;
  } else {
    actionButtons = `
      <span class="actions-completed">Action Completed</span>
    `;
  }

  studentRow.innerHTML = `
    <td>
      <div class="contact-info">
        <div class="avatar ${common_utils.getRandomNamedColor()}">
          ${common_utils.getInitials(student.name || 'Student')}
        </div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${common_utils.formatDate(student.createdAt)}
          </div>
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

  dashboardTBody.appendChild(studentRow);

  attachStudentListeners(studentRow, student);
}

async function attachStudentListeners(row, student) {
  const approveBtn = row.querySelector('.btn-approve');
  const rejectBtn = row.querySelector('.btn-reject');

  approveBtn?.addEventListener('click', async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this student profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
    });

    if (result.isConfirmed) {
      verifyStudent(student._id, true);
    }
  });

  rejectBtn?.addEventListener('click', async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: student.is_verified ? 'Unverify this student?' : 'Reject this student profile?',
      icon: 'warning',
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    if (student.is_verified) {
      unverifyStudent(student._id);
    } else {
      verifyStudent(student._id, false);
    }
  });
}
//Status Count
const status_btns = document.querySelectorAll('.main.dashboard .status-btn span');
export function updateStatusCounts(all, verified, unverified, rejected = 0) {
  status_btns[0].textContent = all;
  status_btns[1].textContent = verified;
  status_btns[2].textContent = unverified;
  status_btns[3].textContent = rejected;
}
