import { formatDate, getInitials } from '../../../common/js/commons.js';
import {
  getVerificationStatus,
  getStatusClass,
  getStudentVerificationStatusForTeacher,
  getStudentStatusClassForTeacher
} from '../teacher.utils.js';

// Render teacher profile
export function renderTeacherProfile(teacherData) {
  const profileSection = document.getElementById('teacher-profile-section');
  if (!profileSection) return;

  const verificationStatus = getVerificationStatus(teacherData);
  const statusClass = getStatusClass(teacherData);

  const isPending = !teacherData.is_verified && !teacherData.verification_completed;

  profileSection.innerHTML = `
    <div class="teacher-profile-card">
      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div class="teacher-avatar">
          ${getInitials(teacherData.name || 'Teacher')}
        </div>
        <div style="flex: 1; min-width: 300px;">
          <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 8px; flex-wrap: wrap;">
            <h2 style="margin: 0; color: #333; font-size: 1.5em;">${teacherData.name || 'Teacher'}</h2>
            <span class="verification-badge ${statusClass}">
              ${verificationStatus}
            </span>
          </div>

          ${isPending ? `
            <div class="pending-verification-note" style="
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              border-radius: 8px; 
              padding: 15px; 
              margin: 15px 0; 
              color: #856404;
              font-size: 0.95em;
              line-height: 1.5;
            ">
              <div style="font-weight: 600; margin-bottom: 8px; color: #b7770a;">
                📋 Verification Status
              </div>
              <div style="margin-bottom: 6px;">
                Your request is pending admin verification.
              </div>
              <div style="margin-bottom: 6px;">
                After approval, your name will appear in the student registration teacher list.
              </div>
              <div>
                Students will then be able to select you as their teacher.
              </div>
            </div>
          ` : ''}

          <div class="teacher-info-grid">
            <div><strong>Email:</strong> ${teacherData.email || 'N/A'}</div>
            <div><strong>Branch:</strong> ${teacherData.branch || 'N/A'}</div>
            <div><strong>Phone:</strong> ${teacherData.phone || 'N/A'}</div>
            <div><strong>Students:</strong> ${teacherData.students ? teacherData.students.length : 0}</div>
            <div><strong>Joined:</strong> ${formatDate(teacherData.createdAt)}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render single student row
export function renderStudentsTable(student) {
  const tbody = document.getElementById("contactTableBody");
  const tr = document.createElement("tr");

  const verificationStatus = getStudentVerificationStatusForTeacher(student);
  const statusClass = getStudentStatusClassForTeacher(student);

  tr.innerHTML = `
    <td>
      <div class="contact-info">
        <div class="avatar ${student.avatarColor}">${student.avatar}</div>
        <div class="contact-details">
          <h4>${student.name}</h4>
          <div class="contact-time">${formatDate(student.createdAt)}</div>
        </div>
      </div>
    </td>

    <td>
      <div class="contact-methods">
        <div class="email">${student.email}</div>
        <div class="phone">${student.phone}</div>
        <div class="phone">${student.rollNo}</div>
      </div>
    </td>

    <td>
      <div class="contact-details">
        <h5>${student.instituteName || 'N/A'}</h5>
        <div class="contact-time">${student.instituteAddress || 'N/A'}</div>
      </div>
    </td>

    <td>
      <span class="badge ${statusClass}">${verificationStatus}</span>
    </td>

    <td>
      <div class="company-info">
        <span>${student.branch.toUpperCase()}</span>
      </div>
    </td>

    <td>
      <div class="owner-info">
        ${student.teacher_action 
          ? '<span style="color: #666; font-style: italic;">Action Completed</span>'
          : `
            <button class="icon-btn approve-btn" title="Approve Student" data-student-id="${student._id}" data-action="approve">
              <i class="fa-solid fa-check"></i>
            </button>
            <button class="icon-btn decline-btn" title="Decline Student" data-student-id="${student._id}" data-action="decline">
              <i class="fa-solid fa-times"></i>
            </button>
          `}
      </div>
    </td>
  `;

  tbody.appendChild(tr);
}

// Toast notification
export function showNotification(message, type) {
  const notification = document.createElement('div');

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    ${type === 'success' ? 'background-color: #28a745;' : 'background-color: #dc3545;'}
  `;

  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}