import {
  formatDate,
  getInitials,
  renderDashboardHeader,
} from '../../../../common/utils/commons.utils.js';
import { Teacher } from '../../teacher.class.js';
import { teacher } from '../../teacher.init.js';
import {
  getVerificationStatus,
  getStatusClass,
  getStudentVerificationStatusForTeacher,
  getStudentStatusClassForTeacher,
} from '../teacher.utils.js';
import Swal from 'sweetalert2';

async function handleDasboardLoad() {
  const teacherVerificationStatus = {
    is_verified: teacher.is_verified,
    verification_completed: teacher.verification_completed,
  };
  renderDashboardHeader(teacher);
  renderTeacherProfile(teacher);

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
  if (!teacher.students.length) {
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
  // for (let i = 0; i < teacher.students.length; i++) {
  //   await handleStudentFetch(teacher.students[i]);
  // }

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
}

// Render teacher profile
export function renderTeacherProfile(teacherData) {
  const teachername = document.getElementById('teacher-name');
  if (!teachername) return;
  teachername.innerHTML = `Hello, ${teacherData.name} | Teacher `;
  const profileSection = document.getElementById('teacher-profile-section');
  if (!profileSection) return;

  const verificationStatus = getVerificationStatus(teacherData);
  const statusClass = getStatusClass(teacherData);

  const isPending = !teacherData.is_verified && !teacherData.verification_completed;

  profileSection.innerHTML = `
    <div class="profile-card">
      <div style='display:flex; justify-content: space-between; width:100%'>
      <div class='profile-header'>
        <div class="profile-avatar">
          ${getInitials(teacherData.name || 'Teacher')}
        </div>

        <h2 class="profile-name">${teacherData.name || 'Teacher'}</h2>

         <span class="verification-badge ${statusClass}">
          ${verificationStatus}
         </span>
          
         </div>
           <button  class="theme-toggle" title="Dark Mode"  style='margin-top:6px; margin-bottom:6px'>
          <i id="theme-icon" class="fa fa-moon"></i>
        </button>
         </div>

          ${
            isPending
              ? `
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
          `
              : ''
          }

          <div class="profile-details-row">
            <span><strong>Email:</strong> ${teacherData.email || 'N/A'}</span>
            <span><strong>Branch:</strong> ${teacherData.branch || 'N/A'}</span>
            <span><strong>Phone:</strong> ${teacherData.phone || 'N/A'}</span>
            <span><strong>Students:</strong> ${teacherData.students ? teacherData.students.length : 0}</span>
            <span><strong>Joined:</strong> ${formatDate(teacherData.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
//Render Pending student row
export function renderPendingRequestsTable(student) {
  if (student.teacher_action) return;

  const tbody = document.getElementById('pendingRequestsTableBody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  const verificationStatus = getStudentVerificationStatusForTeacher(student);
  const statusClass = getStudentStatusClassForTeacher(student);
  // same table row creation code as renderStudentsTable
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
      <div class="owner-info" style='display:flex'>
        ${
          student.teacher_action
            ? '<span style="color: #666; font-style: italic;">Action Completed</span>'
            : `
            
            <div class='rms-button rms-action-approve' style='margin-right:4px;'>
            <button class="icon-btn approve-btn" title="Approve Student" data-student-id="${student._id}" data-action="approve">
              <i class="fa-solid fa-check"></i>
            </button>
            </div>
            <div class='rms-button rms-action-reject'>
            <button class="icon-btn decline-btn" title="Decline Student" data-student-id="${student._id}" data-action="decline">
              <i class="fa-solid fa-times"></i>
            </button>
            </div>
          `
        }
      </div>
    </td>
  `;

  tbody.appendChild(tr);
}

// Render single student row
export function renderStudentsTable(student) {
  const tbody = document.getElementById('contactTableBody');
  const tr = document.createElement('tr');

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
      <div class="owner-info" style='display:flex'>
        ${
          student.teacher_action
            ? '<span style="color: #666; font-style: italic;">Action Completed</span>'
            : `
            
            <div class='rms-button rms-action-approve' style='margin-right:4px;'>
            <button class="icon-btn approve-btn" title="Approve Student" data-student-id="${student._id}" data-action="approve">
              <i class="fa-solid fa-check"></i>
            </button>
            </div>
            <div class='rms-button rms-action-reject'>
            <button class="icon-btn decline-btn" title="Decline Student" data-student-id="${student._id}" data-action="decline">
              <i class="fa-solid fa-times"></i>
            </button>
            </div>
          `
        }
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

teacher.addEventListener('TEACHER_READY', () => {
  console.log('TEACHER_READY event triggered.');
  handleDasboardLoad();
});
