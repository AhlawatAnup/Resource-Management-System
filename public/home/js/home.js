let is_request_otp = true;

// Role selector functionality
document.querySelectorAll(".role-option").forEach((option) => {
  option.addEventListener("click", function () {
    document
      .querySelectorAll(".role-option")
      .forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");

    const role = this.dataset.role;
    // console.log("Selected role:", role);
    updateFormForRole(role);
  });
});

function updateFormForRole(role) {
  const emailInput = document.getElementById("email");
  const emailWrapper = document.getElementById("email-wrapper");
  const adminLoginFields = document.getElementById("admin-login-fields");
  const otpField = document.getElementById("otp-field");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const teacherEmailNote = document.getElementById("teacher-email-note");
  
  const placeholders = {
    student: "student@example.com",
    teacher: "teacher@example.com",
    admin: "admin@example.com",
  };

  emailInput.placeholder = placeholders[role] || "your-email@example.com";
  
  // Reset form state
  is_request_otp = true;
  otpField.style.display = "none";
  
  if (role === "admin") {
    // Show admin login fields, hide email field
    emailWrapper.style.display = "none";
    adminLoginFields.style.display = "block";
    sendOtpBtn.innerHTML = "Login";
    teacherEmailNote.style.display = "none";
  } else {
    // Show email field for student/teacher, hide admin fields
    emailWrapper.style.display = "block";
    adminLoginFields.style.display = "none";
    sendOtpBtn.innerHTML = "Send OTP";
    
    // Show teacher email note only for teacher role
    if (role === "teacher") {
      teacherEmailNote.style.display = "block";
    } else {
      teacherEmailNote.style.display = "none";
    }
  }
}

// OTP Input functionality
const otpInputs = document.querySelectorAll(".otp-input");

otpInputs.forEach((input, index) => {
  input.addEventListener("input", function (e) {
    const value = e.target.value;

    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      e.target.value = "";
      return;
    }

    if (value) {
      this.classList.add("filled");
      // Move to next input
      if (index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    } else {
      this.classList.remove("filled");
    }

    checkOTPComplete();
  });

  input.addEventListener("keydown", function (e) {
    // Handle backspace
    if (e.key === "Backspace" && !this.value && index > 0) {
      otpInputs[index - 1].focus();
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      otpInputs[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  input.addEventListener("paste", function (e) {
    e.preventDefault();
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    const digits = paste.replace(/\D/g, "").slice(0, 6);

    digits.split("").forEach((digit, i) => {
      if (otpInputs[i]) {
        otpInputs[i].value = digit;
        otpInputs[i].classList.add("filled");
      }
    });

    checkOTPComplete();
  });
});

function checkOTPComplete() {
  const otp = Array.from(otpInputs)
    .map((input) => input.value)
    .join("");
  if (otp.length === 6) {
    // console.log("OTP Complete:", otp);
  }
}

// Form submission
document.querySelector(".login-form").addEventListener("submit", function (e) {
  e.preventDefault();

  //   const selectedRole = document.querySelector(".role-option.active").dataset
  //     .role;
  //   const email = document.getElementById("email").value;
  //   const otp = Array.from(otpInputs)
  //     .map((input) => input.value)
  //     .join("");

  //   if (otp.length !== 6) {
  //     alert("Please enter complete OTP");
  //     return;
  //   }

  //   console.log("Login attempt:", {
  //     role: selectedRole,
  //     email: email,
  //     otp: otp,
  //   });

  //   alert(
  //     `Login attempt as ${selectedRole} with email: ${email} and OTP: ${otp}`
  //   );
});

// Initialize
updateFormForRole("student");

// Admin Login functionality
async function adminLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  if (!username || !password) {
    Toastify({text: "Please enter both username and password", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    return;
  }

  // Disable button and show loading state
  sendOtpBtn.disabled = true;
  const originalText = sendOtpBtn.innerHTML;
  sendOtpBtn.innerHTML = "Logging in...";

  try {
    const res = await fetch("/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = data.redirect; // redirect to dashboard
    } else {
      // Re-enable button on error
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = originalText;
      Toastify({text: data.error || "Login failed", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    }
  } catch (err) {
    console.error("Error:", err);
    // Re-enable button on error
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = originalText;
    Toastify({text: "Something went wrong", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
  }
}

// SEND OTP
async function sendOtp() {
  const activeDiv = document.querySelector(".role-option.active");
  const role = activeDiv.getAttribute("data-role");
  // console.log(role);
  const email = document.getElementById("email").value;
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  if (!email) {
    Toastify({text: "Please enter your email address", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    return;
  }

  // Validate student email format
  if (role === "student" && !validateStudentEmail(email)) {
    Toastify({text: "Please enter a valid email address (e.g., example@domain.com)", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    return;
  }

  // Validate teacher email format
  if (role === "teacher" && !validateTeacherEmail(email)) {
    Toastify({text: "Teachers must use email addresses with pu.ac.in domain (e.g., example@pu.ac.in)", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    return;
  }

  // Disable button and show loading state
  sendOtpBtn.disabled = true;
  const originalText = sendOtpBtn.innerHTML;
  sendOtpBtn.innerHTML = "Sending OTP...";

  try {
    const res = await fetch("/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, role: role }),
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById("otp-field").style.display = "unset";
      document.getElementById("email-wrapper").style.display = "none";
      sendOtpBtn.innerHTML = "Verify OTP";
      sendOtpBtn.disabled = false; // Re-enable for OTP verification
      is_request_otp = false;
    } else {
      // Re-enable button on error
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = originalText;
      Toastify({text: data.error || "Failed to send OTP", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    }
  } catch (err) {
    console.error("Error:", err);
    // Re-enable button on error
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = originalText;
    Toastify({text: "Something went wrong", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
  }
}

async function verifyOtp() {
  const email = document.getElementById("email").value;
  const otp = Array.from(otpInputs)
    .map((input) => input.value)
    .join("");
  const sendOtpBtn = document.getElementById("sendOtpBtn");

  if (!otp) {
    Toastify({text: "Enter OTP", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    return;
  }

  // Disable button and show loading state
  sendOtpBtn.disabled = true;
  const originalText = sendOtpBtn.innerHTML;
  sendOtpBtn.innerHTML = "Verifying...";

  try {
    const res = await fetch("/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    if (res.ok) {
      //   alert("✅ Login successful!");
      window.location.href = data.redirect; // redirect to dashboard
    } else {
      // Re-enable button on error
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerHTML = originalText;
      Toastify({text: data.error || "Invalid OTP", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
    }
  } catch (err) {
    console.error("Error:", err);
    // Re-enable button on error
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerHTML = originalText;
    Toastify({text: "Something went wrong", duration: 3000, gravity: "top", position: "right", backgroundColor: "#ff6b6b"}).showToast();
  }
}

const sendOtpBtn = document.getElementById("sendOtpBtn");

sendOtpBtn.addEventListener("click", () => {
  const activeDiv = document.querySelector(".role-option.active");
  const role = activeDiv.getAttribute("data-role");
  
  if (role === "admin") {
    adminLogin();
  } else if (is_request_otp) {
    sendOtp();
  } else {
    verifyOtp();
  }
});

// Function to validate teacher email format
function validateTeacherEmail(email) {
  const teacherEmailRegex = /^[a-zA-Z0-9._%+-]+@pu\.ac\.in$/;
  return teacherEmailRegex.test(email);
  // const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  // return gmailRegex.test(email);
  // return true;
}

// Function to validate student email format
function validateStudentEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}