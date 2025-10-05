// profile.js - Fetch and display admin details
function loadAdminProfile() {
  fetch('/dashboard/admin/details')
    .then(res => res.json())
    .then(data => {
      if (data.username) {
        document.getElementById('admin-username').textContent = data.username;
        // document.getElementById('admin-name').textContent = data.name;
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

document.addEventListener('DOMContentLoaded', function() {
  // Email Modal Logic
  const editEmailBtn = document.getElementById('edit-email-btn');
  const emailModal = document.getElementById('edit-email-modal');
  const closeEmailModal = document.getElementById('close-email-modal');
  const submitEmailBtn = document.getElementById('submit-email-btn');
  const cancelEmailBtn = document.getElementById('cancel-email-btn');
  const newEmailInput = document.getElementById('new-email-input');
  const adminEmailSpan = document.getElementById('admin-email');
  const emailErrorDiv = document.getElementById('email-error');

  if (editEmailBtn && emailModal) {
    editEmailBtn.addEventListener('click', function() {
      emailModal.style.display = 'flex';
      newEmailInput.value = adminEmailSpan.textContent;
      emailErrorDiv.textContent = '';
    });
  }
  if (closeEmailModal && emailModal) {
    closeEmailModal.addEventListener('click', function() {
      emailModal.style.display = 'none';
    });
  }
  if (cancelEmailBtn && emailModal) {
    cancelEmailBtn.addEventListener('click', function(e) {
      e.preventDefault();
      emailModal.style.display = 'none';
    });
  }
  if (submitEmailBtn) {
    submitEmailBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const newEmail = newEmailInput.value.trim();
      emailErrorDiv.textContent = '';
      if (!newEmail) {
        emailErrorDiv.textContent = 'Please enter a new email.';
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
        emailErrorDiv.textContent = 'Please enter a valid email address.';
        return;
      }
      fetch('/dashboard/admin/change-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newEmail })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          emailErrorDiv.style.color = 'green';
          emailErrorDiv.textContent = data.message;
          adminEmailSpan.textContent = data.email;
          setTimeout(() => { emailModal.style.display = 'none'; }, 1200);
        } else {
          emailErrorDiv.style.color = 'red';
          emailErrorDiv.textContent = data.error || 'Failed to update email.';
        }
      })
      .catch(() => {
        emailErrorDiv.style.color = 'red';
        emailErrorDiv.textContent = 'Failed to update email.';
      });
    });
  }

  // Change Password Modal Logic
  const changeBtn = document.getElementById('change-password-btn');
  const passwordModal = document.getElementById('change-password-modal');
  const closePasswordModal = document.getElementById('close-password-modal');
  const submitPasswordBtn = document.getElementById('submit-password-btn');
  const cancelPasswordBtn = document.getElementById('cancel-password-btn');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const passwordErrorDiv = document.getElementById('password-error');

  if (changeBtn && passwordModal) {
    changeBtn.addEventListener('click', function() {
      passwordModal.style.display = 'flex';
      newPasswordInput.value = '';
      confirmPasswordInput.value = '';
      passwordErrorDiv.textContent = '';
    });
  }
  if (closePasswordModal && passwordModal) {
    closePasswordModal.addEventListener('click', function() {
      passwordModal.style.display = 'none';
    });
  }
  if (cancelPasswordBtn && passwordModal) {
    cancelPasswordBtn.addEventListener('click', function(e) {
      e.preventDefault();
      passwordModal.style.display = 'none';
    });
  }
  if (submitPasswordBtn) {
    submitPasswordBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const newPassword = newPasswordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();
      passwordErrorDiv.textContent = '';
      if (!newPassword || !confirmPassword) {
        passwordErrorDiv.textContent = 'Please fill both password fields.';
        return;
      }
      if (newPassword.length < 6) {
        passwordErrorDiv.textContent = 'Password must be at least 6 characters.';
        return;
      }
      if (newPassword !== confirmPassword) {
        passwordErrorDiv.textContent = 'Passwords do not match.';
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
          passwordErrorDiv.style.color = 'green';
          passwordErrorDiv.textContent = data.message;
          newPasswordInput.value = '';
          confirmPasswordInput.value = '';
          setTimeout(() => { passwordModal.style.display = 'none'; }, 1200);
        } else {
          passwordErrorDiv.style.color = 'red';
          passwordErrorDiv.textContent = data.error || 'Failed to change password.';
        }
      })
      .catch(() => {
        passwordErrorDiv.style.color = 'red';
        passwordErrorDiv.textContent = 'Failed to change password.';
      });
    });
  }
});
