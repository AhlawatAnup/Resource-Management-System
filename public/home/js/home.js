let is_request_otp = true;
// Role selector functionality
document.querySelectorAll(".role-option").forEach((option) => {
  option.addEventListener("click", function () {
    document
      .querySelectorAll(".role-option")
      .forEach((opt) => opt.classList.remove("active"));
    this.classList.add("active");

    const role = this.dataset.role;
    console.log("Selected role:", role);
    updateFormForRole(role);
  });
});

function updateFormForRole(role) {
  const emailInput = document.getElementById("email");
  const placeholders = {
    student: "student@example.com",
    teacher: "teacher@example.com",
    admin: "admin@example.com",
  };

  emailInput.placeholder = placeholders[role] || "your-email@example.com";
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
    console.log("OTP Complete:", otp);
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

// SEND OTP
async function sendOtp() {
  const activeDiv = document.querySelector(".role-option.active");
  const role = activeDiv.getAttribute("data-role");
  console.log(role);
  const email = document.getElementById("email").value;

  if (!email) {
    return;
  }

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
      document.getElementById("sendOtpBtn").innerHTML = "Verify OTP";
      is_request_otp = false;
    } else {
      alert(data.error || "Failed to send OTP");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong");
  }
}

async function verifyOtp() {
  const email = document.getElementById("email").value;
  const otp = Array.from(otpInputs)
    .map((input) => input.value)
    .join("");

  if (!otp) {
    alert("Enter OTP");
    return;
  }

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
      alert(data.error || "Invalid OTP");
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong");
  }
}

const sendOtpBtn = document.getElementById("sendOtpBtn");

sendOtpBtn.addEventListener("click", () => {
  if (is_request_otp) {
    sendOtp();
  } else {
    verifyOtp();
  }
});
