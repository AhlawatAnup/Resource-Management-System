// profile.main.js
import { initProfileUI, showError } from './admin-profile.ui.js';
import { fetchAdminProfile } from './admin-profile.service.js';
import {
  onEmailSubmit,
  onUsernameSubmit,
  onPasswordSubmit
} from './admin-profile.handler.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI and pass callbacks
  const { emailDisplay, usernameDisplay } = initProfileUI({
    onEmailSubmit,
    onUsernameSubmit,
    onPasswordSubmit
  });

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
});