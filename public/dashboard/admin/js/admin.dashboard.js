// Import only the functions we need from commons.js
import { renderDashboardHeader, getInitials, getRandomNamedColor } from '../../Common/js/commons.js';

// Dummy data for demonstration (empty initially)
const users_data = [];

// Initialize admin dashboard
function initializeAdminDashboard() {
  console.log('Admin Dashboard Initialized');
  
  // Set admin welcome message
  const welcomeElement = document.getElementById('hello-user');
  if (welcomeElement) {
    welcomeElement.textContent = 'Hello, Admin';
  }
  
  // Initialize empty table
  updateUsersTable();
}

// Function to update the users table
function updateUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  
  if (!users_data.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="loading">No users data available</td></tr>';
    return;
  }
  
  // Clear existing content
  tbody.innerHTML = '';
  
  // Render each user (currently empty, ready for future implementation)
  users_data.forEach(user => {
    renderUserRow(user);
  });
}

// Function to render a single user row (placeholder for future use)
function renderUserRow(user) {
  const tbody = document.getElementById("usersTableBody");
  const tr = document.createElement("tr");
  
  tr.innerHTML = `
    <td>
      <div class="contact-info">
        <div class="avatar ${user.avatarColor || 'blue'}">${user.avatar || 'U'}</div>
        <div class="contact-details">
          <h4>${user.name || 'Unknown User'}</h4>
          <div class="contact-time">${user.email || 'No email'}</div>
        </div>
      </div>
    </td>
    <td>
      <span class="role-badge ${user.role}">${user.role || 'Unknown'}</span>
    </td>
    <td>
      <span class="badge ${user.status}">${user.status || 'Unknown'}</span>
    </td>
    <td>
      <div class="date-info">
        <span>${user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Unknown'}</span>
      </div>
    </td>
    <td>
      <div class="admin-actions">
        <button class="icon-btn view-btn" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button class="icon-btn edit-btn" title="Edit User">
          <i class="fas fa-edit"></i>
        </button>
      </div>
    </td>
  `;
  
  tbody.appendChild(tr);
}

// Search functionality
document.getElementById("searchInput").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  console.log('Searching for:', searchTerm);
  
  // Filter functionality (currently does nothing since users_data is empty)
  if (users_data.length > 0) {
    // Future implementation for filtering users
    const filteredUsers = users_data.filter(user => 
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchTerm)
    );
    // Re-render filtered results
  }
});

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
  initializeAdminDashboard();
});

// Export functions for potential future use
window.adminDashboard = {
  updateUsersTable,
  renderUserRow
};
