import { initEditProfileSidePanel } from './edit-profile.ui';
import { fetchAdminProfile, loadAdminProfile } from '../profile/profile.init';
import { initProfileUI } from '../profile/profile.ui.js';
import { validateEmail, validatePassword, validateUsername } from '../profile/profile.util.js';
import Toastify from 'toastify-js';

let originalUsername, originalEmail;
const editProfileSidePanel = document.getElementById('edit-profile-side-panel');

document.addEventListener('DOMContentLoaded', async () => {
  initEditProfileSidePanel();
  const username = document.getElementById('username');
  const email = document.getElementById('email');

  const data = await fetchAdminProfile();
  if (data.username) {
    username.value = data.username;
  }
  if (data.email) {
    email.value = data.email;
  }
  originalUsername = data.username;
  originalEmail = data.email;
});

const editProfileForm = document.getElementById('edit-profile-form');

editProfileForm.addEventListener('submit', async (e) => {
  try {
    e.preventDefault();

    const updatedUsername = document.getElementById('username').value.trim();
    const updatedEmail = document.getElementById('email').value.trim();
    const newPwd = document.getElementById('newPwd').value;
    const confirmPwd = document.getElementById('confirmPwd').value;

    if (updatedUsername !== originalUsername) {
      validateUsername(updatedUsername);
    }
    if (updatedEmail !== originalEmail) {
      validateEmail(updatedEmail);
    }

    if (newPwd.trim() !== '') {
      if (confirmPwd !== newPwd) {
        Toastify({
          text: 'fill in same password in new and confirm password fields!',
          duration: 3000,
          gravity: 'top',
          position: 'right',
          style: { background: '#ff6b6b' },
        }).showToast();

        return;
      }
      validatePassword(newPwd);
    }

    const payload = {
      newUsername: updatedUsername,
      newEmail: updatedEmail,
      newPassword: newPwd,
    };

    const response = await fetch('/dashboard/admin/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      Toastify({
        text: data.message,
        duration: 3000,
        gravity: 'top',
        direction: 'right',
        style: { background: '#ff6b6b' },
      }).showToast();

      editProfileSidePanel.classList.add('close');
      return;
    }

    Toastify({
      text: 'Admin profile updated successfully!' || data.message,
      duration: 3000,
      gravity: 'top',
      direction: 'right',
      style: { background: '#4CAF50' },
    }).showToast();
    editProfileSidePanel.classList.add('close');
    //re-initialise profile with updated username,email
    const { emailDisplay, usernameDisplay } = initProfileUI();
    loadAdminProfile({ usernameDisplay, emailDisplay });
  } catch (error) {
    Toastify({
      text: error.message,
      duration: 3000,
      gravity: 'top',
      direction: 'right',
      style: { background: '#ff6b6b' },
    }).showToast();
    editProfileSidePanel.classList.add('close');
  }
});
