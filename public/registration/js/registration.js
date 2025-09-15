const roleSelect = document.getElementById("role");
const studentFields = document.getElementById("studentFields");
const teacherFields = document.getElementById("teacherFields");
const assignedTeacherSelect = document.getElementById("assignedTeacher");

// Fetch teachers from server
async function loadTeachers() {
  try {
    const res = await fetch("/auth/get-teachers");
    const data = await res.json();

    console.log(data);
    assignedTeacherSelect.innerHTML =
      '<option value="">Select a Teacher</option>';
    data.teachers.forEach((t) => {
      const option = document.createElement("option");
      option.value = t._id;
      option.textContent = t.name || t.email;
      assignedTeacherSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load teachers", err);
  }
}
loadTeachers();

// Toggle visible fields and required attributes
function toggleFields(role) {
  if (role === "student") {
    studentFields.style.display = "block";
    teacherFields.style.display = "none";

    // Student required
    document.getElementById("studentName").required = true;
    document.getElementById("rollNo").required = true;
    document.getElementById("department").required = true;
    document.getElementById("assignedTeacher").required = true;

    // Teacher not required
    document.getElementById("teacherEmail").required = false;
  } else if (role === "teacher") {
    studentFields.style.display = "none";
    teacherFields.style.display = "block";

    // Teacher required
    document.getElementById("teacherEmail").required = true;

    // Student not required
    document.getElementById("studentName").required = false;
    document.getElementById("rollNo").required = false;
    document.getElementById("department").required = false;
    document.getElementById("assignedTeacher").required = false;
  }
}

// Initial toggle based on default selection
toggleFields(roleSelect.value);

// Listen for role changes
roleSelect.addEventListener("change", () => toggleFields(roleSelect.value));

// Handle form submission
document
  .getElementById("registrationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const role = roleSelect.value;
    let payload = { role };

    if (role === "student") {
      payload = {
        ...payload,
        name: document.getElementById("studentName").value,
        rollNo: document.getElementById("rollNo").value,
        department: document.getElementById("department").value,
        teacher_id: document.getElementById("assignedTeacher").value,
      };
    } else if (role === "teacher") {
      payload.email = document.getElementById("teacherEmail").value;
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Registration successful!");
        window.location.href = "/dashboard"; // redirect to home or login
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  });
