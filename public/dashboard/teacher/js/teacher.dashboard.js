// Import only the functions we need from commons.js
import { renderDashboardHeader, getInitials, getRandomNamedColor, formatDate, handleLogout } from '../../common/js/commons.js';

const student_data = [];
let teacherVerificationStatus = { is_verified: false };
async function getTeacherDashboardData() {
  try {
    const response = await fetch("/dashboard/teacher/data", {
      method: "GET", // change to 'POST' if needed
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // If teacher account not found (404), logout user
      if (response.status === 404) {
        handleLogout({ preventDefault: () => {} });
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log("Dashboard Data:", data);

    // Store teacher verification status
    teacherVerificationStatus = {
      is_verified: data.is_verified,
      verification_completed: data.verification_completed
    };

    renderDashboardHeader(data);
    renderTeacherProfile(data);

    //   GET STUDENT DATA - only if teacher is verified
    if (!teacherVerificationStatus.is_verified) {
      document.getElementById("contactTableBody").innerHTML =
        '<tr><td colspan="6" class="loading">Your account must be verified by admin to view students</td></tr>';
      return;
    }

    if (!data.students.length) {
      document.getElementById("contactTableBody").innerHTML =
        '<tr><td colspan="6" class="loading">No student registered with you</td></tr>';
      return;
    }

    for (let i = 0; i < data.students.length; i++) {
      await getStudentData(data.students[i]);
    }

    // return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    handleLogout({ preventDefault: () => {} });
  }
}

// call the function
getTeacherDashboardData();

// Function to render teacher profile information
function renderTeacherProfile(teacherData) {
  const profileSection = document.getElementById('teacher-profile-section');
  if (!profileSection) return;

  // Debug logging to understand teacher verification status
  // console.log('Teacher verification data:', {
  //   is_verified: teacherData.is_verified,
  //   verification_completed: teacherData.verification_completed,
  //   name: teacherData.name
  // });

  const verificationStatus = getVerificationStatus(teacherData);
  const statusClass = getStatusClass(teacherData);
  
  // Check if verification is pending to show informational note
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

// Function to get verification status text
function getVerificationStatus(teacher) {
  if (teacher.is_verified) {
    return '✓ Verified';
  } else if (teacher.verification_completed && !teacher.is_verified) {
    return '✗ Rejected';
  } else {
    return '⏳ Pending Verification';
  }
}

// Function to get status CSS class
function getStatusClass(teacher) {
  if (teacher.is_verified) {
    return 'verified';
  } else if (teacher.verification_completed && !teacher.is_verified) {
    return 'rejected';
  } else {
    return 'pending';
  }
}

// Function to get status color (deprecated - using CSS classes now)
function getStatusColor(isVerified) {
  return isVerified ? '#28a745' : '#ffc107';
}

// Function to determine student verification status from teacher's perspective
function getStudentVerificationStatusForTeacher(student) {
  // console.log('Student verification fields from teacher view:', {
  //   teacher_verified: student.teacher_verified,
  //   admin_verified: student.admin_verified,
  //   teacher_action: student.teacher_action,
  //   admin_action: student.admin_action,
  //   name: student.name
  // });

  // If both teacher and admin have verified
  if (student.teacher_verified && student.admin_verified) {
    return "Verified";
  }
  
  // If teacher has taken action (approved/rejected) but admin hasn't
  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return "Pending on Admin";
    } else {
      return "Declined by Teacher";
    }
  }
  
  // If teacher hasn't taken action yet
  if (!student.teacher_action) {
    return "Pending on Teacher";
  }
  
  // If admin has taken action
  if (student.admin_action) {
    if (student.admin_verified) {
      return "Verified";
    } else {
      return "Declined by Admin";
    }
  }
  
  // Default fallback
  return "Pending";
}

// Function to get CSS class for student verification status from teacher's perspective
function getStudentStatusClassForTeacher(student) {
  // If both teacher and admin have verified
  if (student.teacher_verified && student.admin_verified) {
    return "verified";
  }
  
  // If teacher has taken action but admin hasn't
  if (student.teacher_action && !student.admin_action) {
    if (student.teacher_verified) {
      return "pending-admin";
    } else {
      return "declined";
    }
  }
  
  // If teacher hasn't taken action yet
  if (!student.teacher_action) {
    return "pending-teacher";
  }
  
  // If admin has taken action
  if (student.admin_action) {
    if (student.admin_verified) {
      return "verified";
    } else {
      return "declined";
    }
  }
  
  // Default fallback
  return "pending";
}

async function getStudentData(stu_id) {
  try {
    const response = await fetch("/dashboard/teacher/student_data/" + stu_id, {
      method: "GET", // change to 'POST' if needed
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // console.log("Student Data:", data);
    render_students_table({
      ...data,
      avatarColor: getRandomNamedColor(),
      avatar: getInitials(data.name),
    });

    student_data.push({
      ...data,
      avatarColor: getRandomNamedColor(),
      avatar: getInitials(data.name),
    });

    // return data;
  } catch (error) {
    console.error("Error fetching student data:", error);
  }
}

// ENTER STUDENT DATA TO TABLE
function render_students_table(student) {
  const tbody = document.getElementById("contactTableBody");
  const tr = document.createElement("tr");
  
  // Get proper verification status for two-step process
  const verificationStatus = getStudentVerificationStatusForTeacher(student);
  const statusClass = getStudentStatusClassForTeacher(student);
  
  tr.innerHTML = `
                
                    <td>
                        <div class="contact-info">
                            <div class="avatar ${student.avatarColor}">${
    student.avatar
  }</div>
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
                           ${student.teacher_action ? 
                             '<span style="color: #666; font-style: italic;">Action Completed</span>' :
                             `<button class="icon-btn approve-btn" title="Approve Student" data-student-id="${student._id}" data-action="approve">
                                <i class="fa-solid fa-check"></i>
                             </button>
                             
                             <button class="icon-btn decline-btn" title="Decline Student" data-student-id="${student._id}" data-action="decline">
                               <i class="fa-solid fa-times"></i>
                              </button>`
                           }
                        </div>
                    </td>
        
            `;

  tbody.appendChild(tr);
}

// Event listeners
document.getElementById("searchInput").addEventListener("input", (e) => {
  // console.log(student_data);
  filter_student(e.target.value);
});

// Event delegation for approve/decline buttons
document.getElementById("contactTableBody").addEventListener("click", (e) => {
  const button = e.target.closest('.approve-btn, .decline-btn');
  if (button) {
    const studentId = button.getAttribute('data-student-id');
    const action = button.getAttribute('data-action');
    const isVerified = action === 'approve';
    updateStudentVerification(studentId, isVerified);
  }
});

let filtered_student = [];
function filter_student(searchTerm) {
  if (!student_data.length) {
    document.getElementById("contactTableBody").innerHTML =
      '<tr><td colspan="6" class="loading">No student registered with you</td></tr>';
    return;
  }

  const tbody = document.getElementById("contactTableBody");
  tbody.innerHTML = "";
  if (!searchTerm.trim()) {
    filtered_student = [...student_data];
  } else {
    const term = searchTerm.toLowerCase();
    filtered_student = student_data.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.rollNo.toLowerCase().includes(term)
    );
  }

  filtered_student.forEach((student) => {
    render_students_table(student);
  });
}

// Function to update student verification status
async function updateStudentVerification(studentId, isVerified) {
  // Check if teacher is verified
  if (!teacherVerificationStatus.is_verified) {
    showNotification('You must be verified by admin before approving students', 'error');
    return;
  }

  try {
    const action = isVerified ? 'approve' : 'decline';
    const result_confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${action} this student?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Approve`,
      cancelButtonText: 'Cancel',
      draggable: true,
      scrollbarPadding: false,
      heightAuto: false
    });
    
    if (!result_confirmation.isConfirmed) {
      return;
    }

    const response = await fetch(`/dashboard/teacher/verify_student/${studentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_verified: isVerified })
    });

    if (!response.ok) {
      throw new Error('Failed to update student verification');
    }

    const result = await response.json();
    // console.log('Verification updated:', result);

    // Update the student data in the local array
    const studentIndex = student_data.findIndex(s => s._id === studentId);
    if (studentIndex !== -1) {
      student_data[studentIndex].teacher_verified = isVerified;
      student_data[studentIndex].teacher_action = true; // Mark as completed
    }

    // Re-render the row with updated data
    const studentRow = document.querySelector(`[data-student-id="${studentId}"]`)?.closest('tr');
    if (studentRow && studentIndex !== -1) {
      const tbody = document.getElementById("contactTableBody");
      const newTr = document.createElement("tr");
      newTr.innerHTML = studentRow.innerHTML; // Copy original structure
      
      // Update with fresh data
      const updatedStudent = student_data[studentIndex];
      const verificationStatus = getStudentVerificationStatusForTeacher(updatedStudent);
      const statusClass = getStudentStatusClassForTeacher(updatedStudent);
      
      // Replace status badge
      const statusBadge = newTr.querySelector('.badge');
      if (statusBadge) {
        statusBadge.textContent = verificationStatus;
        statusBadge.className = `badge ${statusClass}`;
      }
      
      // Replace action buttons
      const buttonContainer = newTr.querySelector('.owner-info');
      if (buttonContainer) {
        buttonContainer.innerHTML = '<span style="color: #666; font-style: italic;">Action Completed</span>';
      }
      
      tbody.replaceChild(newTr, studentRow);
    }

    // Show success message
    showNotification(`Student ${isVerified ? 'approved' : 'declined'} successfully!`, 'success');

  } catch (error) {
    console.error('Error updating student verification:', error);
    showNotification('Failed to update student verification. Please try again.', 'error');
  }
}

// Function to show popup toast notifications
function showNotification(message, type) {
  // Create notification element
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

  // Add to page
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// // Navigation functionality for sidebar buttons
// document.addEventListener('DOMContentLoaded', function() {
//   const viewRequestsNav = document.getElementById('view-requests-nav');
//   const homeNav = document.getElementById('home-nav');

//   if (viewRequestsNav) {
//     viewRequestsNav.addEventListener('click', function(e) {
//       e.preventDefault();
//       window.location.href = '/dashboard/teacher/view-requests.html';
//     });
//   }

//   if (homeNav) {
//     homeNav.addEventListener('click', function(e) {
//       e.preventDefault();
//       window.location.href = '/dashboard/teacher/teacher.dashboard.html';
//     });
//   }
// });
