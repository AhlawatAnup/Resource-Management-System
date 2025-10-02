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
    
    if (data.teachers && data.teachers.length > 0) {
      data.teachers.forEach((t) => {
        const option = document.createElement("option");
        option.value = t._id;
        option.textContent = t.name || t.email;
        assignedTeacherSelect.appendChild(option);
      });
    } else {
      // No verified teachers available
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No verified teachers available";
      option.disabled = true;
      assignedTeacherSelect.appendChild(option);
      
      // Show a message to the user
      const teacherFormGroup = assignedTeacherSelect.closest('.form-group');
      if (teacherFormGroup && !teacherFormGroup.querySelector('.no-teachers-message')) {
        const message = document.createElement('div');
        message.className = 'no-teachers-message';
        message.style.cssText = 'color: #dc2626; font-size: 12px; margin-top: 5px; font-style: italic;';
        message.textContent = 'No verified teachers are currently available. Please contact the administration.';
        teacherFormGroup.appendChild(message);
      }
    }
  } catch (err) {
    console.error("Failed to load teachers", err);
    // Show error in the dropdown
    assignedTeacherSelect.innerHTML = '<option value="">Error loading teachers</option>';
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

    const submitBtn = document.querySelector(".submit-btn");
    
    // Disable button and show loading state
    submitBtn.disabled = true;
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "Signing up...";

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
      const selectedTeacher = document.getElementById("assignedTeacher").value;
      
      // Check if a teacher is selected
      if (!selectedTeacher) {
        // Re-enable button on validation error
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert("Please select a teacher to proceed with registration.");
        return;
      }
      
      payload = {
        ...payload,
        name: document.getElementById("name").value,
        rollNo: document.getElementById("rollNumber").value,
        teacher_id: selectedTeacher,
        branch: document.getElementById("branch").value,
        phone: document.getElementById("phone").value,
      };
    } else if (role === "teacher") {
      payload.name = document.getElementById("name").value;
      payload.branch = document.getElementById("branch").value;
      payload.phone = document.getElementById("phone").value;
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
        // Re-enable button on error
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        alert(data.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      // Re-enable button on error
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      alert("Something went wrong");
    }
  });
