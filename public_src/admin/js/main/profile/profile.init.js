//profile.init.js
// import { showError, showSuccess, toggleLoading, initProfileUI } from './profile.ui.js';
// import { validateEmail, validateUsername, validatePassword } from './profile.util.js';
// import { setupDarkMode } from '../../../../common/darkmode/darkmode.js';

// API CALLS
export async function fetchAdminProfile() {
  const res = await fetch('/dashboard/admin/details');
  return res.json();
}

export const loadAdminProfile = async ({ emailDisplay, usernameDisplay }) => {
  // ------------------ Load admin profile ------------------
  try {
    // console.log('inside loadAdminProfile function..', emailDisplay, usernameDisplay);
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
};

// //INIT
// document.addEventListener('DOMContentLoaded', async () => {
//   // Initialize UI and pass callbacks
// setupDarkMode();
//   const { emailDisplay, usernameDisplay } = initProfileUI({
//     handleEmailSubmit,
//     handleUsernameSubmit,
//     handlePasswordSubmit,
//   });
//   loadAdminProfile({ emailDisplay, usernameDisplay });
// });
