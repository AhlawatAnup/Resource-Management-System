// profile.js - Fetch and display admin details
function loadAdminProfile() {
  fetch('/dashboard/admin/details')
    .then(res => res.json())
    .then(data => {
      if (data.username) {
        document.getElementById('admin-username').textContent = data.username;
        document.getElementById('admin-name').textContent = data.name;
        document.getElementById('admin-email').textContent = data.email;
      } else {
        document.getElementById('profile-error').textContent = data.error || "Unable to fetch admin details.";
      }
    })
    .catch(() => {
      document.getElementById('profile-error').textContent = "Unable to fetch admin details.";
    });
}

// Call the function on page load
loadAdminProfile();

// Change Password Button Logic
document.addEventListener('DOMContentLoaded', function() {
  const changeBtn = document.getElementById('change-password-btn');
  const form = document.getElementById('change-password-form');
  const submitBtn = document.getElementById('submit-password-btn');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  let visible = false;
  if (changeBtn && form) {
    changeBtn.addEventListener('click', function() {
      if (!visible) {
        form.style.display = 'flex';
        visible = true;
      } else {
        form.style.display = 'none';
        visible = false;
      }
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const newPassword = newPasswordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
      const errorDiv = document.getElementById('profile-error');
      errorDiv.textContent = '';
      if (!newPassword || !confirmPassword) {
        errorDiv.textContent = 'Please fill both password fields.';
        return;
      }
      if (newPassword.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters.';
        return;
      }
      if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
      }
      fetch('/dashboard/admin/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newPassword })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          errorDiv.style.color = 'green';
          errorDiv.textContent = data.message;
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
          form.style.display = 'none';
          visible = false;
        } else {
          errorDiv.style.color = 'red';
          errorDiv.textContent = data.error || 'Failed to change password.';
        }
      })
      .catch(() => {
        errorDiv.style.color = 'red';
        errorDiv.textContent = 'Failed to change password.';
      });
    });
  }
});
