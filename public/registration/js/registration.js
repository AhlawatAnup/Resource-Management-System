// Get URL parameters
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Fetch teachers from server
const assignedTeacherSelect = document.getElementById("assignedTeacher");
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

// Get the role from query parameters
const role = getQueryParam("role");
const studentFields = document.getElementById("studentFields");
const teacherSelect = document.getElementById("assignedTeacher");
const rollNumberInput = document.getElementById("rollNumber");

// Configure form based on role
if (role === "student") {
  studentFields.style.display = "block";
  teacherSelect.required = true;
  rollNumberInput.required = true;
} else if (role === "teacher") {
  studentFields.style.display = "none";
} else {
  studentFields.style.display = "none";
}

// Handle form submission
document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {};

    for (let [key, value] of formData.entries()) {
      if (value.trim() !== "") {
        data[key] = value;
      }
    }

    data.role = role || "general";

    console.log("Registration data:", data);
    // return;
    let payload = {};
    if (role === "student") {
      payload = {
        ...payload,
        name: document.getElementById("name").value,
        rollNo: document.getElementById("rollNumber").value,
        teacher_id: document.getElementById("assignedTeacher").value,
        branch: document.getElementById("branch").value,
      };
    } else if (role === "teacher") {
      payload.name = document.getElementById("name").value;
      payload.branch = document.getElementById("branch").value;
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Registration successful! Login Again");
        window.location.href = "/dashboard"; // redirect to home or login
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  });
