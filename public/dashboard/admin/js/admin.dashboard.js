// Import only the functions we need from commons.js
import { renderDashboardHeader, getInitials, getRandomNamedColor, formatDate, logoutDirectly } from '../../common/js/commons.js';
import {registerServiceWorkerAndSubscribe} from '../../common/js/notification.js'
// Data storage
let currentData = [];
let currentType = 'teacher'; // teacher or student
let currentStatus = 'all'; // all, verified or unverified

// Initialize admin dashboard
function initializeAdminDashboard() {
  // console.log('Admin Dashboard Initialized');
  
  // Set up navigation
  setupNavigation();
  
  // Load initial data (unverified teachers)
  loadCurrentView();
}

// Set up navigation event listeners
function setupNavigation() {
  // Type navigation (Teacher/Student)
  const typeButtons = document.querySelectorAll('.nav-btn[data-type]');
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      typeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update current type
      currentType = btn.getAttribute('data-type');
      loadCurrentView();
    });
  });
  
  // Status navigation (Verified/Unverified)
  const statusButtons = document.querySelectorAll('.status-btn[data-status]');
  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      statusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update current status
      currentStatus = btn.getAttribute('data-status');
      loadCurrentView();
    });
  });
}

// Load current view based on type and status selection
async function loadCurrentView() {
  updatePageHeader();
  updateTableHeaders();
  
  try {
    let endpoint = '';
    if (currentType === 'teacher') {
      if (currentStatus === 'unverified') {
        endpoint = '/dashboard/admin/teachers/pending';
      } else if (currentStatus === 'verified') {
        endpoint = '/dashboard/admin/teachers';
      } else if (currentStatus === 'rejected') {
        endpoint = '/dashboard/admin/teachers/rejected';
      } else if (currentStatus === 'all') {
        endpoint = '/dashboard/admin/teachers';
      }
    } else {
      // Student endpoints
      if (currentStatus === 'unverified') {
        endpoint = '/dashboard/admin/students/pending';
      } else if (currentStatus === 'verified') {
        endpoint = '/dashboard/admin/students';
      } else if (currentStatus === 'rejected') {
        endpoint = '/dashboard/admin/students/rejected';
      } else if (currentStatus === 'all') {
        endpoint = '/dashboard/admin/students';
      }
    }
    
    const response = await fetch(endpoint);
    if (!response.ok) {
      // If admin account not found (404), logout user
      if (response.status === 404) {
        logoutDirectly();
        return;
      }
      throw new Error(`Failed to load dashboard data: ${response.status}`);
    }
    
    const data = await response.json();
      
      if (currentType === 'teacher') {
        if (currentStatus === 'unverified') {
          currentData = data.teachers || [];
        } else if (currentStatus === 'verified') {
          // Filter only verified teachers
          currentData = (data.teachers || []).filter(t => t.is_verified);
        } else if (currentStatus === 'rejected') {
          // For rejected, we'll get data from the rejected endpoint
          currentData = data.teachers || [];
        } else if (currentStatus === 'all') {
          // Show all teachers regardless of verification status
          currentData = data.teachers || [];
        }
      } else {
        if (currentStatus === 'unverified') {
          currentData = data.students || [];
        } else if (currentStatus === 'verified') {
          // Filter only verified students
          currentData = (data.students || []).filter(s => s.is_verified);
        } else if (currentStatus === 'rejected') {
          // For rejected, we'll get data from the rejected endpoint
          currentData = data.students || [];
        } else if (currentStatus === 'all') {
          // Show all students regardless of verification status
          currentData = data.students || [];
        }
      }
      
      renderCurrentData();
    } catch (error) {
      console.error('Error loading data:', error);
      logoutDirectly();
    }
}

// Update page header based on current selection
function updatePageHeader() {
  const title = document.getElementById('page-title');
  const subtitle = document.getElementById('page-subtitle');
  const countLabel = document.getElementById('current-label');
  
  const typeText = currentType === 'teacher' ? 'Teachers' : 'Students';
  let statusText = '';
  let subtitleText = '';
  
  if (currentStatus === 'all') {
    statusText = 'All';
    subtitleText = `Manage all ${currentType} records`;
  } else if (currentStatus === 'unverified') {
    statusText = 'Unverified';
    subtitleText = `Manage ${currentType} verification requests`;
  } else if (currentStatus === 'rejected') {
    statusText = 'Rejected';
    subtitleText = `View ${currentType}s rejected by admin or teacher`;
  } else {
    statusText = 'Verified';
    subtitleText = `Manage verified ${currentType} records`;
  }
  
  title.textContent = `${statusText} ${typeText}`;
  subtitle.textContent = subtitleText;
  countLabel.textContent = statusText;
}

