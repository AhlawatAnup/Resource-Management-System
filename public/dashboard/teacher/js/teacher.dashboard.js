// Import only the functions we need from commons.js
import { renderDashboardHeader, getInitials, getRandomNamedColor } from '../../Common/js/commons.js';

const student_data = [];
async function getTeacherDashboardData() {
  try {
    const response = await fetch("/dashboard/teacher/data", {
      method: "GET", // change to 'POST' if needed
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dashboard Data:", data);

    renderDashboardHeader(data);

    //   GET STUDENT DATA
    if (!data.students.length) {
      document.getElementById("contactTableBody").innerHTML =
        '<tr><td colspan="5" class="loading">No student registered with you</td></tr>';
      return;
    }

    for (let i = 0; i < data.students.length; i++) {
      await getStudentData(data.students[i]);
    }

    // return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }
}

// call the function
getTeacherDashboardData();

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
    console.log("Student Data:", data);
    render_students_table({
      ...data,
      avatarColor: getRandomNamedColor(),
      avatar: getInitials(data.name),
      phone: "NA",
    });

    student_data.push({
      ...data,
      avatarColor: getRandomNamedColor(),
      avatar: getInitials(data.name),
      phone: "NA",
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
  tr.innerHTML = `
                
                    <td>
                        <div class="contact-info">
                            <div class="avatar ${student.avatarColor}">${
    student.avatar
  }</div>
                            <div class="contact-details">
                                <h4>${student.name}</h4>
                                <div class="contact-time">${new Date(
                                  student.createdAt
                                ).toUTCString()}</div>
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
                        <span class="badge ${student.is_verified}">${
    student.is_verified ? "Approved" : "Pending"
  }</span>
                    </td>
                    <td>
                        <div class="company-info">
                            <span>${student.branch.toUpperCase()}</span>
                        </div>
                    </td>
                    <td>
                        <div class="owner-info">
                           ${student.verification_completed ? 
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
  console.log(student_data);
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
      '<tr><td colspan="5" class="loading">No student registered with you</td></tr>';
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
  try {
    const action = isVerified ? 'approve' : 'decline';
    if (!confirm(`Are you sure you want to ${action} this student?`)) {
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
    console.log('Verification updated:', result);

    // Update the student data in the local array
    const studentIndex = student_data.findIndex(s => s._id === studentId);
    if (studentIndex !== -1) {
      student_data[studentIndex].is_verified = isVerified;
      student_data[studentIndex].verification_completed = true; // Mark as completed
    }

    // Replace buttons with "Action Completed" text
    const actionButtons = document.querySelectorAll(`[data-student-id="${studentId}"]`);
    const buttonContainer = actionButtons[0]?.parentElement;
    if (buttonContainer) {
      buttonContainer.innerHTML = '<span style="color: #666; font-style: italic;">Action Completed</span>';
    }

    // Update the status badge immediately
    const studentRow = actionButtons[0]?.closest('tr');
    if (studentRow) {
      const statusBadge = studentRow.querySelector('.badge');
      if (statusBadge) {
        statusBadge.textContent = isVerified ? 'Approved' : 'Declined';
        statusBadge.className = `badge ${isVerified}`;
      }
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
