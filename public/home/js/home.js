// Modal handling
const modal = document.getElementById("authModal");
const getStartedBtn = document.getElementById("getStartedBtn");
const closeBtn = document.getElementById("closeModal");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

// Open modal
getStartedBtn.addEventListener("click", () => {
  modal.style.display = "block";
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close modal if clicked outside
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// OTP Flow
async function sendOtp() {
  const role = document.getElementById("role").value;
  const email = document.getElementById("email").value;

  if (!email) {
    // alert("Please enter email");
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
      //   alert("OTP sent to your email!");
      document.getElementById("emailStep").style.display = "none";
      document.getElementById("otpStep").style.display = "block";
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
  const otp = document.getElementById("otp").value;

  if (!otp) {
    // alert("Enter OTP");
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

// Attach listeners
sendOtpBtn.addEventListener("click", sendOtp);
verifyOtpBtn.addEventListener("click", verifyOtp);
