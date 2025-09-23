// Import only the functions we need from commons.js
import { renderDashboardHeader, getInitials, getRandomNamedColor } from '../../Common/js/commons.js';

// Data storage
let currentData = [];
let currentType = 'teacher'; // teacher or student
let currentStatus = 'unverified'; // all, verified or unverified

// Initialize admin dashboard
function initializeAdminDashboard() {
  console.log('Admin Dashboard Initialized');
  
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
      } else if (currentStatus === 'all') {
        endpoint = '/dashboard/admin/teachers';
      }
    } else {
      // Student endpoints would go here
      endpoint = '/dashboard/student/data'; // placeholder
    }
    
    const response = await fetch(endpoint);
    if (response.ok) {
      const data = await response.json();
      
      if (currentType === 'teacher') {
        if (currentStatus === 'unverified') {
          currentData = data.teachers || [];
        } else if (currentStatus === 'verified') {
          // Filter only verified teachers
          currentData = (data.teachers || []).filter(t => t.is_verified);
        } else if (currentStatus === 'all') {
          // Show all teachers regardless of verification status
          currentData = data.teachers || [];
        }
      } else {
        currentData = data.students || [];
      }
      
      renderCurrentData();
    } else {
      console.error('Failed to load data');
      showEmptyState('Failed to load data');
    }
  } catch (error) {
    console.error('Error loading data:', error);
    showEmptyState('Error loading data');
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
      headers = ['Name', 'Email', 'Phone', 'Branch', 'Join Date', 'Actions'];
    } else if (currentStatus === 'verified') {
      headers = ['Name', 'Email', 'Status', 'Students', 'Join Date', 'Actions'];
    } else if (currentStatus === 'all') {
      headers = ['Name', 'Email', 'Status', 'Students', 'Join Date', 'Actions'];
    }
  } else {
    headers = ['Name', 'Email', 'Roll No', 'Teacher', 'Status', 'Actions'];
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
      } else if (currentStatus === 'verified' || currentStatus === 'all') {
        tr.innerHTML = renderAllTeacherRow(item);
      }
    } else {
      tr.innerHTML = renderStudentRow(item);
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
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td>${teacher.phone || 'N/A'}</td>
    <td>${teacher.branch || 'N/A'}</td>
    <td>${new Date(teacher.createdAt).toLocaleDateString()}</td>
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
  } else {
    actionButtons = `
      <button class="icon-btn view-btn" onclick="viewTeacherDetails('${teacher._id}')" title="View Details">
        <i class="fas fa-eye"></i>
      </button>
    `;
  }
  
  return `
    <td>
      <div class="contact-info">
        <div class="avatar ${getRandomNamedColor()}">${getInitials(teacher.name || 'Teacher')}</div>
        <div class="contact-details">
          <h4>${teacher.name || 'Unknown'}</h4>
        </div>
      </div>
    </td>
    <td>${teacher.email || 'N/A'}</td>
    <td><span class="badge ${statusClass}">${statusText}</span></td>
    <td>${teacher.students ? teacher.students.length : 0} students</td>
    <td>${new Date(teacher.createdAt).toLocaleDateString()}</td>
    <td>
      <div class="admin-actions">
        ${actionButtons}
      </div>
    </td>
  `;
}

// Render student row (placeholder)
function renderStudentRow(student) {
  return `
    <td colspan="6" class="loading">Student management coming soon...</td>
  `;
}

// Show empty state message
function showEmptyState(message) {
  const tbody = document.getElementById('dataTableBody');
  tbody.innerHTML = `<tr><td colspan="6" class="loading">${message}</td></tr>`;
}

// Verify teacher function
async function verifyTeacher(teacherId, isVerified) {
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
      
      // Show success message
      alert(`Teacher ${isVerified ? 'approved' : 'rejected'} successfully!`);
    } else {
      alert('Failed to update teacher verification status');
    }
  } catch (error) {
    console.error('Error verifying teacher:', error);
    alert('Error updating teacher verification status');
  }
}

// View teacher details (placeholder)
function viewTeacherDetails(teacherId) {
  alert(`Viewing teacher details for ID: ${teacherId}`);
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  
  if (currentData.length > 0) {
    const filteredData = currentData.filter(item => 
      item.name?.toLowerCase().includes(searchTerm) ||
      item.email?.toLowerCase().includes(searchTerm) ||
      (currentType === 'teacher' && item.branch?.toLowerCase().includes(searchTerm))
    );
    
    // Temporarily update current data for rendering
    const originalData = [...currentData];
    currentData = filteredData;
    renderCurrentData();
    currentData = originalData; // Restore original data
  }
});

// Make functions globally available
window.verifyTeacher = verifyTeacher;
window.viewTeacherDetails = viewTeacherDetails;

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeAdminDashboard();
});

// Export functions for potential future use
window.adminDashboard = {
  loadCurrentView,
  verifyTeacher
};