// Update table headers based on current selection
function updateTableHeaders() {
  const headersContainer = document.getElementById('table-headers');
  
  let headers = [];
  if (currentType === 'teacher') {
    if (currentStatus === 'unverified') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Actions'];
    } else if (currentStatus === 'verified') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Students', 'Status', 'Actions'];
    } else if (currentStatus === 'rejected') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Students', 'Status', 'Actions'];
    } else if (currentStatus === 'all') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Students', 'Status', 'Actions'];
    }
  } else {
    if (currentStatus === 'unverified') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Roll No', 'Teacher', 'Institute', 'Status', 'Actions'];
    } else if (currentStatus === 'verified') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Roll No', 'Teacher', 'Institute', 'Status', 'Actions'];
    } else if (currentStatus === 'rejected') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Roll No', 'Teacher', 'Institute', 'Status', 'Actions'];
    } else if (currentStatus === 'all') {
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Roll No', 'Teacher', 'Institute', 'Status', 'Actions'];
    }
  }
  
  headersContainer.innerHTML = headers.map(header => `<th>${header}</th>`).join('');
}

// Render current data in table
function renderCurrentData() {
  const tbody = document.getElementById('dataTableBody');
  const countElement = document.getElementById('current-count');
  
  // Update count
  countElement.textContent = currentData.length;
  
  if (!currentData.length) {
    let message = '';
    if (currentStatus === 'all') {
      message = `No ${currentType}s found`;
    } else if (currentStatus === 'unverified') {
      message = `No pending ${currentType} verifications`;
    } else if (currentStatus === 'rejected') {
      message = `No rejected ${currentType}s found`;
    } else {
      message = `No verified ${currentType}s found`;
    }
    showEmptyState(message);
    return;
  }
  
  tbody.innerHTML = '';
  
  currentData.forEach(item => {
    const tr = document.createElement('tr');
    
    if (currentType === 'teacher') {
      if (currentStatus === 'unverified') {
        tr.innerHTML = renderUnverifiedTeacherRow(item);
      } else if (currentStatus === 'rejected') {
        tr.innerHTML = renderRejectedTeacherRow(item);
      } else if (currentStatus === 'verified' || currentStatus === 'all') {
        tr.innerHTML = renderAllTeacherRow(item);
      }
    } else {
      if (currentStatus === 'unverified') {
        tr.innerHTML = renderUnverifiedStudentRow(item);
      } else if (currentStatus === 'rejected') {
        tr.innerHTML = renderRejectedStudentRow(item);
      } else if (currentStatus === 'verified' || currentStatus === 'all') {
        tr.innerHTML = renderAllStudentRow(item);
      }
    }
    
    tbody.appendChild(tr);
  });
}

