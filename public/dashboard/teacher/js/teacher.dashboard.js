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
                           <button class="icon-btn" title="Edit">
                                <i class="fa-regular fa-check-square"></i>
                           </button>
                           
                           <button class="icon-btn" title="Delete">
                             <i class="fa-solid fa-trash"></i>
                            </button>
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
