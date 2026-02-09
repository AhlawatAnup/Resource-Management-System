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

    // console.log(data);
    assignedTeacherSelect.innerHTML =
      '<option value="">Select a Teacher</option>';
    
    if (data.teachers && data.teachers.length > 0) {
      data.teachers.forEach((t) => {
        const option = document.createElement("option");
        option.value = t._id;
        option.textContent = t.name;
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



// Get the role from query parameters
const role = getQueryParam("role");
const studentFields = document.getElementById("studentFields");
const teacherSelect = document.getElementById("assignedTeacher");
const rollNumberInput = document.getElementById("rollNumber");
const container = document.getElementById("pageContainer");

if (!role) {
  window.location.href = "/";
}

// Configure form based on role
function setStudentFieldState(isStudent) {
  const studentInputs = studentFields.querySelectorAll("input, select");
  studentInputs.forEach((el) => {
    if (isStudent) {
      el.disabled = false;
      if (el.id === "assignedTeacher" || el.id === "rollNumber" || el.id === "instituteName" || el.id === "instituteAddress") {
        el.required = true;
      }
    } else {
      el.required = false;
      el.disabled = true;
    }
  });
}

if (role === "student") {
  studentFields.style.display = "block";
  setStudentFieldState(true);
  container.style.display = "flex";
  loadTeachers();
} else if (role === "teacher") {
  studentFields.style.display = "none";
  setStudentFieldState(false);
  container.style.display = "flex";
} else {
  studentFields.style.display = "none";
  setStudentFieldState(false);
  window.location.replace("/");
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

    // console.log("Registration data:", data);
    // return;
    let payload = {};

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const instituteName = document.getElementById("instituteName").value.trim();
    const instituteAddress = document.getElementById("instituteAddress").value.trim();
    if (!/^[A-Za-z\s]+$/.test(name)) {
      Toastify({text: "Name should only contain letters and spaces.", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      Toastify({text: "Please enter a valid 10-digit phone number.", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      return;
    }

    if (role === "student") {
      const selectedTeacher = document.getElementById("assignedTeacher").value;
      
      // Check if a teacher is selected
      if (!selectedTeacher) {
        // Re-enable button on validation error
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        Toastify({text: "Please select a teacher to proceed with registration.", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
        return;
      }
      const rollNo = document.getElementById("rollNumber").value.trim();
      if (!/^[A-Za-z0-9]+$/.test(rollNo)) {
        Toastify({text: "Roll number should only contain letters and numbers.", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        return;
      }

      
      payload = {
        ...payload,
        name: document.getElementById("name").value,
        rollNo: document.getElementById("rollNumber").value,
        teacher_id: selectedTeacher,
        branch: document.getElementById("branch").value,
        phone: phone,
        instituteName: instituteName,
        instituteAddress: instituteAddress,
      };
    } else if (role === "teacher") {
      payload.name = document.getElementById("name").value;
      payload.branch = document.getElementById("branch").value;
      payload.phone = phone;
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Redirecting to dashboard...',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "/dashboard";
        });
      } else {
        // Re-enable button on error
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        Toastify({text: data.error || "Registration failed", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
      }
    } catch (err) {
      console.error(err);
      // Re-enable button on error
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      Toastify({text: "Something went wrong", duration: 3000, gravity: "top", position: "center", backgroundColor: "#ff6b6b"}).showToast();
    }
  });