// Render unverified teacher row
function renderUnverifiedTeacherRow(teacher) {
  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${formatDate(teacher.createdAt)}
          </div>

        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>
      <div class="admin-actions">
        <button class="btn-approve" onclick="verifyTeacher('${teacher._id}', true)" title="Approve">
          <i class="fas fa-check"></i> Approve
        </button>
        <button class="btn-reject" onclick="verifyTeacher('${teacher._id}', false)" title="Reject">
          <i class="fas fa-times"></i> Reject
        </button>
      </div>
    </td>
  `;
}

// Render verified teacher row (for verified and all views)
function renderAllTeacherRow(teacher) {
  const statusClass = teacher.is_verified ? 'verified' : (teacher.verification_completed ? 'rejected' : 'pending');
  const statusText = teacher.is_verified ? 'Verified' : (teacher.verification_completed ? 'Rejected' : 'Pending');
  
  // Show approval/rejection buttons only for unverified teachers in "all" view
  let actionButtons = '';
  if (currentStatus === 'all' && !teacher.verification_completed) {
    actionButtons = `
      <button class="btn-approve" onclick="verifyTeacher('${teacher._id}', true)" title="Approve">
        <i class="fas fa-check"></i> Approve
      </button>
      <button class="btn-reject" onclick="verifyTeacher('${teacher._id}', false)" title="Reject">
        <i class="fas fa-times"></i> Reject
      </button>
    `;
  } else if (teacher.is_verified) {
    // Show unverify button for verified teachers
    actionButtons = `
      <button class="btn-reject" onclick="unverifyTeacher('${teacher._id}')" title="Unverify">
        <i class="fas fa-undo"></i> Unverify
      </button>
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
          <div class="contact-time">
            ${formatDate(teacher.createdAt)}
          </div>
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>${teacher.students ? teacher.students.length : 0}</td>
    <td><span class="badge ${statusClass}">${statusText}</span></td>
    <td>
      <div class="admin-actions">
        ${actionButtons}
      </div>
    </td>
  `;
}

// Render unverified student row (students pending admin approval)
function renderUnverifiedStudentRow(student) {
  // Get student status like in the All Students view
  const getStudentStatus = () => {
    if (!student.teacher_action) return { text: 'Pending on Teacher', class: 'pending' };
    if (!student.teacher_verified) return { text: 'Rejected by Teacher', class: 'rejected' };
    if (!student.admin_action) return { text: 'Pending on Admin', class: 'pending' };
    if (!student.admin_verified) return { text: 'Rejected by Admin', class: 'rejected' };
    return { text: 'Verified', class: 'verified' };
  };

  const status = getStudentStatus();

  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(student.name || 'Student')}</div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${formatDate(student.createdAt)}
          </div>
        </div>
      </div>
    </td>
    <td>${student.email || 'N/A'}</td>
    <td>${student.phone || 'N/A'}</td>
    <td>${student.branch || 'N/A'}</td>
    <td>${student.rollNo || 'N/A'}</td>
    <td>${student.teacher?.name || 'N/A'}</td>
    <td>
      <div class="institute-info">
        <div>${student.instituteName || 'N/A'}</div>
        <div class="contact-time">${student.instituteAddress || 'N/A'}</div>
      </div>
    </td>
    <td><span class="badge ${status.class}">${status.text}</span></td>
    <td>
      <div class="admin-actions">
        <button class="btn-approve" onclick="verifyStudent('${student._id}', true)" title="Approve">
          <i class="fas fa-check"></i> Approve
        </button>
        <button class="btn-reject" onclick="verifyStudent('${student._id}', false)" title="Reject">
          <i class="fas fa-times"></i> Reject
        </button>
      </div>
    </td>
  `;
}

// Render all student row (for verified and all views)
function renderAllStudentRow(student) {
  const getStudentStatus = () => {
    if (!student.teacher_action) return { text: 'Pending Teacher', class: 'pending' };
    if (!student.teacher_verified) return { text: 'Rejected by Teacher', class: 'rejected' };
    if (!student.admin_action) return { text: 'Pending Admin', class: 'pending' };
    if (!student.admin_verified) return { text: 'Rejected by Admin', class: 'rejected' };
    return { text: 'Verified', class: 'verified' };
  };

  const status = getStudentStatus();
  
  // Show approval/rejection buttons for students pending admin action
  let actionButtons = '';
  if (currentStatus === 'all' && !student.admin_action) {
    actionButtons = `
      <button class="btn-approve" onclick="verifyStudent('${student._id}', true)" title="Approve">
        <i class="fas fa-check"></i> Approve
      </button>
      <button class="btn-reject" onclick="verifyStudent('${student._id}', false)" title="Reject">
        <i class="fas fa-times"></i> Reject
      </button>
    `;
  } else if (student.admin_verified && student.admin_action && student.is_verified) {
    // Show unverify button for verified students
    actionButtons = `
      <button class="btn-reject" onclick="unverifyStudent('${student._id}')" title="Unverify">
        <i class="fas fa-undo"></i> Unverify
      </button>
    `;
  } else if (student.admin_action) {
    actionButtons = `<span class="action-completed">Action Completed</span>`;
  } else {
    actionButtons = ``;
  }
  
  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(student.name || 'Student')}</div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${formatDate(student.createdAt)}
          </div>
        </div>
      </div>
    </td>
    <td>${student.email || 'N/A'}</td>
    <td>${student.phone || 'N/A'}</td>
    <td>${student.branch || 'N/A'}</td>
    <td>${student.rollNo || 'N/A'}</td>
    <td>${student.teacher?.name || 'N/A'}</td>
    <td>
      <div class="institute-info">
        <div>${student.instituteName || 'N/A'}</div>
        <div class="contact-time">${student.instituteAddress || 'N/A'}</div>
      </div>
    </td>
    <td><span class="badge ${status.class}">${status.text}</span></td>
    <td>
      <div class="admin-actions">
        ${actionButtons}
      </div>
    </td>
  `;
}

// Render student row (placeholder - replaced above)
function renderStudentRow(student) {
  return renderAllStudentRow(student);
}

// Render rejected teacher row
function renderRejectedTeacherRow(teacher) {
  const statusText = teacher.is_verified ? 'Verified' : (teacher.verification_completed ? 'Rejected by Admin' : 'Pending');
  
  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${formatDate(teacher.createdAt)}
          </div>
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>${teacher.students ? teacher.students.length : 0} students</td>
    <td><span class="badge rejected">${statusText}</span></td>
    <td>
      <div class="admin-actions">
        <span class="action-completed">Action Completed</span>
      </div>
    </td>
  `;
}

