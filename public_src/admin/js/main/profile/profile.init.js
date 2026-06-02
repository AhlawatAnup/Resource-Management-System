//profile.init.js
import { showError, showSuccess, toggleLoading,initProfileUI  } from './profile.ui.js';
import { validateEmail, validateUsername, validatePassword } from './profile.util.js';
// import { setupDarkMode } from '../../../common/js/darkmode/darkmode.js';

// API CALLS
export async function fetchAdminProfile() {
  const res = await fetch('/dashboard/admin/details');
  return res.json();
}

export async function updateEmail(newEmail) {
  const res = await fetch('/dashboard/admin/update-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newEmail }),
  });
  return res.json();
}

export async function updateUsername(newUsername) {
  const res = await fetch('/dashboard/admin/update-profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsername }),
  });
  return res.json();
}

export async function changePassword(newPassword) {
  const res = await fetch('/dashboard/admin/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPassword }),
  });
  return res.json();
}


//HANDLERS
export async function handleEmailSubmit(newEmail, { displayEl, errorEl, modalEl, submitBtn }) {
  const error = validateEmail(newEmail);
  if (error) return showError(errorEl, error);

  toggleLoading(submitBtn, true);

  try {
    const res = await updateEmail(newEmail);
    if (res.success) {
      displayEl.textContent = res.changes?.email || newEmail;
      showSuccess(errorEl, res.message || 'Email updated successfully');
      setTimeout(() => (modalEl.style.display = 'none'), 1200);
    } else {
      showError(errorEl, res.error || 'Failed to update email');
    }
  } catch {
    showError(errorEl, 'Failed to update email');
  }
}

export async function handleUsernameSubmit(newUsername, { displayEl, errorEl, modalEl, submitBtn }) {
  const error = validateUsername(newUsername);
  if (error) return showError(errorEl, error);

  toggleLoading(submitBtn, true);

  try {
    const res = await updateUsername(newUsername);
    if (res.success) {
      displayEl.textContent = newUsername;
      showSuccess(errorEl, res.message || 'Username updated successfully');
      setTimeout(() => (modalEl.style.display = 'none'), 1200);
    } else {
      showError(errorEl, res.error || 'Failed to update username');
    }
  } catch {
    showError(errorEl, 'Failed to update username');
  }
}

export async function handlePasswordSubmit(
  newPassword,
  confirmPassword,
  { errorEl, modalEl, submitBtn },
) {
  const error = validatePassword(newPassword, confirmPassword);
  if (error) return showError(errorEl, error);

  toggleLoading(submitBtn, true);

  try {
    const res = await changePassword(newPassword);
    if (res.success) {
      showSuccess(errorEl, res.message || 'Password changed successfully');
      setTimeout(() => (modalEl.style.display = 'none'), 1200);
    } else {
      showError(errorEl, res.error || 'Failed to change password');
    }
  } catch {
    showError(errorEl, 'Failed to change password');
  }
}

const loadAdminProfile=async({ emailDisplay, usernameDisplay })=>{
     // ------------------ Load admin profile ------------------
  try {
    const data = await fetchAdminProfile();

    if (data.username) {
      usernameDisplay.textContent = data.username;
      emailDisplay.textContent = data.email;
    } else {
      showError(emailDisplay, data.error || 'Unable to fetch profile');
      showError(usernameDisplay, data.error || 'Unable to fetch profile');
    }
  } catch {
    showError(emailDisplay, 'Unable to fetch profile');
    showError(usernameDisplay, 'Unable to fetch profile');
  }
}
//INIT
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI and pass callbacks
  // setupDarkMode();
  const { emailDisplay, usernameDisplay } = initProfileUI({
    handleEmailSubmit,
    handleUsernameSubmit,
    handlePasswordSubmit,
  });
  loadAdminProfile({ emailDisplay, usernameDisplay });
});


