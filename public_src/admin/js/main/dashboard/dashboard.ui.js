// RENDER ALL TEACHERS
import {
  getTableHeaders,
  getPageHeaderContent,
  getEmptyMessage,
  getStudentStatus,
  getStudentStatusShort,
  getTeacherStatus,
} from '../../admin.utils.js';

import * as common_utils from '../../../../common/utils/commons.utils.js';

// const tableHeader=;
const dashboardTBody = document.getElementById('dashboard-tbody');
export async function appendAllTeachers(teachers) {
  dashboardTBody.innerHTML = ``;
  teachers.forEach((teacher) => {
    renderTeacherRow(teacher);
  });
  //
}

function renderTeacherRow(teacher, currentStatus, actions) {
  const teacherRow = document.createElement('tr');
  const { statusClass, statusText } = getTeacherStatus(teacher);

  let actionButtons = '';

  if (currentStatus === 'all' && !teacher.verification_completed) {
    actionButtons = `
      <button class="btn-approve">Approve</button>
      <button class="btn-reject">Reject</button>
    `;
  }

  if (teacher.is_verified) {
    actionButtons = `
      <button class="btn-reject">Unverify</button>
    `;
  } else {
    actionButtons = `<span class="action-completed">Action Completed</span>`;
  }

  teacherRow.innerHTML = `
    <td>
      <div class="contact-info">
        <div class="avatar ${common_utils.getRandomNamedColor()}">${common_utils.getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">${common_utils.formatDate(teacher.createdAt)}</div>
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

  dashboardTBody.appendChild(teacherRow);

  //   ADD LISTNERS
  const approve_btn = teacherRow.querySelector('.btn-approve');
  const reject_btn = teacherRow.querySelector('.btn-reject');

  approve_btn?.addEventListener('click', () => {
    unverify(teacher._id);
  });

  reject_btn?.addEventListener('click', () => {
    unverify(teacher._id);
  });
}

async function unverify(id) {
  console.log('Unverified Click : ', id);
}