// Render rejected student row
function renderRejectedStudentRow(student) {
  // Get student status like in the All Students view
  const getStudentStatus = () => {
    if (!student.teacher_action) return { text: 'Pending on Teacher', class: 'pending' };
    if (!student.teacher_verified) return { text: 'Rejected by Teacher', class: 'rejected' };
    if (!student.admin_action) return { text: 'Pending on Admin', class: 'pending' };
    if (!student.admin_verified) return { text: 'Rejected by Admin', class: 'rejected' };
    return { text: 'Verified', class: 'verified' };
  };

  const status = getStudentStatus();

  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(student.name || 'Student')}</div>
        <div class="contact-details">
          <h4>${student.name || 'Unknown'}</h4>
          <div class="contact-time">
            ${formatDate(student.createdAt)}
          </div>
        </div>
      </div>
    </td>
    <td>${student.email || 'N/A'}</td>
    <td>${student.phone || 'N/A'}</td>
    <td>${student.branch || 'N/A'}</td>
    <td>${student.rollNo || 'N/A'}</td>
    <td>${student.teacher?.name || 'N/A'}</td>
    <td>
      <div class="institute-info">
        <div>${student.instituteName || 'N/A'}</div>
        <div class="contact-time">${student.instituteAddress || 'N/A'}</div>
      </div>
    </td>
    <td><span class="badge ${status.class}">${status.text}</span></td>
    <td>
      <div class="admin-actions">
        <span class="action-completed">Action Completed</span>
      </div>
    </td>
  `;
}

// Show empty state message
function showEmptyState(message) {
  const tbody = document.getElementById('dataTableBody');
  tbody.innerHTML = `<tr><td colspan="9" class="loading">${message}</td></tr>`;
}

// Verify teacher function
async function verifyTeacher(teacherId, isVerified) {
  // Show confirmation dialog
  const action = isVerified ? 'approve' : 'reject';
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to ${action} this teacher profile?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: `Yes, ${action}`,
    cancelButtonText: 'Cancel',
    draggable: true
  });
  
  if (!result.isConfirmed) {
    return; // User cancelled the action
  }
  
  try {
    const response = await fetch(`/dashboard/admin/verify_teacher/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_verified: isVerified })
    });
    
    if (response.ok) {
      // Reload current view
      await loadCurrentView();
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: `Teacher ${isVerified ? 'approved' : 'rejected'} successfully!`,
        icon: 'success',
        draggable: true
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update teacher verification status',
        icon: 'error',
        draggable: true
      });
    }
  } catch (error) {
    console.error('Error verifying teacher:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Error updating teacher verification status',
      icon: 'error',
      draggable: true
    });
  }
}

// Verify student function
async function verifyStudent(studentId, isVerified) {
  // Show confirmation dialog
  const action = isVerified ? 'approve' : 'reject';
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to ${action} this student profile?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: `Yes, ${action}`,
    cancelButtonText: 'Cancel',
    draggable: true
  });
  
  if (!result.isConfirmed) {
    return; // User cancelled the action
  }
  
  try {
    const response = await fetch(`/dashboard/admin/verify_student/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_verified: isVerified })
    });
    
    if (response.ok) {
      // Reload current view
      await loadCurrentView();
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: `Student ${isVerified ? 'approved' : 'rejected'} successfully!`,
        icon: 'success',
        draggable: true
      });
    } else {
      const errorData = await response.json();
      Swal.fire({
        title: 'Error!',
        text: errorData.error || 'Failed to update student verification status',
        icon: 'error',
        draggable: true
      });
    }
  } catch (error) {
    console.error('Error verifying student:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Error updating student verification status',
      icon: 'error',
      draggable: true
    });
  }
}

// Unverify student function
async function unverifyStudent(studentId) {
  // Show confirmation dialog
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will unverify the student. This action can only be performed if the student has no allotted resources.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, unverify',
    cancelButtonText: 'Cancel',
    draggable: true
  });
  
  if (!result.isConfirmed) {
    return; // User cancelled the action
  }
  
  try {
    const response = await fetch(`/dashboard/admin/unverify_student/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Reload current view
      await loadCurrentView();
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Student unverified successfully!',
        icon: 'success',
        draggable: true
      });
    } else {
      const errorData = await response.json();
      // Show error message with SweetAlert2
      Swal.fire({
        title: 'Error!',
        text: errorData.error || 'Failed to unverify student',
        icon: 'error',
        draggable: true
      });
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire({
      title: 'Error!',
      text: 'An error occurred while unverifying student',
      icon: 'error',
      draggable: true
    });
  }
}

// Unverify teacher function
async function unverifyTeacher(teacherId) {
  // Show confirmation dialog
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will unverify the teacher and all their students. This action can only be performed if no student under this teacher has an allotted resource.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, unverify',
    cancelButtonText: 'Cancel',
    draggable: true
  });
  
  if (!result.isConfirmed) {
    return; // User cancelled the action
  }
  
  try {
    const response = await fetch(`/dashboard/admin/unverify_teacher/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Reload current view
      await loadCurrentView();
      
      // Show success message with SweetAlert2
      Swal.fire({
        title: 'Success!',
        text: data.message || 'Teacher and students unverified successfully!',
        icon: 'success',
        draggable: true
      });
    } else {
      const errorData = await response.json();
      
      // Check if there are students with allocated resources
      if (errorData.studentsWithResources && errorData.studentsWithResources.length > 0) {
        const studentList = errorData.studentsWithResources
          .map(s => `• ${s.rollNo} - ${s.name}`)
          .join('\n');
        
        Swal.fire({
          title: 'Cannot Unverify!',
          html: `
            <p>${errorData.error}</p>
            <br>
            <pre style="font-size: 0.8em; text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px; max-height: 200px; overflow-y: auto;">${studentList}</pre>
            <br>
            <p style="font-size: 0.8em; color: #666;">Please revoke their machine allocations before unverifying this teacher.</p>
          `,
          icon: 'error',
          draggable: true,
          width: '600px'
        });
      } else {
        Swal.fire({
          title: 'Cannot Unverify!',
          text: errorData.error || 'Failed to unverify teacher',
          icon: 'error',
          draggable: true
        });
      }
    }
  } catch (error) {
    console.error('Error unverifying teacher:', error);
    Swal.fire({
      title: 'Error!',
      text: 'Error unverifying teacher',
      icon: 'error',
      draggable: true
    });
  }
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  if (currentData.length > 0) {
    let filteredData;
    if (currentType === 'teacher') {
      filteredData = currentData.filter(item => 
        item.name?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm) ||
        item.branch?.toLowerCase().includes(searchTerm)
      );
    } else {
      filteredData = currentData.filter(item => 
        item.name?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm) ||
        item.rollNo?.toLowerCase().includes(searchTerm) ||
        item.teacher?.name?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Temporarily update current data for rendering
    const originalData = [...currentData];
    currentData = filteredData;
    renderCurrentData();
    currentData = originalData; // Restore original data
  }
});

// Make functions globally available
window.verifyTeacher = verifyTeacher;
window.verifyStudent = verifyStudent;
window.unverifyTeacher = unverifyTeacher;
window.unverifyStudent = unverifyStudent;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeAdminDashboard();
  registerServiceWorkerAndSubscribe(); //web-push
});

// Export functions for potential future use
window.adminDashboard = {
  loadCurrentView,
  verifyTeacher,
  verifyStudent,
  unverifyTeacher,
  unverifyStudent
};
